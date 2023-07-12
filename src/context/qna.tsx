import {
  Slot,
  component$,
  createContextId,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { DEFAULT_FO_PARTY } from "~/utils/constants";
import type { ContextDoc, Party } from "~/utils/types";

export interface QnAInitialState {
  prevQuestion: string;
  prevParty: string;
  currentParty: Party;
  contextDocs: ContextDoc[];
  isGeneratingAnswer: boolean;
}

const initialState: QnAInitialState = {
  prevQuestion: "",
  prevParty: "",
  currentParty: DEFAULT_FO_PARTY,
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
