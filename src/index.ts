#!/usr/bin/env node
import { program } from "commander";
import InitAction from "./actions/init.js";
import CheckAction from "./actions/check.js";

import { DEFAULT_PATHS } from "./consts.js";

program
	.version("0.0.4")
	.description("A CLI for checking your environment variables");

// Init command
export type InitOptions = {
	folder: string;
    zod: boolean;
}
program
	.command("init")
	.description("Initialize env-checker")
	.option("--folder <path>", "Path to folder where schema and declaration will be created", DEFAULT_PATHS.FOLDER)
	.option("--zod", "Use zod for validation")
	.action((options: InitOptions) => {
		InitAction(options);
	});

// Check command
export type CheckOptions = {
    schema: string;
	zod: boolean;
	env: string;
}
program
	.command("check")
	.description("Check environment variables")
	.option("--schema <path>", "Path to schema file", `${DEFAULT_PATHS.FOLDER}/${DEFAULT_PATHS.SCHEMA}`)
	.option("--env <path>", "Path to .env file", `${DEFAULT_PATHS.ENV}`)
	.option("--zod", "Use zod for validation")
	.action((options: CheckOptions) => {
		CheckAction(options);
	});

program.parse(process.argv);