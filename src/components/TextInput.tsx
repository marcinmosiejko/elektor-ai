import {
  component$,
  useSignal,
  useTask$,
  type PropFunction,
  type QwikChangeEvent,
  type QwikFocusEvent,
} from "@builder.io/qwik";
import InputError from "./InputError";
import InputLabel from "./InputLabel";
import { cn } from "~/utils/helpers";

type TextInputProps = {
  ref: PropFunction<(element: Element) => void>;
  type: "text" | "email" | "tel" | "password" | "url" | "number" | "date";
  name: string;
  value: string | number | undefined;
  onInput$: PropFunction<(event: Event, element: HTMLInputElement) => void>;
  onChange$: PropFunction<
    (
      event: QwikChangeEvent<HTMLInputElement>,
      element: HTMLInputElement
    ) => void
  >;
  onBlur$: PropFunction<
    (event: QwikFocusEvent<HTMLInputElement>, element: HTMLInputElement) => void
  >;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  class?: string;
  inputClass?: string;
  label?: string;
  error?: string;
  form?: string;
};

const TextInput = component$(
  ({ label, value, error, inputClass, ...props }: TextInputProps) => {
    const { name, required } = props;
    const input = useSignal<string | number>();

    useTask$(({ track }) => {
      if (!Number.isNaN(track(() => value))) {
        input.value = value;
      }
    });

    return (
      <div class={cn("flex flex-col gap-2", props.class)}>
        <InputLabel name={name} label={label} required={required} />
        <input
          {...props}
          class={cn(
            "input input-bordered input-primary w-full resize-none border-border bg-secondary text-base placeholder:opacity-50 disabled:border-border disabled:bg-base-100",
            inputClass,
            error && "border-error/50 textarea-error",
            props.disabled && "opacity-50"
          )}
          id={name}
          value={input.value}
          aria-invalid={!!error}
          aria-errormessage={`${name}-error`}
          aria-disabled={props.disabled}
        />
        <InputError name={name} error={error} />
      </div>
    );
  }
);

export default TextInput;
