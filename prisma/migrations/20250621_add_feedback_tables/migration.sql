-- MADFAM Code Available License (MCAL) v1.0
-- Copyright (c) 2025-present MADFAM. All rights reserved.
-- Commercial use prohibited except by MADFAM and licensed partners.
-- For licensing: licensing@madfam.com

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('bug', 'feature_request', 'improvement', 'general', 'usability');

-- CreateEnum
CREATE TYPE "FeedbackSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "NPSCategory" AS ENUM ('promoter', 'passive', 'detractor');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "severity" "FeedbackSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'open',
    "rating" INTEGER,
    "tags" TEXT[],
    "reproductionSteps" TEXT[],
    "expectedBehavior" TEXT,
    "actualBehavior" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SatisfactionSurvey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallSatisfaction" INTEGER NOT NULL,
    "easeOfUse" INTEGER NOT NULL,
    "performance" INTEGER NOT NULL,
    "features" INTEGER NOT NULL,
    "design" INTEGER NOT NULL,
    "likelihoodToRecommend" INTEGER NOT NULL,
    "npsCategory" "NPSCategory" NOT NULL,
    "mostUsefulFeature" TEXT NOT NULL,
    "leastUsefulFeature" TEXT NOT NULL,
    "missingFeatures" TEXT[],
    "additionalComments" TEXT,
    "completionContext" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SatisfactionSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");
CREATE INDEX "Feedback_type_idx" ON "Feedback"("type");
CREATE INDEX "Feedback_severity_idx" ON "Feedback"("severity");
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "SatisfactionSurvey_userId_idx" ON "SatisfactionSurvey"("userId");
CREATE INDEX "SatisfactionSurvey_npsCategory_idx" ON "SatisfactionSurvey"("npsCategory");
CREATE INDEX "SatisfactionSurvey_createdAt_idx" ON "SatisfactionSurvey"("createdAt");