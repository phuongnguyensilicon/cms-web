-- AlterTable
ALTER TABLE `CacheItem` MODIFY `value` VARCHAR(65535) NOT NULL;

-- AddForeignKey
ALTER TABLE `UserGenreMediaRoundGame` ADD CONSTRAINT `UserGenreMediaRoundGame_mediaItemId_fkey` FOREIGN KEY (`mediaItemId`) REFERENCES `MediaItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
