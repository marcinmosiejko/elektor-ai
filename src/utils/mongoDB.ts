import { MongoClient } from "mongodb";
import {
  CACHE_MONGO_COLLECTION,
  CONTEXT_DOCS_MONGO_COLLECTION,
  MONGO_DB,
} from "./constants";

import type { Db, Collection } from "mongodb";

let mDBClient: MongoClient | undefined;
let mDB: Db | undefined;
// not undefined after ensureMongoDB succesfully runs on first request
let cacheCollection: Collection;
let contextDocsCollection: Collection;

const ensureMongoDB = async ({ url }: { url: string }) => {
  if (!mDBClient) {
    mDBClient = new MongoClient(url);
  }
  if (!mDB) {
    await mDBClient.connect();
    mDB = mDBClient.db(MONGO_DB);

    cacheCollection = mDB.collection(CACHE_MONGO_COLLECTION);
    contextDocsCollection = mDB.collection(CONTEXT_DOCS_MONGO_COLLECTION);
  }
};

export { cacheCollection, contextDocsCollection, ensureMongoDB };
