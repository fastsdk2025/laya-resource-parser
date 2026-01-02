import type { Command } from "commander";
import { join } from "node:path";

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
      "-r, --remote",
      "远程资源URL(必须为有效的HTTP/HTTPS URL)",
      (value: string) => {
        if (!value.trim()) {
          throw new Error("远程URL不能为空")
        }

        try {
          const url = new URL(value);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error("远程URL必须是有效的HTTP或HTTPS URL")
          }

          return value;
        } catch (error) {
          throw new Error("远程URL必须是有效的HTTP或HTTPS URL", {
            cause: error
          })
        }
      }
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
    .action(async () => {
      // TODO: 实现解析资源依赖关系的逻辑
    });
}
