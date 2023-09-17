import FullyRoundedButton from "../../../components/FullyRoundedButton";
import { component$, useContext } from "@builder.io/qwik";
import { QnAContext } from "~/context/qna";
import { usePopularQuestions } from ".";
import { cn } from "~/utils/helpers";

const maxCount = 5;

interface PopularQuestionsProps {
  party: string;
  class?: string;
}
export default component$((props: PopularQuestionsProps) => {
  const { party, class: className } = props;
  const popularQuestionsSingal = usePopularQuestions();
  const qnaState = useContext(QnAContext);

  return (
    <div class={cn(className)}>
      <p class="mb-4 text-lg font-medium">Popularne pytania</p>
      <div class="flex flex-wrap gap-4 text-sm">
        {popularQuestionsSingal.value.slice(0, maxCount).map((question) => {
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
