import {
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import type { ContextDoc } from "~/utils/types";

export interface QnAInitialState {
  prevQuestion: string;
  prevParty: string;
  contextDocs: ContextDoc[];
  isGeneratingAnswer: boolean;
}

const initialState: QnAInitialState = {
  prevQuestion: "",
  prevParty: "",
  contextDocs: [],
  isGeneratingAnswer: false,
};

export const QnAContext = createContextId<QnAInitialState>("qnaContext");

export const QnaProvider = component$(() => {
  const qnaContext = useStore<QnAInitialState>(initialState);
  useContextProvider(QnAContext, qnaContext);

  return (
    <>
      <Slot />
    </>
  );
});
