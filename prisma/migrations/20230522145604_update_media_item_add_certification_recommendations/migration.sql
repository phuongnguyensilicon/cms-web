-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AlterTable
ALTER TABLE `MediaItem` ADD COLUMN `certification` VARCHAR(191) NULL,
    ADD COLUMN `recommendationTmdbIds` VARCHAR(2000) NULL;
