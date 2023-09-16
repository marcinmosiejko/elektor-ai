import { component$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import Answer from "./Answer";
import PopularQuestions from "./PopularQuestions";
import { partyMap } from "~/utils/constants";
import type { Party } from "~/utils/types";
import type { RequestHandler } from "@builder.io/qwik-city";
import Sources from "./Sources";
import QuestionForm from "./QuestionForm";
import { cacheCollection } from "~/utils/mongoDB";

const popularQuestions = [
  "Jakie będą korzyści dla młodych?",
  "Czy zadbają o środowisko?",
  "Czy będzie podwyżka płacy minimalnej?",
  "Co zyskają seniorzy?",
  "Czy będzie podwyżka pensji dla nauczycieli?",
];

export const usePopularQuestions = routeLoader$(async () => {
  const mostPopular: string[] | undefined = (
    await cacheCollection.find({}).sort({ searchCount: -1 }).limit(5).toArray()
  ).map((item) => item.question);

  while (mostPopular.length < 5) {
    const randomQuestion =
      popularQuestions[Math.floor(Math.random() * popularQuestions.length)];
    if (!mostPopular.includes(randomQuestion)) mostPopular.push(randomQuestion);
  }

  return mostPopular.length ? mostPopular : popularQuestions;
});

export const onRequest: RequestHandler = async ({ redirect, params }) => {
  const isValidParty = Object.keys(partyMap).includes(params.party);
  if (!isValidParty) {
    throw redirect(307, `/qna/${Object.values(partyMap)[0].id}`);
  }
};

export default component$(() => {
  const loc = useLocation();
  const question = new URL(loc.url).searchParams.get("question");
  const party = loc.params.party as Party;

  return (
    <div class="flex flex-col gap-14">
      <div class="flex flex-col gap-6">
        <QuestionForm {...{ party, question }} />
        <div class="main-grid">
          <Answer {...{ party, question }} />
          <PopularQuestions {...{ party, question }} />
        </div>
      </div>
      <Sources />
    </div>
  );
});
