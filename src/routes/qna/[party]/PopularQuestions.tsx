import FullyRoundedButton from "../../../components/FullyRoundedButton";
import { component$, useContext } from "@builder.io/qwik";
import { QnAContext } from "~/context/qna";

const popularQuestions = [
  "Co zyskają seniorzy?",
  "Czy PO zadba o środowisko?",
  "Jakie będą korzyści dla młodych?",
  "Czy będzie 500+?",
  "Czy będzie 13 emerytura?",
  "Czy będzie podwyżka płacy minimalnej?",
  "Czy będzie podwyżka pensji dla nauczycieli?",
];

const maxCount = 5;

interface PopularQuestionsProps {
  party: string;
}

export default component$((props: PopularQuestionsProps) => {
  const { party } = props;
  const qnaState = useContext(QnAContext);

  return (
    <div>
      <p class="mb-4 text-lg font-medium">Popularne pytania</p>
      <div class="flex flex-wrap gap-4 text-sm">
        {popularQuestions.slice(0, maxCount).map((question) => {
          const query = new URLSearchParams({ question });
          const url = `/qna/${party}?${query.toString()}`;
          return (
            <FullyRoundedButton
              key={question}
              href={qnaState.isGeneratingAnswer ? undefined : url}
              disabled={qnaState.isGeneratingAnswer}
            >
              {question}
            </FullyRoundedButton>
          );
        })}
      </div>
    </div>
  );
});
