import type { Command } from "commander";

export function registerParseCommand(program: Command) {
  program
    .command("parse")
    .action(() => {
      console.log("Parse Command")
    })
}
