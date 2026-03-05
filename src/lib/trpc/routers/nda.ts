import { z } from "zod";
import { NdaStatus } from "@prisma/client";
import { router, protectedProcedure } from "../context";
import { TRPCError } from "@trpc/server";

export const ndaRouter = router({
  getClauses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.ndaClause.findMany({ orderBy: { name: "asc" } });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        duration: z.string().optional(),
        clauseIds: z.array(z.string()),
        recipientEmail: z.string().email().optional(),
        documentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const nda = await ctx.prisma.ndaAgreement.create({
        data: {
          creatorId: ctx.session.user.id,
          title: input.title,
          description: input.description,
          duration: input.duration,
          recipientEmail: input.recipientEmail,
          documentId: input.documentId,
          clauses: {
            create: input.clauseIds.map((clauseId) => ({ clauseId })),
          },
        },
        include: { clauses: { include: { clause: true } } },
      });
      return nda;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.ndaAgreement.findMany({
      where: { creatorId: ctx.session.user.id },
      include: { clauses: { include: { clause: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const nda = await ctx.prisma.ndaAgreement.findFirst({
        where: { id: input.id, creatorId: ctx.session.user.id },
        include: { clauses: { include: { clause: true } }, document: true },
      });
      if (!nda) throw new TRPCError({ code: "NOT_FOUND" });
      return nda;
    }),

  accept: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const nda = await ctx.prisma.ndaAgreement.findFirst({
        where: { id: input.id, recipientId: ctx.session.user.id },
      });
      if (!nda) throw new TRPCError({ code: "NOT_FOUND" });

      // Web Headers API (.get()) — compatibile con NextRequest (fetch adapter)
      // Preferire x-real-ip (iniettato da Vercel/proxy fidato) su x-forwarded-for
      const ip =
        ctx.req.headers.get("x-real-ip") ??
        ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      const agent = ctx.req.headers.get("user-agent") ?? "unknown";

      return ctx.prisma.ndaAgreement.update({
        where: { id: input.id },
        data: {
          acceptedAt: new Date(),
          acceptorIp: ip,
          acceptorAgent: agent,
          status: NdaStatus.ACCEPTED,
        },
      });
    }),
});
