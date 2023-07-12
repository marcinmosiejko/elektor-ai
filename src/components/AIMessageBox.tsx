import { component$ } from "@builder.io/qwik";
import AIAvatar from "./AIAvatar";
import { cn } from "~/utils/helpers";

interface AIAnswerBoxProps {
  message: string;
  avatarClassName?: string;
  hasDisclaimer?: boolean;
  class?: string;
}

const AIAnswerBox = component$(
  ({
    message,
    class: className,
    avatarClassName,
    hasDisclaimer,
  }: AIAnswerBoxProps) => {
    return (
      <div
        class={cn(
          "shadow-shadow relative flex items-start gap-6 rounded-lg bg-secondary p-6 text-lg shadow-md",
          className
        )}
      >
        <AIAvatar avatarClassName={cn(avatarClassName)} />
        <div class="flex h-full flex-col justify-between gap-4">
          <div class="prose mt-4 text-lg text-left">{message}</div>
          {hasDisclaimer && (
            <div class="text-xs leading-5 text-accent">
              Odpowiedzi mogą nie być wyczerpujące lub w 100% prawdziwe, w
              związku z czym traktuj to jako ciekawostkę i zajrzyj do źródeł
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default AIAnswerBox;
