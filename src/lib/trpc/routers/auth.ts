import { z } from "zod";
import bcrypt from "bcryptjs";
import { router, publicProcedure, protectedProcedure } from "../context";
import { TRPCError } from "@trpc/server";
import { UserRole, PlanType } from "@prisma/client";
import { COMMON_PASSWORDS } from "@/lib/common-passwords";

interface OtpEntry {
  code: string;
  createdAt: Date;
  attempts: number;
}

// In-memory OTP store (MVP — sostituire con Redis/DB in produzione)
const otpStore: Record<string, OtpEntry> = {};

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minuti
const OTP_MAX_ATTEMPTS = 3;

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
      // Password denylist (NIST SP 800-63B)
      if (COMMON_PASSWORDS.has(input.password.toLowerCase())) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Password troppo comune, sceglierne una più sicura" });
      }

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
  signupStep2cCompanyRef: publicProcedure
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

  // Step 3: Save phone and generate OTP
  signupStep3Phone: publicProcedure
    .input(z.object({ userId: z.string(), phone: z.string().min(6) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { phone: input.phone },
      });
      // In dev con BYPASS_OTP=true usa codice fisso, altrimenti genera random
      const code =
        process.env.BYPASS_OTP === "true"
          ? "123456"
          : String(Math.floor(100000 + Math.random() * 900000));
      otpStore[input.userId] = { code, createdAt: new Date(), attempts: 0 };
      return { ok: true };
    }),

  // Step 4: Verify OTP
  signupStep4VerifyOTP: publicProcedure
    .input(z.object({ userId: z.string(), otp: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const entry = otpStore[input.userId];
      if (!entry) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nessun OTP generato per questo utente" });
      }
      // Controllo scadenza (5 minuti)
      if (Date.now() - entry.createdAt.getTime() > OTP_TTL_MS) {
        delete otpStore[input.userId];
        throw new TRPCError({ code: "BAD_REQUEST", message: "OTP scaduto, richiedi un nuovo codice" });
      }
      // Controllo tentativi massimi
      if (entry.attempts >= OTP_MAX_ATTEMPTS) {
        delete otpStore[input.userId];
        throw new TRPCError({ code: "BAD_REQUEST", message: "Troppi tentativi, richiedi un nuovo OTP" });
      }
      if (input.otp !== entry.code) {
        entry.attempts += 1;
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

  // Get current user profile — passwordHash escluso intenzionalmente
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
        phone: true,
        phoneVerified: true,
        onboardingDone: true,
        createdAt: true,
        updatedAt: true,
        profileCreative: true,
        profileCompany: true,
      },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),
});
