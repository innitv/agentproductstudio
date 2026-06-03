import { readFileSync } from "node:fs";
import { join } from "node:path";

type JsonSchema = {
  type?: string;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  additionalProperties?: boolean;
  enum?: unknown[];
  minLength?: number;
  items?: JsonSchema;
};

let cachedAgentOutputSchema: JsonSchema | undefined;

export function validateAgenticOutputEnvelope(value: unknown): string[] {
  const schemaErrors = validateJsonSchema(value, loadAgentOutputSchema());
  if (schemaErrors.length) {
    return schemaErrors;
  }

  return validateAgentOutputBusinessRules(value);
}

function loadAgentOutputSchema(): JsonSchema {
  if (cachedAgentOutputSchema) {
    return cachedAgentOutputSchema;
  }

  const schemaPath = join(process.cwd(), "agent-pack", "schemas", "agent-output.schema.json");
  cachedAgentOutputSchema = JSON.parse(readFileSync(schemaPath, "utf8")) as JsonSchema;
  return cachedAgentOutputSchema;
}

function validateJsonSchema(value: unknown, schema: JsonSchema, path = "root"): string[] {
  const errors: string[] = [];

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${path} must be ${schema.type}`);
    return errors;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path} must be one of ${schema.enum.map(String).join(", ")}`);
  }

  if (schema.type === "string" && typeof value === "string" && typeof schema.minLength === "number" && value.length < schema.minLength) {
    errors.push(`${path} must have length >= ${schema.minLength}`);
  }

  if (schema.type === "array" && Array.isArray(value) && schema.items) {
    value.forEach((item, index) => {
      errors.push(...validateJsonSchema(item, schema.items as JsonSchema, `${path}[${index}]`));
    });
  }

  if (schema.type === "object" && isRecord(value)) {
    const properties = schema.properties ?? {};

    for (const requiredField of schema.required ?? []) {
      if (!(requiredField in value)) {
        errors.push(`${path}.${requiredField} is required`);
      }
    }

    if (schema.additionalProperties === false) {
      for (const field of Object.keys(value)) {
        if (!(field in properties)) {
          errors.push(`${path}.${field} is not allowed`);
        }
      }
    }

    for (const [field, fieldSchema] of Object.entries(properties)) {
      if (field in value) {
        errors.push(...validateJsonSchema(value[field], fieldSchema, `${path}.${field}`));
      }
    }
  }

  return errors;
}

function validateAgentOutputBusinessRules(value: unknown): string[] {
  if (!isAgentOutputRecord(value)) {
    return ["root must match agent output schema"];
  }

  const errors: string[] = [];

  if (value.status === "partial" && !value.risks.length && !value.open_questions.length) {
    errors.push("partial status requires risks or open_questions");
  }

  if (value.status === "blocked" && (!value.risks.length || !value.recommended_next_step.trim())) {
    errors.push("blocked status requires risks and recommended_next_step");
  }

  return errors;
}

function matchesType(value: unknown, type: string): boolean {
  if (type === "array") {
    return Array.isArray(value);
  }

  if (type === "object") {
    return isRecord(value);
  }

  return typeof value === type;
}

function isAgentOutputRecord(value: unknown): value is {
  status: "success" | "partial" | "blocked";
  risks: string[];
  open_questions: string[];
  recommended_next_step: string;
} {
  return isRecord(value)
    && (value.status === "success" || value.status === "partial" || value.status === "blocked")
    && Array.isArray(value.risks)
    && Array.isArray(value.open_questions)
    && typeof value.recommended_next_step === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
