import { CheckOptions } from "../index.js";
import chalk from "chalk";

import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SCHEMA_PATH } from "../consts.js";
import { ZodObject } from "zod";

export default async function CheckAction(options: CheckOptions){
	// Get path where command was run
	const cwd = process.cwd();

	// Check if /env/ folder exists
	if(!fs.existsSync(path.join(cwd, "env"))) {
		console.log(chalk.red("No env folder found!"));
		return;
	}

	// Check if schema.ts exists
	if(!fs.existsSync(path.join(cwd, DEFAULT_SCHEMA_PATH))) {
		console.log(chalk.red("No schema.ts file found!"));
		return;
	}

}

function parseEnvFile() {
	const envFile = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
	const lines = envFile.split("\n");
	const env: Record<string, string> = {};

	for(const line of lines) {
		const [key, value] = line.split("=");
		env[key] = value;
	}

	return env;
}