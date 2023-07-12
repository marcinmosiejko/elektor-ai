import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";
import type { Signal } from "@builder.io/qwik";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const imitateAiAnswer = async (
  answer: string,
  signal: Signal<string>
) => {
  if (!answer) return;
  const words = answer.split(" ");

  signal.value = "";

  for (const word of words) {
    signal.value += word + " ";
    await wait(30);
  }
};

export const removeExtraSpacesAndBeforePunctuation = (
  input: string
): string => {
  // Replace multiple spaces with a single space
  let result = input.replace(/\s+/g, " ");

  // Remove spaces before and after (trim) punctuation
  result = result.replace(/\s+([?.!])/g, "$1").trim();

  return result;
};
