import { component$ } from "@builder.io/qwik";
import AiIcon from "./../images/ai.png";
import { cn } from "~/utils/helpers";

export default component$((props: { avatarClassName: string }) => {
  const { avatarClassName } = props;
  return (
    <div class="bg-title h-10 w-10 flex-shrink-0 rounded-full bg-primary-s1 p-2 shadow-md lg:h-16 lg:w-16 lg:p-3">
      <img
        class={cn(
          avatarClassName,
          "animate-aiAvatarOnce"
          // hover:animate-aiAvatarInfinite
        )}
        src={AiIcon}
        alt="AI icon"
        width={60}
        height={60}
      />
    </div>
  );
});
