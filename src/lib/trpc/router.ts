import { router } from "./context";
import { authRouter } from "./routers/auth";
import { documentRouter } from "./routers/document";
import { ndaRouter } from "./routers/nda";

export const appRouter = router({
  auth: authRouter,
  document: documentRouter,
  nda: ndaRouter,
});

export type AppRouter = typeof appRouter;
