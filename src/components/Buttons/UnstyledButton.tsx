import {
  $,
  component$,
  type PropFunction,
  Slot,
  useSignal,
} from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import Spinner from "../Spinner";
import { cn } from "~/utils/helpers";

type LinkProps = {
  type: "link";
  href: string;
  download?: boolean | string;
  target?: "_blank";
};

type ButtonProps = {
  type: "button" | "reset" | "submit";
  "preventdefault:click"?: boolean;
  onClick$?: PropFunction<() => unknown>;
  loading?: boolean;
  form?: string;
};

export type DefaultButtonProps = LinkProps | ButtonProps;

export type UnstyledButtonProps = DefaultButtonProps & {
  class?: string;
  "aria-label"?: string;
  "aria-disabled"?: boolean;
  disabled?: boolean;
};

const disabledClass = "opacity-50 cursor-default hover:scale-100";

const UnstyledButton = component$((props: UnstyledButtonProps) => {
  const loadingSignal = useSignal(false);

  return (
    <>
      {/* Link button */}
      {props.type === "link" && (
        <Link
          {...props}
          class={cn(
            props.class,
            (loadingSignal.value || props.disabled) && disabledClass
          )}
          href={props.disabled || loadingSignal.value ? undefined : props.href}
          rel={props.target === "_blank" ? "noreferrer" : undefined}
        >
          <Slot />
        </Link>
      )}

      {/* Normal button */}
      {props.type !== "link" && (
        <button
          {...props}
          class={cn(props.class, "relative")}
          disabled={props.disabled || loadingSignal.value || props.loading}
          // Start and stop loading if function is async
          onClick$={
            props.onClick$ &&
            $(async () => {
              loadingSignal.value = true;
              await props.onClick$!();
              loadingSignal.value = false;
            })
          }
          aria-label={props["aria-label"] || "button"}
        >
          <div
            class={cn(
              "transition-[opacity,transform,visibility] duration-200",
              loadingSignal.value || props.loading ? "invisible opacity-0" : ""
            )}
          >
            <Slot />
          </div>
          <div
            class={cn(
              "absolute duration-200",
              loadingSignal.value || props.loading
                ? "visible delay-200"
                : "invisible opacity-0"
            )}
          >
            <Spinner />
          </div>
        </button>
      )}
    </>
  );
});

export default UnstyledButton;
