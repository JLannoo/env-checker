import { CheckOptions } from "../index.js";
import chalk from "chalk";

import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SCHEMA_PATH } from "../consts.js";

import dotenv from "dotenv";
dotenv.config();

type ParsedSchemaType = Record<string, string|number|Array<unknown>>;
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
		console.log(chalk.red(`No ${DEFAULT_SCHEMA_PATH} file found!`));
		return;
	}

	// Check if .env file exists
	if(!fs.existsSync(path.join(cwd, ".env"))) {
		console.log(chalk.red("No .env file found!"));
		return;
	}

	// Check if schema.ts is valid
	const schemaPath = "file://" + path.join(cwd, DEFAULT_SCHEMA_PATH);
	const schema = await import(schemaPath);

	// Check if .env file is valid
	const env = process.env;

	// Check if zod is installed
	let hasZod = false;
	try { 
		// @ts-ignore
		const ZodObject = (await import("zod")).ZodObject;
		hasZod = true;
	} catch(e: any) {
		if(e.code === "MODULE_NOT_FOUND") {
			console.log(chalk.red("Zod is not installed. Did you you mean to use Zod for schema validation?"));
			console.log(chalk.red("To use Zod, run `env-checker init --zod` and when asked if you want to use Zod, answer yes."));
			return;
		}
	}

	const { ServerSchema, ClientSchema } = schema;

	// Validate schema
	if(hasZod) {
		console.log(chalk.yellow("Zod is installed, using Zod for schema validation."));
		try {
			const errorsServer = validateZodSchema(ServerSchema, env);
			const errorsClient = validateZodSchema(ClientSchema, env);

			if(errorsServer.length) printErrors("server", errorsServer);
			if(errorsClient.length) printErrors("client", errorsClient);
	
			if(!errorsServer.length && !errorsClient.length) printSuccess();
		} catch(e: any) {
			console.log(chalk.red(`Zod is installed, but ${DEFAULT_SCHEMA_PATH} is not a valid ZodObject.`));
			console.log(chalk.red("To use Zod, run `env-checker init --zod`."));
		}

	} else {
		console.log(chalk.yellow("Zod is not installed, using vanilla JS for schema validation."));
		const errorsServer = validateVanillaSchema(ServerSchema, env);
		const errorsClient = validateVanillaSchema(ClientSchema, env);

		if(errorsServer.length) printErrors("server", errorsServer);
		if(errorsClient.length) printErrors("client", errorsClient);

		if(!errorsServer.length && !errorsClient.length) printSuccess();
	}
}

function validateZodSchema(schema: any, env: NodeJS.ProcessEnv){
	const result = schema.safeParse(env);

	let errors = [];
	
	if(!result.success) {
		errors = result.error.issues.map((issue: any) => `${issue.path.join(".")}: ${issue.message}`);
	}

	return errors;
}

function validateVanillaSchema(schema: ParsedSchemaType, env: NodeJS.ProcessEnv){
	const errors: string[] = [];

	for(const key in schema) {
		if(!(key in env)) {
			errors.push(`Missing variable ${key}`);
			continue;
		}

		const value = env[key];
		const expectedType = schema[key];

		if (Array.isArray(expectedType)) {
			if(!expectedType.includes(value)) {
				errors.push(`${key}: Expected one of [${expectedType.join(", ")}], got ${value}`);
			}
		} else if(typeof value !== expectedType) {
			errors.push(`${key}: Expected type ${expectedType}, got ${value}`);
		}
	}

	return errors;
}

function printErrors(context: "client" | "server", errors: string[]) {
	console.log(chalk.red(`❌ Invalid ${context} .env file! ❌`));
	console.log(chalk.red("Errors:"));
	for(const error of errors) {
		console.log(chalk.red(`- ${error}`));
	}
}

function printSuccess() {
	console.log(chalk.green("✅ Environment variables are valid! ✅"));
}