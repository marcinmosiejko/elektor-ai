import { component$ } from "@builder.io/qwik";

const Footer = component$(() => {
  return (
    <footer class="p-5">
      <div class="m-auto flex max-w-2xl justify-center">
        <span class="text-sm font-light text-neutral">
          ElektorAI &copy; {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
});

export default Footer;
