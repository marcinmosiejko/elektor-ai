import { component$, useSignal } from "@builder.io/qwik";
import { deleteItemFromCache, getAllCache, updateItemInCache } from "./server";
import { cacheFormSchema, cacheItemSchema } from "~/utils/schemas";
import {
  getValue,
  getValues,
  remove,
  setValues,
  useForm,
  zodForm$,
} from "@modular-forms/qwik";
import TextInput from "~/components/TextInput";
import Button from "~/components/Buttons/Button";
import { backofficeGuard } from "../helpers";

import type { z } from "zod";
import type { RequestEvent, RequestHandler } from "@builder.io/qwik-city";

export type CacheForm = z.infer<typeof cacheFormSchema>;

export const onRequest: RequestHandler = async (event: RequestEvent) =>
  backofficeGuard(event);

export default component$(() => {
  const isLoadingSignal = useSignal<boolean>(false);

  const [cacheForm, { Form: CacheForm, Field, FieldArray }] =
    useForm<CacheForm>({
      loader: { value: { cache: [] } },
      fieldArrays: ["cache"],
      validate: zodForm$(cacheFormSchema),
    });

  return (
    <div class="flex flex-col gap-10">
      <div class="flex gap-6">
        <Button
          type="button"
          label="clear all"
          variant="error"
          outlined
          disabled={isLoadingSignal.value}
          onClick$={async () => {
            // isLoadingSignal.value = true;
            // await clearAllCache();
            // isLoadingSignal.value = false;
          }}
        />
        <Button
          type="button"
          label="load all"
          variant="accent"
          outlined
          disabled={isLoadingSignal.value}
          onClick$={async () => {
            isLoadingSignal.value = true;

            const cache = await getAllCache();
            setValues(cacheForm, { cache });

            isLoadingSignal.value = false;
          }}
        />
      </div>
      <CacheForm class="flex flex-col gap-10">
        <FieldArray name="cache">
          {(fieldArray) => (
            <div class="flex flex-col gap-12 text-sm items-center">
              {fieldArray.items.map((item, index) => {
                return (
                  <>
                    <div
                      key={item}
                      class="flex flex-col items-center w-full gap-2"
                    >
                      <p class="text-left w-full flex gap-10">
                        <span>Cache #{index + 1}</span>
                        <Field
                          type="number"
                          name={`cache.${index}.searchCount`}
                        >
                          {(field) => <span>Search count: {field.value}</span>}
                        </Field>
                        <Field name={`cache.${index}.party`}>
                          {(field) => <span>Party: {field.value}</span>}
                        </Field>
                        <Field
                          type="string[]"
                          name={`cache.${index}.contextDocsIds`}
                        >
                          {(field) => (
                            <span>
                              Docs ids:{" "}
                              {field.value
                                ?.map((id) => id.split("--").at(1))
                                .join(" ")}
                            </span>
                          )}
                        </Field>
                        <Field name={`cache.${index}._id`}>
                          {(field) => <span>Id: {field.value}</span>}
                        </Field>
                      </p>

                      <Field name={`cache.${index}.question`}>
                        {(field, props) => (
                          <TextInput
                            {...props}
                            class="w-full"
                            inputClass="text-md"
                            value={field.value}
                            error={field.error}
                            type="text"
                          />
                        )}
                      </Field>

                      <Field name={`cache.${index}.answer`}>
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
                          label="remove item from db"
                          variant="error"
                          size="xs"
                          outlined
                          disabled={isLoadingSignal.value}
                          onClick$={async () => {
                            isLoadingSignal.value = true;

                            const id = getValue(
                              cacheForm,
                              `cache.${index}._id`
                            );

                            await deleteItemFromCache(id!);

                            remove(cacheForm, "cache", {
                              at: index,
                            });

                            isLoadingSignal.value = false;
                          }}
                        />
                        <Button
                          type="button"
                          label="update item in db"
                          variant="accent"
                          size="xs"
                          outlined
                          disabled={isLoadingSignal.value}
                          onClick$={async () => {
                            isLoadingSignal.value = true;

                            const cacheItems = getValues(cacheForm, "cache");
                            const cacheItem = cacheItems[index];
                            const parsedCacheItem =
                              cacheItemSchema.safeParse(cacheItem);

                            if (parsedCacheItem.success) {
                              await updateItemInCache(parsedCacheItem.data);
                            }

                            isLoadingSignal.value = false;
                          }}
                        />
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          )}
        </FieldArray>
      </CacheForm>
    </div>
  );
});
