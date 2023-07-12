import { component$, $, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  getValue,
  getValues,
  insert,
  remove,
  reset,
  setValues,
  useForm,
  zodForm$,
} from "@modular-forms/qwik";
import { denoiseContextDocs, prepareContextDocsToEmbed } from "./helpers";
import busboy from "busboy";
import { Readable } from "stream";
import { normalizedDocsSchema, partySchema } from "~/utils/schemas";
import { z } from "zod";
import {
  DEFAULT_BO_PARTY,
  partyMap,
  placeholderPartyMap,
} from "~/utils/constants";
import TextInput from "~/components/TextInput";
import {
  storeContextDocsToMDb,
  storeContextDocsToVectorStore,
  getConextDocsFromMDb,
  getContextDocsFromVectorStore,
} from "./server";
import SelectInput from "~/components/SelectInput";

import type { QwikChangeEvent } from "@builder.io/qwik";
import type {
  RequestEvent,
  RequestEventAction,
  RequestHandler,
} from "@builder.io/qwik-city";
import type { ContextDoc, NormalizedDoc, Party } from "~/utils/types";
import Button from "~/components/Buttons/Button";
import { backofficeGuard } from "../helpers";

const pdfMimeType = "application/pdf";

const getPdfFileBlob = (event: RequestEventAction): Promise<Blob | null> =>
  new Promise((resolve, reject) => {
    if (!event.request.body) return resolve(null);

    // @ts-ignore
    const converted = Readable.fromWeb(event.request.body);

    const bb = busboy({
      headers: Object.fromEntries(event.request.headers.entries()),
    });

    let blobData: Buffer | undefined;

    bb.on("file", (_name, file, info) => {
      if (info.mimeType !== pdfMimeType) resolve(null);

      file.on("data", (chunk) => {
        if (!blobData) {
          blobData = chunk;
        } else {
          blobData = Buffer.concat([blobData, chunk]);
        }
      });

      file.on("end", () => {
        if (blobData) {
          resolve(new Blob([blobData], { type: info.mimeType }));
        } else {
          resolve(null);
        }
      });
    });

    bb.on("error", reject);

    converted.pipe(bb);
  });

export const useFileToContextDocs = routeAction$(
  async (_, event: RequestEventAction) => {
    if (!event.request.body) {
      return event.fail(400, {
        message: "No file provided",
      });
    }

    let docs: NormalizedDoc[];
    try {
      const fileBlob = await getPdfFileBlob(event);

      if (!fileBlob) {
        return event.fail(400, {
          message: "No file or wrong format provided",
        });
      }

      const loader = new PDFLoader(fileBlob);
      const rawDocs = await loader.load();
      docs = denoiseContextDocs(rawDocs);
    } catch (err: any) {
      return event.fail(400, {
        message: "Failed to parse the file",
        err: JSON.stringify(err),
      });
    }

    return { docs };
  }
);

const contextDocsFormSchema = z.object({
  docs: normalizedDocsSchema,
  party: partySchema,
});

export type ContextDocsForm = z.infer<typeof contextDocsFormSchema>;

const emptyDoc = {
  metadata: {
    chapterName: "",
    pageNumber: 0,
  },
  pageContent: "",
};

/**
 * Removes chapterName separated by ### from pageContent
 * as it was added only for better similarity search results.
 */
const purifyContextDoc = (doc: ContextDoc) => ({
  ...doc,
  pageContent: doc.pageContent.split("###")[1] || doc.pageContent,
});

export const onRequest: RequestHandler = async (event: RequestEvent) =>
  backofficeGuard(event);

export default component$(() => {
  const fileToContextDocs = useFileToContextDocs();
  const isLoadingSignal = useSignal<boolean>(false);

  const onFileChange = $(async (e: QwikChangeEvent<HTMLInputElement>) => {
    const inputtedFile = e.target.files?.[0];
    if (!inputtedFile || inputtedFile.type !== pdfMimeType) {
      console.error(`File type ${inputtedFile?.type || ""} is not supported`);
      return;
    }

    const fileFormData = new FormData();
    fileFormData.append("file", inputtedFile);
    await fileToContextDocs.submit(fileFormData);
  });

  const onItemInsert = $(({ index }: { index: number }) => {
    insert(contextDocsForm, "docs", {
      value: emptyDoc,
      at: index,
    });
  });

  const [contextDocsForm, { Form: ContextDocsForm, Field, FieldArray }] =
    useForm<ContextDocsForm>({
      loader: { value: { docs: [], party: DEFAULT_BO_PARTY as Party } },
      fieldArrays: ["docs"],
      validate: zodForm$(contextDocsFormSchema),
    });

  useVisibleTask$(() => {
    const docs = localStorage.getItem("docs");

    if (!docs) return;

    setValues(contextDocsForm, "docs", JSON.parse(docs));
  });

  useVisibleTask$(({ track }) => {
    track(() => fileToContextDocs.value);

    if (!fileToContextDocs.value?.docs?.length) return;

    reset(contextDocsForm, "docs");
    setValues(contextDocsForm, "docs", fileToContextDocs.value.docs);

    localStorage.setItem("docs", JSON.stringify(fileToContextDocs.value.docs));
  });

  // prevents from the upload fields' names duplication
  const inputId = `fileUpload-${new Date().getTime()}`;

  return (
    <div class="text-center flex flex-col gap-10">
      <Form>
        <input
          class="file-input w-full max-w-xs"
          onChange$={onFileChange}
          type="file"
          id={inputId}
          name="file"
          multiple
        />
      </Form>
      <ContextDocsForm class="flex flex-col gap-10">
        <div class="flex place-content-between">
          <Field name="party">
            {(field, props) => (
              <SelectInput
                class="max-w-xs"
                {...props}
                value={field.value}
                options={Object.values({
                  ...placeholderPartyMap,
                  ...partyMap,
                }).map(({ name: label, id: value }) => ({
                  label,
                  value,
                }))}
              />
            )}
          </Field>
          <div class="flex gap-4">
            <Button
              type="button"
              label="delete LS"
              variant="error"
              outlined
              disabled={isLoadingSignal.value}
              onClick$={() => {
                localStorage.removeItem("docs");
                reset(contextDocsForm, "docs");
              }}
            />
            <Button
              type="button"
              label="load MDB"
              variant="accent"
              outlined
              disabled={isLoadingSignal.value}
              onClick$={async () => {
                isLoadingSignal.value = true;
                const party = getValue(contextDocsForm, "party");
                const contextDocs = await getConextDocsFromMDb(party!);
                setValues(contextDocsForm, {
                  docs: contextDocs.map(purifyContextDoc),
                });
                localStorage.setItem("docs", JSON.stringify(contextDocs));
                isLoadingSignal.value = false;
              }}
            />
            <Button
              type="button"
              label="load VS"
              variant="accent"
              outlined
              disabled={isLoadingSignal.value}
              onClick$={async () => {
                isLoadingSignal.value = true;
                const party = getValue(contextDocsForm, "party");
                const contextDocs = await getContextDocsFromVectorStore(party!);
                setValues(contextDocsForm, {
                  docs: contextDocs.map(purifyContextDoc),
                });
                localStorage.setItem("docs", JSON.stringify(contextDocs));
                isLoadingSignal.value = false;
              }}
            />
            <Button
              type="button"
              label="save LS"
              variant="accent"
              outlined
              disabled={isLoadingSignal.value}
              onClick$={() => {
                localStorage.setItem(
                  "docs",
                  JSON.stringify(getValues(contextDocsForm, "docs"))
                );
              }}
            >
              save LS
            </Button>
            <Button
              type="button"
              label="store to MDB"
              variant="primary"
              outlined
              disabled={isLoadingSignal.value}
              onClick$={async () => {
                isLoadingSignal.value = true;

                const contextDocsToEmbed =
                  prepareContextDocsToEmbed(contextDocsForm);

                if (!contextDocsToEmbed) return;

                try {
                  await storeContextDocsToMDb(contextDocsToEmbed);
                } catch (err) {
                  console.error("something went wrong", err);
                }
                isLoadingSignal.value = false;
              }}
            />
            <Button
              type="button"
              label="store to VS"
              variant="primary"
              outlined
              disabled={isLoadingSignal.value}
              onClick$={async () => {
                isLoadingSignal.value = true;

                const contextDocsToEmbed =
                  prepareContextDocsToEmbed(contextDocsForm);

                if (!contextDocsToEmbed) return;

                try {
                  await storeContextDocsToVectorStore(contextDocsToEmbed);
                } catch (err) {
                  console.error("something went wrong", err);
                }
                isLoadingSignal.value = false;
              }}
            />
          </div>
        </div>
        <FieldArray name="docs">
          {(fieldArray) => (
            <div class="flex flex-col gap-12 text-sm items-center">
              {!!fieldArray.items.length && (
                <>
                  <div>{fieldArray.items.length} docs</div>
                  <Button
                    type="button"
                    label="+"
                    variant="accent"
                    size="xs"
                    outlined
                    class="btn btn-secodnary btn-outline btn-xs"
                    onClick$={() => onItemInsert({ index: 0 })}
                  />
                </>
              )}
              {fieldArray.items.map((item, index) => {
                return (
                  <>
                    <div
                      key={item}
                      class="flex flex-col items-center w-full gap-2"
                    >
                      <p class="text-left w-full">Document {index + 1}</p>
                      <div class="flex place-content-between gap-4 w-full">
                        <Field name={`docs.${index}.metadata.chapterName`}>
                          {(field, props) => (
                            <TextInput
                              {...props}
                              class="w-full"
                              inputClass="text-md"
                              value={field.value}
                              error={field.error}
                              type="text"
                              placeholder="Chapter name"
                            />
                          )}
                        </Field>

                        <Field
                          name={`docs.${index}.metadata.pageNumber`}
                          type="number"
                        >
                          {(field, props) => (
                            <TextInput
                              {...props}
                              value={field.value}
                              error={field.error}
                              type="number"
                              placeholder="Page number"
                              inputClass="text-right text-md"
                              class=" w-32"
                            />
                          )}
                        </Field>
                      </div>

                      <Field name={`docs.${index}.pageContent`}>
                        {(field, props) => (
                          <textarea
                            {...props}
                            class="textarea-primary textarea w-full resize-none border-border bg-secondary p-6 text-sm placeholder:opacity-50 disabled:border-border disabled:bg-base-100"
                            rows={15}
                            value={field.value}
                            placeholder="Page content"
                          />
                        )}
                      </Field>

                      <div class="text-left w-full flex gap-2">
                        <Button
                          type="button"
                          label="delete"
                          variant="error"
                          size="xs"
                          outlined
                          class="btn btn-error btn-outline max-w-xs btn-xs"
                          onClick$={() =>
                            remove(contextDocsForm, "docs", {
                              at: index,
                            })
                          }
                        />

                        <Button
                          type="button"
                          label="save all to ls"
                          variant="accent"
                          size="xs"
                          outlined
                          disabled={isLoadingSignal.value}
                          onClick$={() => {
                            localStorage.setItem(
                              "docs",
                              JSON.stringify(getValues(contextDocsForm, "docs"))
                            );
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      label="+"
                      variant="accent"
                      size="xs"
                      outlined
                      class="btn btn-secodnary btn-outline btn-xs"
                      disabled={isLoadingSignal.value}
                      onClick$={() => onItemInsert({ index: index + 1 })}
                    />
                  </>
                );
              })}
            </div>
          )}
        </FieldArray>
      </ContextDocsForm>
    </div>
  );
});
