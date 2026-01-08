import { resolve } from "node:path";
import z from "zod";

/**
 * HTTP/HTTPS URL验证schema
 */
const httpUrlSchema = z.string()
  .trim()
  .min(1, { message: "URL 不能为空" })
  .refine((value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false;
    }
  }, {
    message: "URL必须是有效的 HTTP/HTTPS URL",
    params: {
      example: "https://example.com/resources"
    }
  })
  .describe("远程资源URL，必须为有效的 HTTP/HTTPS URL");

/**
 * 转换为数字的schema
 */
const convertToNumberSchema = z
  .union([z.string(), z.number()])
  .transform((value: string | number): number => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error("必须是一个有效的数字")
    }
    return num;
  })

/**
 * 确保是文件系统路径schema
 */
const resolveSchema = z.string()
  .transform((value: string) => resolve(value))
  .describe("文件系统路径")

export const ParseOptionsSchema = z.object({
  base: resolveSchema.describe("基础路径，用于解析资源依赖关系的根目录"),
  remote: httpUrlSchema.describe("远程资源URL，必须为有效的 HTTP/HTTPS URL"),
  concurrency: convertToNumberSchema
    .pipe(
      z.number()
        .int({ message: "并发数必须是整数" })
        .min(1, { message: "并发数必须至少为1" })
        .max(64, { message: "并发数不能超过64" })
    )
    .default(5)
    .describe("并发处理数，控制同时处理的任务数量"),
  debug: z.boolean()
    .default(false)
    .describe("调试模式开关，启用后会输出更新详细信息"),
  timeout: convertToNumberSchema
    .pipe(
      z.number()
        .int({ message: "超时时间必须是整数" })
        .min(1 * 1000, { message: "超时时间必须至少为1000毫秒" })
        .max(300 * 1000, { message: "超时时间不能超过5分钟" })
    )
    .default(3 * 1000)
    .describe("超时事件(毫秒), 控制单个操作的超时事件"),
  retry: convertToNumberSchema
    .pipe(
      z.number()
        .int({ message: "重试次数必须是整数" })
        .min(0, { message: "重试次数不能小于0" })
        .max(10, { message: "重试次数不能超过10" })
    )
    .default(3)
    .describe("重试次数，操作失败时的重试次数"),
  preload: z.array(z.string())
    .default([])
    .describe("预加载资源映射, 自动识别plf/plfb格式"),
  preloadPlf: z.array(z.string())
    .default([])
    .describe("显式指定plf格式的预加载资源"),
  preloadPlfb: z.array(z.string())
    .default([])
    .describe("显式指定plfb格式的预加载资源"),
  fileconfig: resolveSchema.describe("图集配置文件路径"),
  pkgMap: resolveSchema.describe("分包配置文件路径"),
  bundle: resolveSchema.describe("压缩分包配置文件路径")
})
.strict()
.describe("解析命令的配置选项")

export type ParseCommandOptions = z.infer<typeof ParseOptionsSchema>;
