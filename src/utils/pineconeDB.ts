import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const client = new PineconeClient();
let pineconeIndex: any | undefined;
// not undefined after ensureVectorStore succesfully runs on first request
let vectorStore: PineconeStore;

const ensureVectorStore = async ({
  apiKey,
  environment,
  indexName,
  openAIApiKey,
}: {
  apiKey: string;
  environment: string;
  indexName: string;
  openAIApiKey: string;
}) => {
  try {
    if (!client.apiKey) {
      await client.init({
        apiKey,
        environment,
      });

      pineconeIndex = client.Index(indexName);

      const embeddings = new OpenAIEmbeddings({ openAIApiKey });
      vectorStore = new PineconeStore(embeddings, {
        pineconeIndex,
      });
    }
  } catch (err) {
    console.error("Error initializing Pinecone client");
    throw err;
  }

  return vectorStore;
};

export { ensureVectorStore, vectorStore };
