import { z } from "zod";
import bcrypt from "bcryptjs";
import { router, publicProcedure, protectedProcedure } from "../context";
import { TRPCError } from "@trpc/server";
import { UserRole, PlanType } from "@prisma/client";

// In-memory mock OTP store (MVP only)
const otpStore: Record<string, string> = {};

export const authRouter = router({
  // Step 1: create user with email + password + role
  signupStep1: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        role: z.nativeEnum(UserRole),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email già registrata" });

      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: input.role,
          plan: input.role === UserRole.COMPANY ? PlanType.FREE : PlanType.JUST_ONE_TRY,
        },
      });
      return { userId: user.id };
    }),

  // Step 2a: Creative personal info
  signupStep2Creative: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        fullName: z.string().min(2),
        birthDate: z.string().optional(),
        birthPlace: z.string().optional(),
        codiceFiscale: z.string().optional(),
        partitaIva: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.profileCreative.create({
        data: {
          userId: input.userId,
          fullName: input.fullName,
          birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
          birthPlace: input.birthPlace,
          codiceFiscale: input.codiceFiscale,
          partitaIva: input.partitaIva,
        },
      });
      return { ok: true };
    }),

  // Step 2b: Company info
  signupStep2Company: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        ragioneSociale: z.string().min(2),
        formaGiuridica: z.string().optional(),
        indirizzoSede: z.string().optional(),
        codiceFiscaleIva: z.string().optional(),
        codiceSDI: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.profileCompany.create({
        data: {
          userId: input.userId,
          ragioneSociale: input.ragioneSociale,
          formaGiuridica: input.formaGiuridica,
          indirizzoSede: input.indirizzoSede,
          codiceFiscaleIva: input.codiceFiscaleIva,
          codiceSDI: input.codiceSDI,
        },
      });
      return { ok: true };
    }),

  // Step 2c: Company referente
  signupStep2bCompanyRef: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        referenteName: z.string(),
        referenteEmail: z.string().email(),
        referenteCF: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.profileCompany.update({
        where: { userId: input.userId },
        data: {
          referenteName: input.referenteName,
          referenteEmail: input.referenteEmail,
          referenteCF: input.referenteCF,
        },
      });
      return { ok: true };
    }),

  // Step 3: Save phone and generate mock OTP
  signupStep3Phone: publicProcedure
    .input(z.object({ userId: z.string(), phone: z.string().min(6) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { phone: input.phone },
      });
      // Mock OTP
      otpStore[input.userId] = "123456";
      return { ok: true };
    }),

  // Step 4: Verify OTP
  signupStep4VerifyOTP: publicProcedure
    .input(z.object({ userId: z.string(), otp: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const expected = otpStore[input.userId] ?? "123456";
      if (input.otp !== expected) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Codice OTP non valido" });
      }
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { phoneVerified: true },
      });
      delete otpStore[input.userId];
      return { ok: true };
    }),

  // Step 5: Set plan
  signupStep5Plan: publicProcedure
    .input(z.object({ userId: z.string(), plan: z.nativeEnum(PlanType) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { plan: input.plan },
      });
      return { ok: true };
    }),

  // Step 6: Complete onboarding
  signupComplete: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { onboardingDone: true },
      });
      return { ok: true };
    }),

  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: { profileCreative: true, profileCompany: true },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),
});
