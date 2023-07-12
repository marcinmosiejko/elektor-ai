import { component$ } from "@builder.io/qwik";
import { cn } from "~/utils/helpers";

type SpinnerProps = {
  class?: string;
};
const Spinner = component$((props: SpinnerProps) => (
  <div
    class={cn(
      "h-5 w-5 animate-spin rounded-full border-t-2 border-r-2 border-t-current border-r-transparent md:h-[22px] md:w-[22px] md:border-t-[2.5px] md:border-r-[2.5px] lg:h-6 lg:w-6",
      props.class
    )}
    aria-label="Loading"
  />
));

export default Spinner;
