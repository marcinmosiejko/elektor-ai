import { component$, $, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { Form, routeAction$ } from "@builder.io/qwik-city";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  getValue,
  getValues,
  insert,
  remove,
  replace,
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
  clearAllCache,
} from "./server";
import SelectInput from "~/components/SelectInput";

import type { QwikChangeEvent } from "@builder.io/qwik";
import type { Session } from "@auth/core/types";
import type {
  RequestEvent,
  RequestEventAction,
  RequestHandler,
} from "@builder.io/qwik-city";
import type { ContextDoc, NormalizedDoc, Party } from "~/utils/types";

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

export const onRequest: RequestHandler = async (event: RequestEvent) => {
  const session: Session | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date()) {
    throw event.redirect(
      302,
      `/api/auth/signin?callbackUrl=${event.url.pathname}`
    );
  }

  if (session.user?.email === event.env.get("ADMIN_EMAIL")) return;

  throw event.redirect(302, `/`);
};

export default component$(() => {
  const fileToContextDocs = useFileToContextDocs();
  const isLoadingSignal = useSignal<boolean>(false);

  const onChange = $(async (e: QwikChangeEvent<HTMLInputElement>) => {
    const inputtedFile = e.target.files?.[0];
    if (!inputtedFile || inputtedFile.type !== pdfMimeType) {
      console.error(`File type ${inputtedFile?.type || ""} is not supported`);
      return;
    }

    const fileFormData = new FormData();
    fileFormData.append("file", inputtedFile);
    await fileToContextDocs.submit(fileFormData);
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
          onChange$={onChange}
          type="file"
          id={inputId}
          name="file"
          multiple
        />
      </Form>
      <div class="flex">
        <button
          type="button"
          class="btn btn-error btn-outline max-w-xs"
          disabled={isLoadingSignal.value}
          onClick$={async () => {
            isLoadingSignal.value = true;
            await clearAllCache();
            isLoadingSignal.value = false;
          }}
        >
          clear all cache
        </button>
      </div>
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
            <button
              type="button"
              class="btn btn-error btn-outline max-w-xs"
              disabled={isLoadingSignal.value}
              onClick$={() => {
                localStorage.removeItem("docs");
                reset(contextDocsForm, "docs");
              }}
            >
              delete LS
            </button>
            <button
              type="button"
              class="btn btn-accent btn-outline max-w-xs"
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
            >
              load MDB
            </button>
            <button
              type="button"
              class="btn btn-accent btn-outline max-w-xs"
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
            >
              load VS
            </button>

            <button
              type="button"
              class="btn btn-accent btn-outline max-w-xs"
              disabled={isLoadingSignal.value}
              onClick$={() => {
                localStorage.setItem(
                  "docs",
                  JSON.stringify(getValues(contextDocsForm, "docs"))
                );
              }}
            >
              save LS
            </button>
            <button
              type="button"
              class="btn btn-primary btn-outline max-w-xs"
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
            >
              store to MDB
            </button>
            <button
              type="button"
              class="btn btn-primary btn-outline max-w-xs"
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
            >
              store to VS
            </button>
          </div>
        </div>
        <FieldArray name="docs">
          {(fieldArray) => (
            <div class="flex flex-col gap-12 text-sm items-center">
              {!!fieldArray.items.length && (
                <>
                  <div>{fieldArray.items.length} docs</div>
                  <button
                    class="btn btn-secodnary btn-outline max-w-xs btn-xs"
                    onClick$={() =>
                      insert(contextDocsForm, "docs", {
                        value: emptyDoc,
                        at: 0,
                      })
                    }
                  >
                    +
                  </button>
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
                        <button
                          class="btn btn-error btn-outline max-w-xs btn-xs"
                          onClick$={() =>
                            remove(contextDocsForm, "docs", {
                              at: index,
                            })
                          }
                        >
                          delete
                        </button>
                        <button
                          class="btn btn-secodnary btn-outline max-w-xs btn-xs"
                          onClick$={() => {
                            const curVal = getValues(contextDocsForm, "docs")[
                              index
                            ];
                            // PSL
                            // const mapka = {
                            //   ê: "ę",
                            //   " π ": "ą",
                            //   π: "ą",
                            //   æ: "ć",
                            //   "¿": "ż",
                            //   " ≥ ": "ł",
                            //   "≥": "ł",
                            //   œ: "ś",
                            //   ñ: "ń",
                            //   Ÿ: "ź",
                            // };

                            // PIS
                            const mapka = {
                              "- ": "",
                            };

                            let newPageContent = curVal?.pageContent;

                            if (!newPageContent) return;

                            for (const [key, value] of Object.entries(mapka)) {
                              newPageContent = newPageContent.replaceAll(
                                key,
                                value
                              );
                            }

                            replace(contextDocsForm, "docs", {
                              at: index,
                              // @ts-ignore
                              value: {
                                ...curVal,
                                pageContent: newPageContent,
                              },
                            });
                          }}
                        >
                          parse
                        </button>
                        <button
                          type="button"
                          class="btn btn-secodnary btn-outline max-w-xs btn-xs"
                          onClick$={() => {
                            localStorage.setItem(
                              "docs",
                              JSON.stringify(getValues(contextDocsForm, "docs"))
                            );
                          }}
                        >
                          save changes
                        </button>
                      </div>
                    </div>
                    <button
                      class="btn btn-secodnary btn-outline max-w-xs btn-xs"
                      onClick$={() =>
                        insert(contextDocsForm, "docs", {
                          value: emptyDoc,
                          at: index + 1,
                        })
                      }
                    >
                      +
                    </button>
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
