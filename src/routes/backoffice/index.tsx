import { component$, $, useVisibleTask$, useSignal } from "@builder.io/qwik";
import { Form } from "@builder.io/qwik-city";
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
  validate,
  zodForm$,
} from "@modular-forms/qwik";
import { denoiseContextDocs } from "./helpers";
import { normalizedDocsSchema, partySchema } from "~/utils/schemas";
import { z } from "zod";
import {
  DEFAULT_BO_PARTY,
  partyMap,
  placeholderPartyMap,
} from "~/utils/constants";
import TextInput from "~/components/TextInput";
import {
  storeContextDocs,
  getConextDocsFromMDB,
  getContextDocsFromVectorStore,
} from "./server";

import type { QwikChangeEvent } from "@builder.io/qwik";
import type { Session } from "@auth/core/types";
import type { RequestEvent, RequestHandler } from "@builder.io/qwik-city";
import type { Party } from "~/utils/types";
import SelectInput from "~/components/SelectInput";

const pdfMimeType = "application/pdf";

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
  const isLoading = useSignal<boolean>(false);

  const onChange = $(async (e: QwikChangeEvent<HTMLInputElement>) => {
    const inputtedFile = e.target.files?.[0];

    if (!inputtedFile || inputtedFile.type !== pdfMimeType) {
      console.error(`File type ${inputtedFile?.type || ""} is not supported`);
      return;
    }
    const blob = new Blob([inputtedFile]);
    const loader = new PDFLoader(blob);
    const rawDocs = await loader.load();
    const docs = denoiseContextDocs(rawDocs);

    reset(contextDocsForm, "docs");
    setValues(contextDocsForm, "docs", docs);

    localStorage.setItem("docs", JSON.stringify(docs));
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
              disabled={isLoading.value}
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
              disabled={isLoading.value}
              onClick$={async () => {
                isLoading.value = true;
                const party = getValue(contextDocsForm, "party");
                const contextDocs = await getConextDocsFromMDB(party!);
                setValues(contextDocsForm, { docs: contextDocs });
                localStorage.setItem("docs", JSON.stringify(contextDocs));
                isLoading.value = false;
              }}
            >
              load MDB
            </button>
            <button
              type="button"
              class="btn btn-accent btn-outline max-w-xs"
              disabled={isLoading.value}
              onClick$={async () => {
                isLoading.value = true;
                const party = getValue(contextDocsForm, "party");
                const contextDocs = await getContextDocsFromVectorStore(party!);
                setValues(contextDocsForm, { docs: contextDocs });
                localStorage.setItem("docs", JSON.stringify(contextDocs));
                isLoading.value = false;
              }}
            >
              load VS
            </button>

            <button
              type="button"
              class="btn btn-accent btn-outline max-w-xs"
              disabled={isLoading.value}
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
              disabled={isLoading.value}
              onClick$={async () => {
                isLoading.value = true;
                const parsedFormContextDocs = normalizedDocsSchema.safeParse(
                  getValues(contextDocsForm, "docs")
                );
                const party = getValue(contextDocsForm, "party");

                if (
                  !parsedFormContextDocs.success ||
                  !parsedFormContextDocs.data.length ||
                  !party
                ) {
                  validate(contextDocsForm);
                  return;
                }

                localStorage.setItem(
                  "docs",
                  JSON.stringify(parsedFormContextDocs.data)
                );

                const contextDocsToEmbed = Object.values(
                  parsedFormContextDocs.data
                ).map((doc, i) => {
                  return {
                    ...doc,
                    metadata: {
                      ...doc.metadata,
                      id: `${party}--${i + 1}`,
                      party,
                    },
                  };
                });
                try {
                  await storeContextDocs(contextDocsToEmbed);
                } catch (err) {
                  console.log("something went wrong", err);
                }
                isLoading.value = false;
              }}
            >
              store to MDB & VS
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

                            const mapka = {
                              ê: "ę",
                              " π ": "ą",
                              π: "ą",
                              æ: "ć",
                              "¿": "ż",
                              " ≥ ": "ł",
                              "≥": "ł",
                              œ: "ś",
                              ñ: "ń",
                              Ÿ: "ź",
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
