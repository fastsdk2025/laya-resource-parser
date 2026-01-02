import { Command } from "commander";
import { version } from "../package.json";

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("lr")
    .version(version)
    .description("Laya资源解析器 - 解析Laya项目中的资源依赖关系")

  await program.parseAsync(process.argv);
}

if (require.main === module) {
  main().catch((error: Error) => {
    console.error("CLI 执行失败: ", error.message);
    process.exit(1);
  })
}
