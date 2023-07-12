import { normalizedDocsSchema } from "~/utils/schemas";
import { getValue, getValues, validate } from "@modular-forms/qwik";

import type { ContextDocsForm } from ".";
import type { Document } from "langchain/dist/document";
import type { FormStore } from "@modular-forms/qwik";
import type { NormalizedDoc } from "~/utils/types";

export const removeNewLinesWithinSentence = (text: string) => {
  const sentences = text
    .split(". ")
    .map((sentence) => sentence.replace(/\n/g, " ").replace(/\s{2,}/g, " "));

  return sentences
    .join(". ")
    .replace(/\s{2,}/g, " ")
    .replaceAll("- ", "");
};

export const denoiseString = (text: string) =>
  text
    .split("\n")
    .filter((line) => {
      if (line.includes("|")) return false;
      if (line.includes("•")) return false;
      return true;
    })
    .join("\n");

export const denoiseContextDocs = (
  docs: Record<string, any>[]
): NormalizedDoc[] => {
  const normalized = docs
    .map((doc: any) => {
      const pageNumber = doc.metadata.loc.pageNumber;
      delete doc.metadata.loc;
      delete doc.metadata.pdf;
      delete doc.metadata.source;
      return {
        pageContent: removeNewLinesWithinSentence(
          denoiseString(doc.pageContent)
        ),
        metadata: { ...doc.metadata, chapterName: "", pageNumber },
      };
    })
    .filter((doc: Document) => doc.pageContent.length > 50);

  return normalized;
};

export const prepareContextDocsToEmbed = (
  contextDocsForm: FormStore<ContextDocsForm, undefined>
) => {
  const parsedFormContextDocs = normalizedDocsSchema.safeParse(
    getValues(contextDocsForm, "docs")
  );
  const party = getValue(contextDocsForm, "party");

  if (
    !parsedFormContextDocs.success ||
    !parsedFormContextDocs.data.length ||
    !party
  ) {
    validate(contextDocsForm);
    return;
  }

  localStorage.setItem("docs", JSON.stringify(parsedFormContextDocs.data));

  return Object.values(parsedFormContextDocs.data).map((doc, i) => {
    return {
      ...doc,
      pageContent: `${doc.metadata.chapterName}###${doc.pageContent}`, // Adding chapterName to pageContent for better similarity search results
      metadata: {
        ...doc.metadata,
        id: `${party}--${i + 1}`,
        party,
      },
    };
  });
};
