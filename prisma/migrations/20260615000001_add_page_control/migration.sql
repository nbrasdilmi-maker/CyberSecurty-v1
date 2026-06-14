-- CreateTable
CREATE TABLE "page_control" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceTitle" TEXT,
    "maintenanceMessage" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_control_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_control_pageKey_key" ON "page_control"("pageKey");

-- CreateIndex
CREATE INDEX "page_control_route_idx" ON "page_control"("route");

-- CreateIndex
CREATE INDEX "page_control_pageKey_idx" ON "page_control"("pageKey");

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PAGE_CONTROL_UPDATE';
