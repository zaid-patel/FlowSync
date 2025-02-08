-- DropForeignKey
ALTER TABLE "Zap" DROP CONSTRAINT "Zap_userId_fkey";

-- AlterTable
ALTER TABLE "Zap" ALTER COLUMN "userId" DROP DEFAULT;
