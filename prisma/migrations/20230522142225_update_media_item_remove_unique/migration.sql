-- DropIndex
DROP INDEX `MediaItem_tmdbId_key` ON `MediaItem`;

-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;
