CREATE TABLE `calendarEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(190) NOT NULL,
	`eventType` enum('official','guidance','calculated','observance') NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`startAt` timestamp NOT NULL,
	`endAt` timestamp,
	`countryCode` varchar(8),
	`sourceId` int,
	`lastReviewedAt` timestamp,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendarEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `calendarEvents_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contentItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionId` int,
	`type` enum('guide','article','landing','faq') NOT NULL,
	`status` enum('draft','in_review','approved','published','archived') NOT NULL DEFAULT 'draft',
	`title` varchar(255) NOT NULL,
	`slug` varchar(190) NOT NULL,
	`excerpt` text,
	`body` text,
	`h1` varchar(255),
	`seoTitle` varchar(255),
	`seoDescription` varchar(320),
	`canonicalPath` varchar(255),
	`indexable` boolean NOT NULL DEFAULT false,
	`authorId` int,
	`reviewerId` int,
	`publishedAt` timestamp,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `contentItems_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contentRevisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`version` int NOT NULL,
	`status` enum('draft','in_review','approved','published','archived') NOT NULL,
	`changeSummary` varchar(500) NOT NULL,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentRevisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`sourceId` int NOT NULL,
	`citationNote` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channel` enum('in_app','email','browser') NOT NULL,
	`topic` enum('important_guide','calendar_event') NOT NULL,
	`consented` boolean NOT NULL DEFAULT false,
	`consentedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relatedLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originType` enum('content','tool','event') NOT NULL,
	`originId` int NOT NULL,
	`targetType` enum('content','tool','event') NOT NULL,
	`targetId` int NOT NULL,
	`relationship` enum('next_step','explanation','related','source_context') NOT NULL,
	`rationale` varchar(500),
	`status` enum('suggested','approved','disabled') NOT NULL DEFAULT 'suggested',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relatedLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`description` text,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sections_id` PRIMARY KEY(`id`),
	CONSTRAINT `sections_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`publisher` varchar(255),
	`url` varchar(2048) NOT NULL,
	`sourceType` enum('official','primary','editorial','reference') NOT NULL DEFAULT 'reference',
	`notes` text,
	`accessedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `toolDefinitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`slug` varchar(190) NOT NULL,
	`category` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`logicVersion` varchar(40) NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`relatedContentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `toolDefinitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `toolDefinitions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','author','editor','admin','super_admin') NOT NULL DEFAULT 'user';