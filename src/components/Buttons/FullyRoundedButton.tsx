import { Slot, component$ } from "@builder.io/qwik";
import { cn } from "~/utils/helpers";
import UnstyledButton from "./UnstyledButton";

import type { UnstyledButtonProps } from "./UnstyledButton";

type FullyRoundedButtonProps = UnstyledButtonProps;

const FullyRoundedButton = component$((props: FullyRoundedButtonProps) => {
  const commonProps = {
    class: cn(
      "rounded-full border border-transparent bg-primary-s1 px-4 py-2 text-sm text-always-dark transition-all hover:scale-105 focus:outline-none focus-visible:border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-secondary",
      props.class
    ),
    "aria-disabled": props.disabled,
  };

  return (
    <>
      {/* Link button */}
      {props.type === "link" && (
        <UnstyledButton {...{ ...props, ...commonProps }}>
          <Slot />
        </UnstyledButton>
      )}

      {/* Normal button */}
      {props.type !== "link" && (
        <UnstyledButton {...{ ...props, ...commonProps }}>
          <Slot />
        </UnstyledButton>
      )}
    </>
  );
});

export default FullyRoundedButton;
