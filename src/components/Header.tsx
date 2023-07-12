import { component$, useContext } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { ThemeContext } from "~/context/theme";
import { MoonIcon, SunIcon, LogOutIcon } from "lucide-qwik";
import { useAuthSession, useAuthSignout } from "~/routes/plugin@auth";

const Header = component$(() => {
  const themeSignal = useContext(ThemeContext);
  const session = useAuthSession();
  const signOut = useAuthSignout();

  return (
    <header class="w-full p-5 text-primary">
      <div class=" mx-auto flex max-w-6xl justify-between md:px-8">
        <Link href={`/`} class="text-lg font-semibold focus-visible:rounded-md">
          Wyborczy AI
        </Link>
        <div class="flex gap-4 justify-center">
          <Link href={`/backoffice`}>backoffice</Link>

          <button
            class="w-6 -translate-y-[2px]"
            onClick$={() => {
              themeSignal.value =
                themeSignal.value === "dark" ? "light" : "dark";
            }}
            type="button"
          >
            {themeSignal.value ? (
              themeSignal.value === "dark" ? (
                <SunIcon class="h-6 w-6" />
              ) : (
                <MoonIcon class="h-6 w-6 -translate-y-[2px]" />
              )
            ) : null}
          </button>

          {/* <HelpCircleIcon class="h-6 w-6" /> */}

          {session.value?.user?.email && (
            <button class="-translate-y-[2px]" type="button">
              <LogOutIcon
                onClick$={() => signOut.submit({ callbackUrl: "/" })}
                class="h-6 w-6"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;
