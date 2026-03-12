import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";
import type { NextRequest } from "next/server";

// Fetch-adapter context — used by App Router route handler
export const createTRPCContext = async (opts: { req: NextRequest }) => {
  // getServerSession() without req/res reads cookies via next/headers internally
  const session = await getServerSession(authOptions);
  return {
    session,
    prisma,
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const session = ctx.session;
  return next({ ctx: { ...ctx, session } });
});
