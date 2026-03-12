-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CREATIVE', 'COMPANY');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('JUST_ONE_TRY', 'JUST_FEW_DATES', 'JUST_CANT_STOP', 'FREE', 'STUDIO');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TIMESTAMP', 'NDA', 'CONTRACT');

-- CreateEnum
CREATE TYPE "NdaStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "plan" "PlanType" NOT NULL DEFAULT 'JUST_ONE_TRY',
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileCreative" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "codiceFiscale" TEXT,
    "partitaIva" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileCreative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileCompany" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ragioneSociale" TEXT NOT NULL,
    "formaGiuridica" TEXT,
    "indirizzoSede" TEXT,
    "codiceFiscaleIva" TEXT,
    "codiceSDI" TEXT,
    "referenteName" TEXT,
    "referenteEmail" TEXT,
    "referenteCF" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sha256Hash" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'TIMESTAMP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NdaClause" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NdaClause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NdaAgreement" (
    "id" TEXT NOT NULL,
    "documentId" TEXT,
    "creatorId" TEXT NOT NULL,
    "recipientId" TEXT,
    "recipientEmail" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "acceptorIp" TEXT,
    "acceptorAgent" TEXT,
    "status" "NdaStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NdaAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NdaAgreementClause" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "clauseId" TEXT NOT NULL,

    CONSTRAINT "NdaAgreementClause_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileCreative_userId_key" ON "ProfileCreative"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileCompany_userId_key" ON "ProfileCompany"("userId");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NdaAgreement_documentId_key" ON "NdaAgreement"("documentId");

-- CreateIndex
CREATE INDEX "NdaAgreement_creatorId_idx" ON "NdaAgreement"("creatorId");

-- CreateIndex
CREATE INDEX "NdaAgreement_recipientId_idx" ON "NdaAgreement"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "NdaAgreementClause_agreementId_clauseId_key" ON "NdaAgreementClause"("agreementId", "clauseId");

-- AddForeignKey
ALTER TABLE "ProfileCreative" ADD CONSTRAINT "ProfileCreative_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileCompany" ADD CONSTRAINT "ProfileCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NdaAgreement" ADD CONSTRAINT "NdaAgreement_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NdaAgreement" ADD CONSTRAINT "NdaAgreement_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NdaAgreement" ADD CONSTRAINT "NdaAgreement_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NdaAgreementClause" ADD CONSTRAINT "NdaAgreementClause_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "NdaAgreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NdaAgreementClause" ADD CONSTRAINT "NdaAgreementClause_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "NdaClause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
