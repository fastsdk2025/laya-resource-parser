import { resolve } from "node:path";
import z from "zod";

const httpUrlSchema = z.string().trim().refine((value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false;
  }
}, "URL必须是有效的 HTTP/HTTPS URL");

const convertToNumberSchema = z
  .union([z.string(), z.number()])
  .transform((value: string | number): number => Number(value))

const resolveSchema = z.string().transform((value: string) => resolve(value))

export const ParseOptionsSchema = z.object({
  base: resolveSchema,
  remote: httpUrlSchema,
  concurrency: convertToNumberSchema
    .pipe(
      z.number().int().min(1).max(64)
    ),
  debug: z.boolean(),
  timeout: convertToNumberSchema
    .pipe(
      z.number().int().min(1000)
    ),
  retry: convertToNumberSchema
    .pipe(
      z.number().int().min(0).max(10)
    ),
  preload: z.array(z.string()).default([]),
  preloadPlf: z.array(z.string()).default([]),
  preloadPlfb: z.array(z.string()).default([]),

  fileconfig: resolveSchema,
  pkgMap: resolveSchema,
  bundle: resolveSchema
})

export type ParseCommandOptions = z.infer<typeof ParseOptionsSchema>;
