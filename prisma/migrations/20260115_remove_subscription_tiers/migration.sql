-- Remove subscription-related columns from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionTier";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionEnd";
ALTER TABLE "User" DROP COLUMN IF EXISTS "bonusVotes";

-- Remove subscription stats from GlobalStats table
ALTER TABLE "GlobalStats" DROP COLUMN IF EXISTS "totalPremium";
ALTER TABLE "GlobalStats" DROP COLUMN IF EXISTS "totalVip";

-- Drop the SubscriptionTier enum
DROP TYPE IF EXISTS "SubscriptionTier";

-- Remove subscription-related transaction types (keep the enum for other types)
-- Note: We can't directly remove enum values in PostgreSQL easily, so we recreate the enum
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";

CREATE TYPE "TransactionType" AS ENUM ('PURCHASE_PHOTO_SLOT', 'PURCHASE_BOOST', 'PURCHASE_RANK_REVEAL', 'PURCHASE_FAST_TRACK');

-- Update existing transactions to a compatible type or delete them
DELETE FROM "Transaction" WHERE "type" IN ('SUBSCRIPTION_PREMIUM', 'SUBSCRIPTION_VIP', 'PURCHASE_VOTES');

-- Alter the column to use the new enum
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType" USING "type"::text::"TransactionType";

-- Drop the old enum
DROP TYPE "TransactionType_old";

-- Drop index that referenced subscriptionTier
DROP INDEX IF EXISTS "User_subscriptionTier_idx";
