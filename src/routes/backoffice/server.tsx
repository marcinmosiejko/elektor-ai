import { server$ } from "@builder.io/qwik-city";
import { contextDocsCollection } from "~/utils/mongoDB";
import { contextDocsSchema } from "~/utils/schemas";
import { vectorStore } from "~/utils/pineconeDB";

import type { ContextDoc, Party } from "~/utils/types";

/**
 * Saves contextDocs to MongoDB and vectorStore by deleting
 * all existing contextDocs for the docs' party and inserting the new ones.
 */
export const storeContextDocs = server$(async function (
  contextDocs: ContextDoc[]
) {
  const party = contextDocs.at(0)?.metadata.party;

  await contextDocsCollection.deleteMany({ "metadata.party": party });
  await contextDocsCollection.insertMany(contextDocs);

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

  if (parsedContextDocs.success) return parsedContextDocs.data;

  throw new Error(
    "Failed to parse contextDocs from vectorStore",
    parsedContextDocs.error
  );
});

export const getConextDocsFromMDB = server$(async function (party: Party) {
  const contextDocs = await contextDocsCollection
    .find({ "metadata.party": party })
    .toArray();

  const parsedContextDocs = contextDocsSchema.safeParse(contextDocs);

  if (parsedContextDocs.success) return parsedContextDocs.data;

  throw new Error(
    "Failed to parse contextDocs from MongoDB",
    parsedContextDocs.error
  );
});
