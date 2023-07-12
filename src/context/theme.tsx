import type { Signal } from "@builder.io/qwik";
import {
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

import type { Theme } from "~/utils/types";

type ThemeSignal = Theme | null;

export const ThemeContext =
  createContextId<Signal<ThemeSignal>>("themeContext");

export const ThemeProvider = component$(() => {
  const themeSignal: Signal<ThemeSignal> = useSignal(null);

  useVisibleTask$(() => {
    themeSignal.value = document.documentElement.dataset.theme as Theme;
  });

  useVisibleTask$(({ track }) => {
    track(() => themeSignal.value);
    if (themeSignal.value) {
      document.documentElement.dataset.theme = themeSignal.value;
      localStorage.setItem("theme", themeSignal.value);
    }
  });

  useContextProvider(ThemeContext, themeSignal);

  return (
    <>
      <Slot />
    </>
  );
});
