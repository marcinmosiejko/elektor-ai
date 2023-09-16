import { z } from "zod";
import {
  KOALICJA_OBYWATELSKA,
  KONFEDERACJA,
  LEWICA,
  PLACEHOLDER_PARTY,
  PRAWO_I_SPRAWIEDLIWOSC,
  PSL,
  TRZECIA_DROGA,
} from "./constants";

export const questionSchema = z
  .string({ required_error: "Pytanie jest wymagane." })
  .min(5, {
    message: "Pytanie musi mieć przynajmniej 5 znaków.",
  })
  .max(100, {
    message: "Pytanie może mieć maksymalnie 100 znaków.",
  });

export const partySchema = z.enum(
  [
    KOALICJA_OBYWATELSKA,
    KONFEDERACJA,
    PRAWO_I_SPRAWIEDLIWOSC,
    LEWICA,
    PSL,
    TRZECIA_DROGA,
    PLACEHOLDER_PARTY,
  ],
  {
    required_error: "Wybierz partię.",
  }
);

const pageContentSchema = z
  .string()
  .min(1, { message: "Treść strony musi mieć przynajmniej 1 znak." });

export const contextDocSchema = z.object({
  pageContent: pageContentSchema,
  metadata: z.object({
    party: partySchema,
    id: z.string(),
    chapterName: z.string(),
    pageNumber: z.number(),
  }),
});

export const contextDocsSchema = z.array(contextDocSchema);

export const normalizedDocSchema = z.object({
  pageContent: pageContentSchema,
  metadata: z.object({
    chapterName: z.string(),
    pageNumber: z.number(),
  }),
});

export const normalizedDocsSchema = z.array(normalizedDocSchema);

export const answerSchema = z.string().min(5, {
  message: "Odpowiedź musi mieć przynajmniej 5 znaków.",
});

export const searchCountSchema = z.number();

export const cachedContextDocsAndAnswerSchema = z.object({
  contextDocs: contextDocsSchema,
  answer: answerSchema,
  searchCount: searchCountSchema,
});
