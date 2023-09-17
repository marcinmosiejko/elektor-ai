import { component$ } from "@builder.io/qwik";
import Content from "./content.mdx";

const About = component$(() => {
  return (
    <div class="w-full flex justify-center">
      <div class="prose max-w-3xl text-sm prose-headings:text-primary">
        <Content />
      </div>
    </div>
  );
});

export default About;
