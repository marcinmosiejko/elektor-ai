import {
  $,
  component$,
  useContext,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { DEFAULT_FO_PARTY, partyMap } from "~/utils/constants";
import { Image } from "@unpic/qwik";
import { QnAContext } from "~/context/qna";
import { questionSchema, partySchema } from "~/utils/schemas";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { setValue, useForm, validate, zodForm$ } from "@modular-forms/qwik";
import { z } from "zod";
import { ThemeContext } from "~/context/theme";
import TextInput from "~/components/TextInput";

import type { QnA } from "~/utils/types";
import SelectInput from "~/components/SelectInput";
import { SendIcon } from "lucide-qwik";

const formSchema = z.object({
  question: questionSchema,
  party: partySchema,
});

export type QuestionForm = z.infer<typeof formSchema>;

export default component$(
  ({ question: questionParam, party: partyParam }: QnA) => {
    const loc = useLocation();
    const nav = useNavigate();
    const themeSignal = useContext(ThemeContext);

    const { isGeneratingAnswer } = useContext(QnAContext);

    const [questionForm, { Form, Field }] = useForm<QuestionForm>({
      loader: { value: { question: "", party: DEFAULT_FO_PARTY } },
      validate: zodForm$(formSchema),
    });

    const onSubmit = $(({ question, party }: QuestionForm) => {
      const url = new URL(`${loc.url.origin}/qna/${party}`);
      url.searchParams.set("question", question);
      nav(url.href);
    });

    useTask$(({ track }) => {
      setValue(questionForm, "question", questionParam || "");
      setValue(questionForm, "party", partyParam);

      track(() => questionParam);
      track(() => partyParam);
    });

    useVisibleTask$(({ track }) => {
      questionParam && validate(questionForm, { shouldActive: false });

      track(() => questionParam);
    });

    return (
      <Form class="main-grid" onSubmit$={onSubmit}>
        <Field name="question">
          {(field, props) => {
            return (
              <div class="relative">
                <TextInput
                  {...props}
                  type="text"
                  value={field.value}
                  error={field.error}
                  placeholder="np. Jakie będą korzyści dla młodych?"
                  inputClass="h-16 pr-20"
                  disabled={isGeneratingAnswer}
                />
                <button
                  class="btn absolute top-2 right-2 p-4 cursor-pointer"
                  type="submit"
                >
                  <SendIcon class="h-4 w-4 rotate-[15deg]" />
                </button>
              </div>
            );
          }}
        </Field>
        <div class="flex gap-4 relative">
          <Field name="party">
            {(field, props) => {
              // @ts-ignore
              const partyData = partyMap[field.value!];
              return (
                <>
                  <SelectInput
                    {...props}
                    selectClass="h-16 pl-20"
                    value={field.value}
                    options={Object.values(partyMap).map(
                      ({ name: label, id: value }) => ({
                        label,
                        value,
                      })
                    )}
                    error={field.error}
                    disabled={isGeneratingAnswer}
                  />
                  <Image
                    class="absolute top-0 left-2 p-3 cursor-pointer pointer-events-none"
                    src={
                      partyData.logo[
                        themeSignal.value === "light" ? "light" : "dark"
                      ]
                    }
                    width={60}
                    height={60}
                    alt={`${partyData.name} logo`}
                  />
                </>
              );
            }}
          </Field>
        </div>
      </Form>
    );
  }
);
