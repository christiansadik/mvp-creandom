import { z } from "zod";
import { router, protectedProcedure } from "../context";
import { DocumentType } from "@prisma/client";

export const documentRouter = router({
  // Create document record (after client-side upload or local stub)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        fileUrl: z.string(),
        fileName: z.string(),
        fileSize: z.number().int().positive(),
        mimeType: z.string(),
        sha256Hash: z.string(),
        type: z.nativeEnum(DocumentType).default(DocumentType.TIMESTAMP),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.prisma.document.create({
        data: {
          userId: ctx.session.user.id,
          title: input.title,
          description: input.description,
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          sha256Hash: input.sha256Hash,
          type: input.type,
        },
      });
      return doc;
    }),

  list: protectedProcedure
    .input(
      z.object({
        filter: z.nativeEnum(DocumentType).optional(),
        sort: z.enum(["newest", "oldest"]).default("newest"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const docs = await ctx.prisma.document.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input?.filter ? { type: input.filter } : {}),
        },
        orderBy: { createdAt: input?.sort === "oldest" ? "asc" : "desc" },
        include: { nda: true },
      });
      return docs;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const doc = await ctx.prisma.document.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
        include: { nda: { include: { clauses: { include: { clause: true } } } } },
      });
      return doc;
    }),
});
