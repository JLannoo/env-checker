import chalk from "chalk";
import readline from "node:readline";

export default function question(question: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const questionString = `${question} (y/n): `;
    return new Promise((resolve) => {
        rl.question(chalk.bold.cyanBright(questionString), (answer) => {
            rl.close();
            
            resolve(answer.toLowerCase() === "y" || answer === "")
        });
    });
}
