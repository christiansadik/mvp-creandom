import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/router";
import { createTRPCContext } from "@/lib/trpc/context";
import { type NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      return {
        session: null,
        prisma: (await import("@/lib/prisma")).prisma,
        req: req as unknown as Parameters<typeof createTRPCContext>[0]["req"],
        res: {} as Parameters<typeof createTRPCContext>[0]["res"],
      };
    },
  });

export { handler as GET, handler as POST };
