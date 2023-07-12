import { component$ } from "@builder.io/qwik";
import { cn } from "~/utils/helpers";
import UnstyledButton from "./UnstyledButton";

import type { UnstyledButtonProps } from "./UnstyledButton";

type ButtonProps = UnstyledButtonProps & {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "warning"
    | "error"
    | "success"
    | "info"
    | "neutral";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  outlined?: boolean;
  label: string;
};

const Button = component$((props: ButtonProps) => {
  const {
    class: className,
    type,
    disabled,
    variant = "primary",
    outlined = false,
    size = "md",
    label,
    ...rest
  } = props;

  const commonProps = {
    class: cn(
      `btn btn-${size} btn-${variant}`,
      outlined && "btn-outline",
      className
    ),
    "aria-disabled": disabled,
    disabled,
  };

  return (
    <>
      {/* Link button */}
      {props.type === "link" && (
        <UnstyledButton {...commonProps} type={type} href={props.href}>
          {label}
        </UnstyledButton>
      )}

      {/* Normal button */}
      {type !== "link" && (
        <UnstyledButton {...{ ...rest, ...commonProps }} type={type}>
          {label}
        </UnstyledButton>
      )}
    </>
  );
});

export default Button;
