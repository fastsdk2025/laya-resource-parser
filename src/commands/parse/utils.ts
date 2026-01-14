import { ZodSafeParseResult } from "zod";

export function formatZodErrors<T>(result: ZodSafeParseResult<T>): string[] {
  if (result.success) return [];

  const errors: string[] = [];
  const errorData = JSON.parse(result.error.message);

  for (const error of errorData) {
    const path = error.path.join(".");
    let message: string;
    switch (error.code) {
      case 'required':
        message = `Missing required parameters: ${path}`;
        break;
      case 'invalid_type':
        message = `The parameter type error: ${path} should be ${error.expected}, but is actually ${error.received}.`;
        break;
      case 'invalid_enum_value':
        message = `Invalid parameter value: ${path} should be ${error.expected.join(', ')}, but is actually ${error.received}.`;
        break;
      case 'too_small':
        message = `The parameter value is too small: the minimum value of ${path} is ${error.minimum}, but the actual value is ${error.received}.`;
        break;
      case 'too_big':
        message = `The parameter value is too large: ${path} has a maximum value of ${error.maximum}, but the actual value is ${error.received}.`;
        break;
      default:
        message = `Parameter error: ${path} - ${error.message}`;
    }

    errors.push(message);
  }

  return errors;
}
