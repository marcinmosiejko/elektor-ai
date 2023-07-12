import { component$ } from "@builder.io/qwik";
import { cn } from "~/utils/helpers";

type InputLabelProps = {
  name: string;
  label?: string;
  required?: boolean;
  margin?: "none";
};

/**
 * Input label for a form field.
 */
const InputLabel = component$(
  ({ name, label, required, margin }: InputLabelProps) => (
    <>
      {label && (
        <label
          class={cn(
            "inline-block font-medium md:text-lg lg:text-xl",
            !margin && "mb-4 lg:mb-5"
          )}
          for={name}
        >
          {label} {required && <span class="ml-1 text-error">*</span>}
        </label>
      )}
    </>
  )
);

export default InputLabel;
