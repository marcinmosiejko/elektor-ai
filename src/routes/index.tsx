import { type RequestHandler } from "@builder.io/qwik-city";
import { getRandomPartyId } from "~/utils/helpers";

export const onRequest: RequestHandler = async ({ redirect }) => {
  throw redirect(307, `/qna/${getRandomPartyId()}`);
};
