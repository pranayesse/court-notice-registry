-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'DISMISSED', 'ACQUITTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('WRONG_PERSON', 'FALSE_CASE', 'PRIVATE_INFO', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('PENDING', 'RESOLVED_REMOVED', 'RESOLVED_KEPT');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('HEARING_REMINDER', 'SIGHTING_ADDED', 'CASE_UPDATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT,
    "isAdvocate" BOOLEAN NOT NULL DEFAULT false,
    "barCouncilNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "cnrNumber" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "accusedName" TEXT NOT NULL,
    "accusedAliases" TEXT[],
    "accusedCity" TEXT,
    "accusedEmployer" TEXT,
    "accusedPhotoUrl" TEXT,
    "courtName" TEXT NOT NULL,
    "courtState" TEXT NOT NULL,
    "courtDistrict" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "caseYear" INTEGER NOT NULL,
    "filingDate" TIMESTAMP(3),
    "nextHearingDate" TIMESTAMP(3),
    "hearingCount" INTEGER NOT NULL DEFAULT 0,
    "missedHearings" INTEGER NOT NULL DEFAULT 0,
    "lastOrderSummary" TEXT,
    "rawEcourtsData" JSONB,
    "filedById" TEXT NOT NULL,
    "filerRole" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "accusedStatement" TEXT,
    "accusedResponseAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hearing" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT,
    "appeared" BOOLEAN,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hearing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sighting" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "platform" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sighting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "filedById" TEXT NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "type" "AlertType" NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Case_cnrNumber_key" ON "Case"("cnrNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Case_slug_key" ON "Case"("slug");

-- CreateIndex
CREATE INDEX "Case_accusedName_idx" ON "Case"("accusedName");

-- CreateIndex
CREATE INDEX "Case_cnrNumber_idx" ON "Case"("cnrNumber");

-- CreateIndex
CREATE INDEX "Case_courtState_courtDistrict_idx" ON "Case"("courtState", "courtDistrict");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_filedById_fkey" FOREIGN KEY ("filedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hearing" ADD CONSTRAINT "Hearing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sighting" ADD CONSTRAINT "Sighting_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sighting" ADD CONSTRAINT "Sighting_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_filedById_fkey" FOREIGN KEY ("filedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
