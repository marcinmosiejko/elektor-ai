import { component$ } from "@builder.io/qwik";
import AIMessageBox from "~/components/AIMessageBox";
import FullyRoundedButton from "~/components/Buttons/FullyRoundedButton";

export default component$(() => {
  return (
    <div class="mx-auto mt-6 lg:mt-10 max-w-2xl flex flex-col items-center gap-10">
      <AIMessageBox
        {...{
          message:
            "Strona, której szukasz nie istnieje. Aby przejść do strony głównej, kliknij w link 👇",
        }}
      />
      <FullyRoundedButton type="link" href="/" class="shadow-shadow shadow-md">
        strona główna
      </FullyRoundedButton>
    </div>
  );
});
