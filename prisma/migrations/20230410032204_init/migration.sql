-- CreateTable
CREATE TABLE `Provider` (
    id VARCHAR(36) DEFAULT (uuid()),
    name VARCHAR(250)  NOT NULL default '',
    active  BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Title` (
    id VARCHAR(36) DEFAULT (uuid()),
    name VARCHAR(250)  NOT NULL default '',
    tmdbId INT(11) NOT NULL,
    providerId VARCHAR(36) NOT NULL,
    synopsis TEXT NULL,
    active  BOOLEAN DEFAULT true,
    posterPath VARCHAR(191) NULL,
    backdropPath VARCHAR(191) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE INDEX `Title_tmdb_id_key` (tmdbId),
    CONSTRAINT provider_reference UNIQUE (providerId,tmdbId)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TitleMetadata` (
    id VARCHAR(36) DEFAULT (uuid()),
    metaKey VARCHAR(250)  NOT NULL default '',
    metaValue TEXT NULL,
    titleId VARCHAR(36) NOT NULL,
    active  BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_title_metadata_title_id`(`titleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Title` ADD CONSTRAINT `Title_provider_id_fkey` FOREIGN KEY (`providerId`) REFERENCES `Provider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `TitleMetadata` ADD CONSTRAINT `TitleMetadata_title_id_fkey` FOREIGN KEY (`titleId`) REFERENCES `Title`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- init the sample data
INSERT INTO Provider (name) VALUES ('tv'),('movie');
