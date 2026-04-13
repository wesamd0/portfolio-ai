import { tool } from "ai";
import { z } from "zod";
import { buildSkillsWidgetData, type SkillsWidgetData } from "@/lib/ai/skills-widget";
import type { Locale } from "@/lib/projects";

export const showSkillsWidgetInputSchema = z.object({
  focus: z.string().optional(),
});

export function createShowSkillsWidgetTool(locale: Locale) {
  return tool({
    description:
      "Render a technical skills widget when users ask about skills, technologies, frameworks, or language/tool strengths.",
    inputSchema: showSkillsWidgetInputSchema,
    execute: async (): Promise<SkillsWidgetData> => {
      return buildSkillsWidgetData(locale);
    },
  });
}
