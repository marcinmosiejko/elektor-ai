import { Slot, component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { cn } from "~/utils/helpers";

type FullyRoundedButtonProps = {
  class?: string;
  href?: string;
  disabled?: boolean;
};

const Button = (p: { class?: string; disabled?: boolean }) => <button {...p} />;

const FullyRoundedButton = component$((props: FullyRoundedButtonProps) => {
  const { class: className, disabled, href } = props;

  const BtnOrLink = href ? Link : Button;

  const btnOrLinkProps = {
    ...(href && { href }),
    ...(!href && { disabled }),
  };

  return (
    <BtnOrLink
      class={cn(
        "rounded-full border border-transparent bg-primary-s1 px-4 py-2 text-sm text-always-dark transition-all hover:scale-105 focus:outline-none focus-visible:border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-secondary",
        className,
        disabled && "opacity-50 cursor-default hover:scale-100"
      )}
      {...btnOrLinkProps}
    >
      <Slot />
    </BtnOrLink>
  );
});

export default FullyRoundedButton;
