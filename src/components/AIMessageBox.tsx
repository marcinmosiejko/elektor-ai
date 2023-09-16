import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import AIAvatar from "./AIAvatar";
import { cn } from "~/utils/helpers";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

interface AIAnswerBoxProps {
  message: string;
  avatarClassName?: string;
  hasDisclaimer?: boolean;
  class?: string;
}

const AIAnswerBox = component$((props: AIAnswerBoxProps) => {
  const { message, avatarClassName, hasDisclaimer, class: className } = props;
  const messageInMarkdown = useSignal<string>("");
  useTask$(({ track }) => {
    track(() => message);

    const parsedMarkdown = marked.parse(message);
    const sanitisedMarkdown = DOMPurify.sanitize(parsedMarkdown);
    messageInMarkdown.value = sanitisedMarkdown;
  });
  return (
    <div
      class={cn(
        "shadow-shadow relative flex items-start gap-6 rounded-lg bg-secondary p-6 shadow-md",
        className
      )}
    >
      <AIAvatar avatarClassName={cn(avatarClassName)} />
      <div class="flex h-full flex-col justify-between gap-4">
        <div
          dangerouslySetInnerHTML={messageInMarkdown.value}
          class="prose mt-4 leading-6 text-left"
        ></div>
        {hasDisclaimer && (
          <div class="text-xs leading-5 text-accent">
            Odpowiedzi mogą nie być wyczerpujące lub w 100% prawdziwe, w związku
            z czym traktuj to jako ciekawostkę i zajrzyj do źródeł
          </div>
        )}
      </div>
    </div>
  );
});

export default AIAnswerBox;
