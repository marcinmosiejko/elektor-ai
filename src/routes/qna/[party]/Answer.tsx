import {
  component$,
  noSerialize,
  useContext,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import AIMessageBox from "~/components/AIMessageBox";
import {
  cn,
  imitateAiAnswer,
  removeExtraSpacesAndBeforePunctuation,
} from "~/utils/helpers";
import { partySchema, questionSchema } from "~/utils/schemas";
import type { QnA } from "~/utils/types";
import { generateAnswer, getContextDocsAndAnswer } from "./server";
import { QnAContext } from "~/context/qna";

const somethingWentWrongMessage = "Coś poszło nie tak 🙈";

const welcomeMessage = `Cześć!
Jestem sztuczną inteligencją, która zna treść programów wyborczych. Chętnie pomogę Ci dokonać bardziej świadomej decyzji na kogo oddać głos. Wybierz której partii program chciałbyś lepiej poznać i pytaj śmiało :)`;

export default component$((props: QnA) => {
  const {
    question: questionParam,
    party: partyParam,
    class: className,
  } = props;
  const answerSignal = useSignal<string>("");
  const controllerSignal = useSignal<AbortController | undefined>(undefined);
  const isGettingContextDocsSignal = useSignal<boolean>(false);
  const qnaStore = useContext(QnAContext);

  useVisibleTask$(async ({ track, cleanup }) => {
    track(() => questionParam);
    track(() => partyParam);

    // eslint-disable-next-line qwik/valid-lexical-scope
    controllerSignal.value?.abort();
    // eslint-disable-next-line qwik/valid-lexical-scope
    controllerSignal.value = noSerialize(new AbortController());
    // eslint-disable-next-line qwik/valid-lexical-scope
    if (!controllerSignal.value) return;

    qnaStore.contextDocs = [];
    answerSignal.value = "";
    isGettingContextDocsSignal.value = false;
    qnaStore.isGeneratingAnswer = false;

    if (!questionParam || !questionSchema.safeParse(questionParam).success) {
      return;
    }

    if (!partySchema.safeParse(partyParam).success) return;

    qnaStore.isGeneratingAnswer = true;
    isGettingContextDocsSignal.value = true;

    const denoisedQuestionParam =
      removeExtraSpacesAndBeforePunctuation(questionParam);

    let contextDocs, cachedAnswer, rateLimitWarning;
    try {
      ({
        contextDocs,
        answer: cachedAnswer,
        rateLimitWarning,
      } = await getContextDocsAndAnswer(
        // eslint-disable-next-line qwik/valid-lexical-scope
        // controllerSignal.value.signal,
        {
          question: denoisedQuestionParam,
          party: partyParam,
        }
      ));
    } catch (err) {
      console.error(err);
      answerSignal.value = "";
      isGettingContextDocsSignal.value = false;
      qnaStore.isGeneratingAnswer = false;
      await imitateAiAnswer(somethingWentWrongMessage, answerSignal);
      return;
    }

    answerSignal.value = "";
    isGettingContextDocsSignal.value = false;

    if (cachedAnswer) {
      await imitateAiAnswer(cachedAnswer, answerSignal);
      qnaStore.contextDocs = contextDocs!;
      qnaStore.isGeneratingAnswer = false;
      return;
    }

    if (rateLimitWarning) {
      await imitateAiAnswer(rateLimitWarning, answerSignal);
      qnaStore.isGeneratingAnswer = false;
      return;
    }

    let stream;
    try {
      // eslint-disable-next-line qwik/valid-lexical-scope
      stream = await generateAnswer(controllerSignal.value.signal, {
        question: denoisedQuestionParam,
        contextDocs: contextDocs!,
        party: partyParam,
      });
    } catch (err) {
      console.error(err);
      await imitateAiAnswer(somethingWentWrongMessage, answerSignal);
      qnaStore.isGeneratingAnswer = false;
      return;
    }

    try {
      for await (const chunk of stream) {
        answerSignal.value += chunk;
      }
    } catch (err) {
      console.error(err);
      await imitateAiAnswer(somethingWentWrongMessage, answerSignal);
      qnaStore.isGeneratingAnswer = false;
      return;
    }

    qnaStore.contextDocs = contextDocs!;
    qnaStore.isGeneratingAnswer = false;

    cleanup(() => {
      qnaStore.isGeneratingAnswer = false;
      isGettingContextDocsSignal.value = false;
      qnaStore.contextDocs = [];
      answerSignal.value = "";
      // eslint-disable-next-line qwik/valid-lexical-scope
      controllerSignal.value?.abort();
    });
  });

  return (
    <AIMessageBox
      message={
        !questionSchema.safeParse(questionParam).success
          ? welcomeMessage
          : isGettingContextDocsSignal.value
          ? "Przeszukuję dokumenty..."
          : answerSignal.value
      }
      class={cn(className, "min-h-[20rem] h-full")}
      avatarClassName={cn(isGettingContextDocsSignal.value && "animate-bounce")}
      hasDisclaimer
    />
  );
});
