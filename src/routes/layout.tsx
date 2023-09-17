import { Slot, component$ } from "@builder.io/qwik";
import type {
  DocumentHead,
  RequestEvent,
  RequestHandler,
} from "@builder.io/qwik-city";

import Header from "~/components/Header";
import Footer from "~/components/Footer";

import { QnaProvider } from "~/context/qna";
import { ThemeProvider } from "~/context/theme";
import { ensureMongoDB } from "~/utils/mongoDB";
import { ensureVectorStore } from "~/utils/pineconeDB";

export async function onRequest(requestEvent: RequestEvent) {
  const mongoDBUrl = requestEvent.env.get("MONGO_URL");
  if (!mongoDBUrl) {
    throw new Error("Missing MONGO_URL env variable");
  }
  await ensureMongoDB({ url: mongoDBUrl });

  const pineconeApiKey = requestEvent.env.get("PINECONE_API_KEY");
  const pineconeEnvironment = requestEvent.env.get("PINECONE_ENVIRONMENT");
  const pineconeIndexName = requestEvent.env.get("PINECONE_INDEX_NAME");
  const openAIApiKey = requestEvent.env.get("OPENAI_API_KEY");

  if (
    !pineconeApiKey ||
    !pineconeEnvironment ||
    !pineconeIndexName ||
    !openAIApiKey
  ) {
    throw new Error(
      "Missing PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX_NAME or OPENAI_API_KEY env variable"
    );
  }

  await ensureVectorStore({
    apiKey: pineconeApiKey,
    environment: pineconeEnvironment,
    indexName: pineconeIndexName,
    openAIApiKey,
  });
}

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <ThemeProvider>
      <QnaProvider>
        <Header />
        <main class="mx-auto flex w-full max-w-6xl flex-grow flex-col px-4 py-12 md:px-8">
          <Slot />
        </main>
        <Footer />
      </QnaProvider>
    </ThemeProvider>
  );
});

export const head: DocumentHead = {
  title: "Wyborczy AI",
  meta: [
    {
      name: "description",
      content: "description",
    },
  ],
};
