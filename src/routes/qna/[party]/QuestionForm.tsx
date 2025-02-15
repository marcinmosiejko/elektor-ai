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

import type { Party, QnA } from "~/utils/types";
import SelectInput from "~/components/SelectInput";
import { SendIcon } from "lucide-qwik";
import { cn } from "~/utils/helpers";

const formSchema = z.object({
  question: questionSchema,
  party: partySchema,
});

export type QuestionForm = z.infer<typeof formSchema>;

export default component$((props: QnA) => {
  const {
    question: questionParam,
    party: partyParam,
    class: className,
  } = props;
  const loc = useLocation();
  const nav = useNavigate();
  const themeSignal = useContext(ThemeContext);

  console.log("component rerender");

  const qnaContext = useContext(QnAContext);

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
    const question = track(() => questionParam);
    const party = track(() => partyParam);

    setValue(questionForm, "question", question || "");
    setValue(questionForm, "party", party);
    qnaContext.currentParty = party;
  });

  useVisibleTask$(({ track }) => {
    questionParam && validate(questionForm, { shouldActive: false });

    track(() => questionParam);
  });

  return (
    <Form class={cn(className)} onSubmit$={onSubmit}>
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
                disabled={qnaContext.isGeneratingAnswer}
              />
              <button
                class="btn absolute top-2 right-2 p-4 cursor-pointer"
                type="submit"
                disabled={qnaContext.isGeneratingAnswer}
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

            const commonImgProps = {
              width: 60,
              height: 60,
              alt: `${partyData.name} logo`,
            };

            const imgClass =
              "absolute top-0 left-2 p-3 cursor-pointer pointer-events-none";

            return (
              <>
                <SelectInput
                  {...props}
                  // onInput$={undefined}
                  selectClass="h-16 pl-20"
                  value={field.value}
                  options={Object.values(partyMap).map(
                    ({ name: label, id: value }) => ({
                      label,
                      value,
                    })
                  )}
                  error={field.error}
                  disabled={qnaContext.isGeneratingAnswer}
                  onChange$={(_, s) => {
                    qnaContext.currentParty = s.value as Party;
                  }}
                />
                <Image
                  class={cn(imgClass, "dark-theme-content")}
                  src={partyData.logo.dark}
                  {...commonImgProps}
                />
                <Image
                  class={cn(imgClass, "light-theme-content")}
                  src={partyData.logo.light}
                  {...commonImgProps}
                />
              </>
            );
          }}
        </Field>
      </div>
    </Form>
  );
});
