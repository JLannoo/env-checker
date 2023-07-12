import chalk from "chalk";
import fs from "node:fs";

import inquirer from "inquirer";

import { DEFAULT_DECLARATION_PATH, DEFAULT_SCHEMA_PATH } from "../consts.js";
import { InitOptions } from "../index.js";
import runCommand from "../utils/runCommand.js";
import { getUserPackageManager } from "../utils/getUserPackageManager.js";

export default async function initAction(options: InitOptions) {
	// Create /env/ folder in root
	if(!fs.existsSync("env")) fs.mkdirSync("env");

	// Create schema.ts file in /env/
	fs.writeFileSync(DEFAULT_SCHEMA_PATH, options.zod ? defaultZodSchema() : defaultSchema());

	// Create env.d.ts file in /env/
	fs.writeFileSync(DEFAULT_DECLARATION_PATH, options.zod ? tsZodNodeEnv() : tsNodeEnv());

	// Ask to install zod
	if(options.zod) {
		await inquirer.prompt([{
			type: "confirm",
			name: "zod",
			message: "Do you want to install zod?",
			default: true,
		}]).then((answers) => {
			if(answers.zod) {
				console.log(chalk.cyanBright("Instaling zod..."));
				const pacMan = getUserPackageManager();
				
				if(pacMan === "yarn") return runCommand("yarn add zod");
				if(pacMan === "pnpm") return runCommand("pnpm add zod");
				if(pacMan === "npm") return runCommand("npm i zod");
			}
		});
	}

	console.log(chalk.greenBright("Done!", chalk.bold("env-checker"), "is ready to use! \n"));

	console.log(chalk.blueBright("Setup the schema in", chalk.white(DEFAULT_SCHEMA_PATH)));
	console.log(chalk.blueBright("Run", chalk.bold("`npx env-checker check`"), "to check your environment variables!"));
}

function defaultSchema() {
	return `// Allows [enums] and "string" types
	
export const ServerSchema = {
	// NODE_ENV: ["development", "production", "test"],
    // NEW_STRING: "string",
};

export const ClientSchema = {
	// NEW_VARIABLE: "string",
};
`;
}

function defaultZodSchema(){
	return `import * as z from "zod";

export const ServerSchema = z.object({
    // NODE_ENV: z.enum(["development", "production", "test"]),
    // NEW_VARIABLE: z.string(),
});

export const ClientSchema = z.object({
    // NEW_VARIABLE: z.string(),
});
`;
}

function tsNodeEnv() {
	return `import { ServerSchema , ClientSchema } from "./schema.mjs";

type Schema = typeof ServerSchema & typeof ClientSchema;

declare global {
	declare namespace NodeJS {
		export interface ProcessEnv extends Schema {}
	}
}
`;
}

function tsZodNodeEnv() {
	return `import { ServerSchema , ClientSchema } from "./schema.mjs";

type Schema = z.infer<typeof ServerSchema> & z.infer<typeof ClientSchema>;

declare global {
	declare namespace NodeJS {
		export interface ProcessEnv extends Schema {}
	}
}
`;
}
