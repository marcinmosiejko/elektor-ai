import { Slot, component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { cn } from "~/utils/helpers";

const navMap = {
  Context: "/backoffice/context/",
  Cache: "/backoffice/cache/",
};

export default component$(() => {
  const location = useLocation();

  return (
    <div class="flex flex-col gap-10">
      <div class="flex gap-6">
        {Object.entries(navMap).map(([name, href]) => (
          <Link
            key={name}
            class={cn(href === location.url.pathname && "text-primary")}
            href={href}
          >
            {name}
          </Link>
        ))}
      </div>
      <Slot />
    </div>
  );
});
