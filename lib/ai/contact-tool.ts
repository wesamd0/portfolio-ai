import { tool } from "ai";
import { z } from "zod";
import { buildContactWidgetData } from "@/lib/ai/contact-widget";
import type { Locale } from "@/lib/projects";

export const showContactWidgetInputSchema = z.object({
  reason: z.string().optional(),
});

export function createShowContactWidgetTool(locale: Locale) {
  return tool({
    description:
      "Render an Availability & Contact interactive widget whenever users ask contact questions or when the assistant shares contact email due to missing information.",
    inputSchema: showContactWidgetInputSchema,
    execute: async () => {
      return buildContactWidgetData(locale);
    },
  });
}
