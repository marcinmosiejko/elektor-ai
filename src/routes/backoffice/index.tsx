import type { RequestEvent, RequestHandler } from "@builder.io/qwik-city";
import { backofficeGuard } from "./helpers";

export const onRequest: RequestHandler = async (event: RequestEvent) => {
  backofficeGuard(event);
  throw event.redirect(307, `/backoffice/context`);
};
