import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { isBrowser } from "@builder.io/qwik/build";
import Expandable from "./Expandable";

type InputErrorProps = {
  name: string;
  error?: string;
};

/**
 * Input error that tells the user what to do to fix the problem.
 */
const InputError = component$(({ name, error }: InputErrorProps) => {
  // Use frozen error signal
  const frozenError = useSignal<string>();

  // Freeze error while element collapses to prevent UI from jumping
  useTask$(({ track, cleanup }) => {
    const nextError = track(() => error);
    if (isBrowser && !nextError) {
      const timeout = setTimeout(() => (frozenError.value = nextError), 200);
      cleanup(() => clearTimeout(timeout));
    } else {
      frozenError.value = nextError;
    }
  });

  return (
    <Expandable expanded={!!error}>
      <div class=" text-error " id={`${name}-error`}>
        {frozenError.value}
      </div>
    </Expandable>
  );
});

export default InputError;
