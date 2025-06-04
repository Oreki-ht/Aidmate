-- CreateEnum
CREATE TYPE "CaseSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "patientName" TEXT,
    "patientAge" INTEGER,
    "patientGender" TEXT,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "CaseSeverity" NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "directorId" TEXT NOT NULL,
    "paramedicId" TEXT,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_paramedicId_fkey" FOREIGN KEY ("paramedicId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
