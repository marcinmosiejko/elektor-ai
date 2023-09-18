import FullyRoundedButton from "../../../components/FullyRoundedButton";
import { component$, useContext } from "@builder.io/qwik";
import { QnAContext } from "~/context/qna";
import { usePopularQuestions } from ".";
import { cn } from "~/utils/helpers";

const maxCount = 5;

interface PopularQuestionsProps {
  class?: string;
}
export default component$((props: PopularQuestionsProps) => {
  const { class: className } = props;
  const popularQuestionsSingal = usePopularQuestions();
  const qnaContext = useContext(QnAContext);

  return (
    <div class={cn(className)}>
      <p class="mb-4 text-lg font-medium">Popularne pytania</p>
      <div class="flex flex-wrap gap-4 text-sm">
        {popularQuestionsSingal.value.slice(0, maxCount).map((question) => {
          const query = new URLSearchParams({ question });
          const url = `/qna/${qnaContext.currentParty}?${query.toString()}`;
          return (
            <FullyRoundedButton
              key={question}
              href={qnaContext.isGeneratingAnswer ? undefined : url}
              disabled={qnaContext.isGeneratingAnswer}
            >
              {question}
            </FullyRoundedButton>
          );
        })}
      </div>
    </div>
  );
});
