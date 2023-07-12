import type { RequestHandler } from "@builder.io/qwik-city";
import { KOALICJA_OBYWATELSKA } from "~/utils/constants";
// import { component$ } from "@builder.io/qwik";

export const onRequest: RequestHandler = async ({ redirect }) => {
  throw redirect(307, `/qna/${KOALICJA_OBYWATELSKA}`);
};
