import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip api, Next internals, files with dots, and your admin area
 matcher: "/((?!api|trpc|_next|_vercel|dashboard|.*\\..*).*)",
};