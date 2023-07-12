import { Slot, component$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";

import Header from "~/components/Header";
import Footer from "~/components/Footer";

import { QnaProvider } from "~/context/qna";
import { ThemeProvider } from "~/context/theme";

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
  title: "ElektorAI - Głosuj bardziej świadomie z pomocą AI",
  meta: [
    {
      name: "description",
      content:
        "Poznaj programy wyborcze z pomocą AI i podejmij bardziej świadomą decyzję na kogo oddać swój głos podczas tegorocznych wyborów parlamentarnych zaplanowanych na 15 października 2023.",
    },
  ],
};
