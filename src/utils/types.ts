import type { z } from "zod";
import type {
  contextDocSchema,
  partySchema,
  normalizedDocSchema,
} from "./schemas";

export type Theme = "light" | "dark";

export interface QnA {
  party: Party;
  question: string | null;
  class?: string;
}

export type Party = z.infer<typeof partySchema>;

export type NormalizedDoc = z.infer<typeof normalizedDocSchema>;
export type ContextDoc = z.infer<typeof contextDocSchema>;
