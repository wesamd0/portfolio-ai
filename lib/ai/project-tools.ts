import { tool } from "ai";
import { z } from "zod";
import type { Locale } from "@/lib/projects";
import { projectToCardData, resolveProjectByQuestion } from "@/lib/ai/project-resolution";

export const showProjectDetailsInputSchema = z.object({
  projectName: z.string().min(2).max(120),
  techStack: z.array(z.string().min(1).max(40)).min(1).max(12).optional(),
  role: z.string().min(2).max(220).optional(),
  architectureDescription: z.string().min(10).max(800).optional(),
});

export type ShowProjectDetailsInput = z.infer<typeof showProjectDetailsInputSchema>;

export function createShowProjectDetailsTool(locale: Locale) {
  return tool({
    description:
      "Render a structured project card when the user asks for details about a specific project. Always provide projectName. Especially useful for requests mentioning 'code optimizer' or 'distributed architecture software evolution project'.",
    inputSchema: showProjectDetailsInputSchema,
    execute: async (input) => {
      const matchedProject = resolveProjectByQuestion(locale, input.projectName);

      if (matchedProject) {
        return projectToCardData(matchedProject);
      }

      const cleanedStack = [
        ...(input.techStack ?? []).map((value) => value.trim()).filter(Boolean),
      ];

      return {
        projectName: input.projectName.trim(),
        techStack: [...new Set(cleanedStack)].slice(0, 12),
        role: input.role?.trim() || "Software Engineering Project",
        architectureDescription:
          input.architectureDescription?.trim() ||
          "Project details are available, but specific architecture notes were not provided in this response.",
      };
    },
  });
}
