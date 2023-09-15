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
import AngleDownIcon from "./AngleDownIcon";
import { cn } from "~/utils/helpers";

type SelectProps = {
  ref: PropFunction<(element: Element) => void>;
  name: string;
  value: string | string[] | null | undefined;
  onInput$: PropFunction<(event: Event, element: HTMLSelectElement) => void>;
  onChange$: PropFunction<
    (
      event: QwikChangeEvent<HTMLSelectElement>,
      element: HTMLSelectElement
    ) => void
  >;
  onBlur$: PropFunction<
    (
      event: QwikFocusEvent<HTMLSelectElement>,
      element: HTMLSelectElement
    ) => void
  >;
  options: { label: string; value: string }[];
  size?: number;
  placeholder?: string;
  required?: boolean;
  class?: string;
  selectClass?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
};

/**
 * Select field that allows users to select predefined values. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
const SelectInput = component$(
  ({ value, options, label, error, disabled, ...props }: SelectProps) => {
    const { name, required, placeholder } = props;

    // Create computed value of selected values
    const values = useSignal<string[]>();
    useTask$(({ track }) => {
      track(() => value);
      values.value = Array.isArray(value)
        ? value
        : value && typeof value === "string"
        ? [value]
        : [];
    });

    return (
      <div class={cn("w-full flex flex-col gap-2", props.class)}>
        <InputLabel name={name} label={label} required={required} />
        <div class="relative flex items-center">
          <select
            {...props}
            class={cn(
              "cursor-pointer input input-bordered input-primary w-full resize-none border-border appearance-none bg-secondary disabled:border-border disabled:bg-base-100 font-normal text-base",
              error && "border-error/50 textarea-error ",
              placeholder && !values.value?.length && "text-opacity-50",
              props.selectClass
            )}
            id={name}
            aria-invalid={!!error}
            aria-errormessage={`${name}-error`}
            disabled={disabled}
          >
            <option value="" disabled hidden selected={!value}>
              {placeholder}
            </option>
            {options.map(({ label, value }) => (
              <option
                key={value}
                value={value}
                selected={values.value?.includes(value)}
              >
                {label}
              </option>
            ))}
          </select>
          <AngleDownIcon class="pointer-events-none absolute right-6 h-5" />
        </div>
        <InputError name={name} error={error} />
      </div>
    );
  }
);

export default SelectInput;
