-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaItem` ADD COLUMN `voteAveragePercent` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Question` ADD COLUMN `subActions` VARCHAR(1000) NULL;
