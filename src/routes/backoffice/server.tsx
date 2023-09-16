import { server$ } from "@builder.io/qwik-city";
import { cacheCollection, contextDocsCollection } from "~/utils/mongoDB";
import { contextDocsSchema } from "~/utils/schemas";
import { vectorStore } from "~/utils/pineconeDB";

import type { ContextDoc, Party } from "~/utils/types";

/**
 * Saves contextDocs to MongoDB by deleting all existing contextDocs for the docs' party and inserting the new ones.
 */
export const storeContextDocsToMDb = server$(async function (
  contextDocs: ContextDoc[]
) {
  const party = contextDocs.at(0)?.metadata.party;

  await contextDocsCollection.deleteMany({ "metadata.party": party });
  await contextDocsCollection.insertMany(contextDocs);
});

/**
 * Saves contextDocs to VectorStore by deleting all existing contextDocs for the docs' party and inserting the new ones.
 */
export const storeContextDocsToVectorStore = server$(async function (
  contextDocs: ContextDoc[]
) {
  const party = contextDocs.at(0)?.metadata.party;

  const toDelete = await vectorStore.similaritySearch("", 1000, { party });
  const idsToDelete = toDelete.map((doc) => doc.metadata.id);
  await vectorStore.delete({
    ids: idsToDelete,
  });

  await vectorStore.addDocuments(contextDocs, {
    ids: contextDocs.map((doc) => doc.metadata.id),
  });
});

export const getContextDocsFromVectorStore = server$(async function (
  party: Party
) {
  const contextDocs = await vectorStore.similaritySearch("", 1000, {
    party,
  });

  const parsedContextDocs = contextDocsSchema.safeParse(contextDocs);

  if (parsedContextDocs.success) {
    return parsedContextDocs.data.sort(
      (docA, docB) => docA.metadata.pageNumber - docB.metadata.pageNumber
    );
  }

  throw new Error(
    "Failed to parse contextDocs from vectorStore",
    parsedContextDocs.error
  );
});

export const getConextDocsFromMDb = server$(async function (party: Party) {
  const contextDocs = await contextDocsCollection
    .find({ "metadata.party": party })
    .sort({ "metadata.pageNumber": 1 })
    .toArray();

  const parsedContextDocs = contextDocsSchema.safeParse(contextDocs);

  if (parsedContextDocs.success) return parsedContextDocs.data;

  throw new Error(JSON.stringify(parsedContextDocs.error));
});

export const clearAllCache = server$(async function () {
  await cacheCollection.deleteMany({});
});
