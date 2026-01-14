import type { Command } from "commander";
import { PROJECT_ROOT } from "../../constants";
import { ParseOptions } from "./types";

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
      "Remote URL for parsing",
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
    .action((options: ParseOptions) => {
      console.log("Parse Command", options)
    })
}
