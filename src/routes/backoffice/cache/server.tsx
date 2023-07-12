import { server$ } from "@builder.io/qwik-city";
import { ObjectId } from "mongodb";
import { getCacheCollection } from "~/utils/mongoDB";
import { cacheArraySchema } from "~/utils/schemas";

import type { CacheItemSchema } from "~/utils/types";

export const clearAllCache = server$(async function () {
  const cacheCollection = await getCacheCollection();
  await cacheCollection.deleteMany({});
});

export const getAllCache = server$(async function () {
  const cacheCollection = await getCacheCollection();

  const cache = await cacheCollection
    .find()
    .sort({ searchCount: -1 })
    .toArray();

  const parsedCache = cacheArraySchema.safeParse(
    JSON.parse(JSON.stringify(cache))
  );
  if (parsedCache.success) {
    return parsedCache.data;
  }

  throw parsedCache.error;
});

export const deleteItemFromCache = server$(async function (id: string) {
  const cacheCollection = await getCacheCollection();
  await cacheCollection.deleteOne({ _id: new ObjectId(id) });
  return true;
});

export const updateItemInCache = server$(async function (
  cacheItem: CacheItemSchema
) {
  const cacheCollection = await getCacheCollection();
  await cacheCollection.updateOne(
    { _id: new ObjectId(cacheItem._id) },
    {
      $set: {
        question: cacheItem.question,
        answer: cacheItem.answer,
      },
    }
  );
  return true;
});
