import { Chalk } from "chalk";
import type { Command } from "commander";
import { join } from "node:path";
import type { ZodSafeParseResult } from "zod";
import { runParse } from "./actions";
import { ParseOptionsSchema, type ParseCommandOptions } from "./schema";
import { formatZodErrors, validateHttpUrl } from "./utils";
const chalk = new Chalk();

export function registerParseCommand(program: Command) {
  program
    .command("parse")
    .description("解析资源依赖关系")
    .option(
      "-b, --base <path>",
      "基础路径(默认为当前目录下的src目录)",
      join(process.cwd(), "src")
    )
    .option(
      "-r, --remote <url>",
      "远程资源URL(必须为有效的HTTP/HTTPS URL)",
      validateHttpUrl,
    )
    .option("-c, --concurrency <number>", "并发处理数", "5")
    .option("-d, --debug", "启动调式模式", false)
    .option("--timeout <ms>", "超时时间(毫秒)", "30000")
    .option("--retry <count>", "重试次数", "3")
    .option("--preload <path...>", "预加载资源映射(plf/plfb), 自动识别格式")
    .option("--preload-plf <path...>", "显式指定 plf(JSON) 格式的预加载资源")
    .option("--preload-plfb <path...>", "显式指定 plfb(Binary/Byte) 格式的预加载资源")
    .option(
      "--fileconfig <path>",
      "图集配置文件路径(默认为基础目录下的fileconfig.json)",
      join(process.cwd(), "src", "fileconfig.json")
    )
    .option(
      "--pkg-map <path>",
      "分包配置文件路径(默认为基础目录下的pkg-map.json)",
      join(process.cwd(), "src", "pkg-map.json")
    )
    .option(
      "--bundle <path>",
      "压缩分包配置文件路径(默认为基础目录下的bundle.json)",
      join(process.cwd(), "src", "bundle.json")
    )
    .action(async (rawOptions) => {
      const result: ZodSafeParseResult<ParseCommandOptions> = ParseOptionsSchema.safeParse(rawOptions);

      if (!result.success) {
        console.log(chalk.red("❌ 参数解析失败: "));
        const errors = formatZodErrors(result);

        for (const error of errors) {
          console.log(chalk.yellow(`  • ${error}`))
        }

        console.log(chalk.blue("\n💡 使用 --help 查看完整参数说明"));
        process.exit(1);
      }

      const options: ParseCommandOptions = result.data;

      try {
        await runParse(options);
      } catch (error) {
        console.error(chalk.red("❌ 执行失败:"))
        if (error instanceof Error) {
          console.error(chalk.red(`  ${error.message}`));
          if (options.debug && error.cause) {
            console.error(chalk.gray(`  ${error.cause}`));
          }
        } else {
          console.error(chalk.red(`  未知错误: ${error}`))
        }

        process.exit(1);
      }
    });
}
