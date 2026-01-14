import { Command } from "commander";
import { version } from "../package.json";

async function main() {
  const program = new Command();

  program
    .name("laya-resource-parser")
    .alias("lr")
    .version(version, "-V, --version")
    .description("Laya资源解析")

  await program.parseAsync(process.argv);
}

main().catch(err => {
  console.error("An error occurred:", err);
  process.exit(1);
})
