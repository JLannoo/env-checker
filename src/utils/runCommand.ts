import chalk from "chalk";
import { execSync } from "child_process";
import type { ExecSyncOptions } from "child_process";

export default function runCommand(command: string, options: ExecSyncOptions = {}) {
	console.log(chalk.blue(`Running command: ${command}`));

	try {
		execSync(command, { stdio: "inherit", ...options });
	} catch (error: any) {
		console.log(chalk.red(error.stderr.toString()));
	}
}
