import { Chalk } from "chalk";
import { access, readFile } from "node:fs/promises";
import type { ZodSafeParseResult } from "zod";
const chalk = new Chalk();

/**
 * 验证URL是否为有效的 HTTP/HTTPS URL
 * @param value
 * @returns
 */
export function validateHttpUrl(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw new Error("URL不能为空");
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`URL协议必须是http或https,当前为：${url.protocol}`);
    }

    return trimmedValue;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`无效的URL格式: ${error.message}`, { cause: error })
    }

    throw new Error("URL必须是有效的HTTP/HTTPS URL")
  }
}

/**
 * 格式化Zod解析错误
 * @param result
 * @returns
 */
export function formatZodErrors<T>(result: ZodSafeParseResult<T>): string[] {
  if (result.success) return [];

  const errors: string[] = [];
  const errorData = JSON.parse(result.error.message);

  for (const error of errorData) {
    const path = error.path.join(".");
    let message: string;

    switch (error.code) {
      case 'required':
        message = `缺少必填参数: ${path}`;
        break;
      case 'invalid_type':
        message = `参数类型错误: ${path} 应为 ${error.expected}, 实际为 ${error.received}`;
        break;
      case 'invalid_enum_value':
        message = `参数值无效: ${path} 应为 ${error.expected.join(', ')}, 实际为 ${error.received}`;
        break;
      case 'too_small':
        message = `参数值太小: ${path} 最小值为 ${error.minimum}, 实际为 ${error.received}`;
        break;
      case 'too_big':
        message = `参数值太大: ${path} 最大值为 ${error.maximum}, 实际为 ${error.received}`;
        break;
      default:
        message = `参数错误: ${path} - ${error.message}`;
    }
    errors.push(message);
  }

  return errors;
}

export async function checkFileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true;
  } catch {
    return false;
  }
}

export async function readJSON<T>(filePath: string) {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as T
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`读取 ${filePath} 失败: ${error.message}`, { cause: error })
    }
    throw new Error(`读取 ${filePath} 失败`)
  }
}

export function showProgress(current: number, total: number, message: string) {
  const percentage = Math.round((current / total) * 100);
  process.stdout.write(`\r${chalk.blue('🔄')} ${message}: ${current}/${total} (${percentage}%)`)
  if (current === total) {
    process.stdout.write(`\n${chalk.green('✅')} 完成!\n`)
  }
}
