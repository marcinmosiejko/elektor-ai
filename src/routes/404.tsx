import { component$ } from "@builder.io/qwik";
import AIMessageBox from "~/components/AIMessageBox";
import FullyRoundedButton from "~/components/FullyRoundedButton";

export default component$(() => {
  return (
    <div class="m-auto flex h-full max-w-xl -translate-y-10 flex-col items-center gap-10">
      <AIMessageBox
        {...{
          message:
            "Strona, której szukasz nie istnieje. Aby przejść do strony głównej, kliknij w link poniżej.",
          boxClassName: "pt-8 pb-10",
        }}
      />
      <FullyRoundedButton class="shadow-shadow shadow-md" href="/">
        strona główna
      </FullyRoundedButton>
    </div>
  );
});
