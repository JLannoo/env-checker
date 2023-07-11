#!/usr/bin/env node
import { program } from "commander";
import InitAction from "./actions/init.js";
import CheckAction from "./actions/check.js";

import { DEFAULT_SCHEMA_PATH } from "./consts.js";

program
	.version("0.0.1")
	.description("A CLI for checking your environment variables");

// Init command
export type InitOptions = {
    zod: boolean;
}
program
	.command("init")
	.description("Initialize env-checker")
	.option("--zod", "Use zod for validation")
	.action((options: InitOptions) => {
		InitAction(options);
	});

// Check command
export type CheckOptions = {
    schema: string;
}
program
	.command("check")
	.description("Check environment variables")
	.option("--schema <path>", "Path to schema file", DEFAULT_SCHEMA_PATH)
	.action((options: CheckOptions) => {
		CheckAction(options);
	});

program.parse(process.argv);