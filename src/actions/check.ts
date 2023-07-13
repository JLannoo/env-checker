import { CheckOptions } from "../index.js";
import chalk from "chalk";

import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import { schemaIsZodIsh } from "../utils/schemaUtils.js";
dotenv.config();

type ParsedSchemaType = Record<string, string|number|Array<unknown>>;
export default async function CheckAction(options: CheckOptions){
	// Get path where command was run
	const cwd = process.cwd();

	// Check if schema.ts exists
	if(!fs.existsSync(path.join(cwd, options.schema))) {
		console.log(chalk.red(`No ${options.schema} file found!`));
		process.exit(1);
	}

	// Check if .env file exists
	if(!fs.existsSync(path.join(cwd, options.env))) {
		console.log(chalk.red(`No ${options.env} file found!`));
		process.exit(1);
	}

	// Check if schema.ts is valid
	const schemaPath = "file://" + path.join(cwd, options.schema);
	const schema = await import(schemaPath);

	// Check if .env file is valid
	const env = process.env;

	const { ServerSchema, ClientSchema } = schema;

	// Validate correct schema type
	const schemasAreZod = schemaIsZodIsh(ServerSchema) && schemaIsZodIsh(ClientSchema);
	if(schemasAreZod && !options.zod) {
		console.log(chalk.red("It looks like your schema is a ZodObject, but you are not using Zod for validation."));
		console.log(chalk.red("To use Zod, run `env-checker check --zod`."));
		process.exit(1);
	}
	if(!schemasAreZod && options.zod) {
		console.log(chalk.red("It looks like your schema is not a ZodObject, but you are using Zod for validation."));
		console.log(chalk.red("To use vanilla JS, run `env-checker check`."));
		process.exit(1);
	}

	// Validate schema
	if(options.zod) {
		console.log(chalk.yellow("Using Zod for schema validation."));
		try {
			const errorsServer = validateZodSchema(ServerSchema, env);
			const errorsClient = validateZodSchema(ClientSchema, env);

			if(errorsServer.length) printErrors("server", errorsServer);
			if(errorsClient.length) printErrors("client", errorsClient);
	
			if(!errorsServer.length && !errorsClient.length) {
				printSuccess();
				process.exit(0);
			}

			process.exit(1);
		} catch(e: any) {
			console.log(chalk.red(`Zod is not installed, or there was an error validating the schema.`));
			console.log(chalk.red("To use Zod, run `env-checker init --zod`."));

			process.exit(1);
		}

	} else {
		console.log(chalk.yellow("Using vanilla JS for schema validation."));
		const errorsServer = validateVanillaSchema(ServerSchema, env);
		const errorsClient = validateVanillaSchema(ClientSchema, env);

		if(errorsServer.length) printErrors("server", errorsServer);
		if(errorsClient.length) printErrors("client", errorsClient);

		if(!errorsServer.length && !errorsClient.length) {
			printSuccess();
			process.exit(0);
		}

		process.exit(1);
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
