import { component$ } from "@builder.io/qwik";
import AIMessageBox from "~/components/AIMessageBox";

export default component$(() => {
  return (
    <div class="mx-auto mt-6 lg:mt-10 max-w-2xl">
      <AIMessageBox
        {...{
          message: `Jeśli masz pytania, uwagi lub sugestie dotyczące aplikacji, śmiało napisz na adres: [kontakt@wyborczyai.pl](mailto:kontakt@wyborczyai.pl)`,
        }}
      />
    </div>
  );
});
