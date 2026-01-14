import { resolve } from "node:path";
import z from "zod";

/**
 * HTTP/HTTPS URL验证 schema
 */
const httpUrlSchema = z.string()
  .trim()
  .min(1, { message: "URL is required" })
  .refine((value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, {
    message: "Invalid URL",
  })
  .describe("Remote resource URL")

/**
 * 转换为数字的schema
 */
const convertToNumberSchema = z
  .union([z.string(), z.number()])
  .transform((value: string | number): number => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error("Invalid number");
    }
    return num;
  })

/**
 * 确保是文件系统的schema
 */
const resolveSchema = z.string()
  .transform((value: string) => resolve(value))
  .describe("File system path")

export const ParseOptionsSchema = z.object({
  base: resolveSchema.describe("The base path is the root directory used to resolve resource dependencies."),
  remote: httpUrlSchema.describe("远程资源URL，必须为有效的 HTTP/HTTPS URL"),
  concurrency: convertToNumberSchema
    .pipe(
      z.number()
        .int({ message: "The number of concurrent users must be an integer." })
        .min(1, { message: "The concurrency must be at least 1." })
        .max(64, { message: "The number of concurrent users cannot exceed 64." })
  )
    .default(5)
    .describe("Concurrency limit controls the number of tasks processed simultaneously."),
  timeout: convertToNumberSchema
    .pipe(
      z.number()
        .int({ message: "The timeout period must be an integer." })
        .min(1 * 1000, { message: "The timeout period must be at least 1000 milliseconds." })
        .max(300 * 1000, { message: "The timeout period cannot exceed 5 minutes." })
    )
    .default(3 * 1000)
    .describe("Timeout event (milliseconds), controls the timeout event for a single operation."),
  retry: convertToNumberSchema
    .pipe(
      z.number()
        .int({ message: "The number of retries must be an integer." })
        .min(0, { message: "The number of retries cannot be less than 0." })
        .max(10, { message: "The number of retries cannot exceed 10." })
    )
    .default(3)
    .describe("Number of retries, the number of retries when the operation fails."),
})
.strict()
.describe("Configuration options for parsing commands")

export type ParseCommandOptions = z.infer<typeof ParseOptionsSchema>
