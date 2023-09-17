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
import { getRandomPartyId } from "~/utils/helpers";

const popularQuestions = [
  "Jakie będą korzyści dla młodych?",
  "Czy zadbają o środowisko?",
  "Czy będzie podwyżka płacy minimalnej?",
  "Co zyskają seniorzy?",
  "Czy będzie podwyżka pensji dla nauczycieli?",
];

export const usePopularQuestions = routeLoader$(async () => {
  const mostPopularFromCache: string[] | undefined = (
    await cacheCollection.find({}).sort({ searchCount: -1 }).limit(5).toArray()
  ).map((item) => item.question);

  const mostPopularSet = new Set(mostPopularFromCache);

  while (mostPopularSet.size < 5) {
    const randomQuestionIndex = Math.floor(
      Math.random() * popularQuestions.length
    );
    const randomQuestion = popularQuestions[randomQuestionIndex];
    mostPopularSet.add(randomQuestion);
  }

  return mostPopularSet.size ? Array.from(mostPopularSet) : popularQuestions;
});

export const onRequest: RequestHandler = async ({ redirect, params }) => {
  const isValidParty = Object.keys(partyMap).includes(params.party);

  if (!isValidParty) {
    throw redirect(307, `/qna/${getRandomPartyId()}`);
  }
};

export default component$(() => {
  const loc = useLocation();
  const question = new URL(loc.url).searchParams.get("question");
  const party = loc.params.party as Party;

  return (
    <div class="flex flex-col gap-14">
      <div class="flex flex-col gap-6">
        <QuestionForm class="main-grid" party={party} question={question} />
        <div class="main-grid">
          <Answer party={party} question={question} />
          <PopularQuestions class="mt-10 lg:mt-0" party={party} />
        </div>
      </div>
      <Sources />
    </div>
  );
});
