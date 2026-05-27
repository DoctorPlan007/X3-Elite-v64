CREATE TABLE `legacy_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recipientName` varchar(255) NOT NULL,
	`recipientBirthdate` varchar(20),
	`message` text NOT NULL,
	`nickname` varchar(255),
	`displayOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legacy_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legacy_profile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessKeyHash` varchar(255) NOT NULL,
	`lifeStory` text,
	`values` text,
	`wayOfThinking` text,
	`wayOfSpeaking` text,
	`lifePhrase` text,
	`creatorName` varchar(255),
	`profession` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legacy_profile_id` PRIMARY KEY(`id`)
);
