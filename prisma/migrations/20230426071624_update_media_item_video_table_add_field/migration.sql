-- AlterTable
ALTER TABLE `MediaAdditionalItem` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `source` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `MediaItem` ADD COLUMN `numberEpisodes` INTEGER NULL,
    ADD COLUMN `numberSeasons` INTEGER NULL,
    ADD COLUMN `runtime` INTEGER NULL,
    ADD COLUMN `voteAverage` DOUBLE NULL;
