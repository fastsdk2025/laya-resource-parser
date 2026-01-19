import { Chalk } from "chalk";
import type { Command } from "commander";
import { ZodSafeParseResult } from "zod";
import { PROJECT_ROOT } from "../../constants";
import { ParseCommandOptions, ParseOptionsSchema } from "./schema";
import { formatZodErrors } from "./utils";
import { runParse } from "./actions";

const chalk = new Chalk();

export function registerParseCommand(program: Command) {
  program
    .command("parse")
    .option(
      "-b, --base <path>",
      "Base path for parsing",
      PROJECT_ROOT
    )
    .requiredOption(
      "-r, --remote <url>",
      "Remote resource URL",
      (value: string): string => {
        try {
          const url = new URL(value);
          if (url.protocol !== "https:" && url.protocol !== "http:") {
            throw new Error("Invalid URL")
          }
          return value;
        } catch {
          throw new Error("Invalid URL")
        }
      }
    )
    .option(
      "-c, --concurrency <number>",
      "Concurrent processing number",
      "5"
    )
    .option(
      "-t, --timeout <ms>",
      "Timeout(ms)",
      "30000"
    )
    .option(
      "--retry <frequency>",
      "Retry frequency",
      "3"
    )
    .action(async (rawOptions) => {
      const result: ZodSafeParseResult<ParseCommandOptions> = ParseOptionsSchema.safeParse(rawOptions);

      if (!result.success) {
        console.log(chalk.red("Parameter parsing failed: "));
        const errors = formatZodErrors(result);

        for (const error of errors) {
          console.log(chalk.yellow(`  • ${error}`))
        }

        console.log(chalk.blue("\nUse --help to view the full parameter description."))
        process.exit(1)
      }

      const options: ParseCommandOptions = result.data;

      try {
        await runParse(options);
      } catch (error) {
        console.log(chalk.red("Execution failed:"))
        if (error instanceof Error) {
          console.log(chalk.red(`  ${error.message}`));
        } else {
          console.log(chalk.red(`  Unknown error: ${error}`))
        }

        process.exit(1)
      }
    })
}
