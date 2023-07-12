import type { Session } from "@auth/core/types";
import type { RequestEvent } from "@builder.io/qwik-city";

export const backofficeGuard = (event: RequestEvent) => {
  const session: Session | null = event.sharedMap.get("session");
  if (!session || new Date(session.expires) < new Date()) {
    throw event.redirect(
      302,
      `/api/auth/signin?callbackUrl=${event.url.pathname}`
    );
  }

  if (session.user?.email === event.env.get("ADMIN_EMAIL")) return;

  throw event.redirect(302, `/`);
};
