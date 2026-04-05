import { tool } from "ai";
import { z } from "zod";
import { buildDeployedLinksCardData, type DeployedLinksCardData } from "@/lib/ai/project-resolution";
import type { Locale } from "@/lib/projects";

function normalizeIncludeComingSoon(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "y"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "n"].includes(normalized)) {
      return false;
    }
  }

  return true;
}

export const showDeployedLinksInputSchema = z.object({
  includeComingSoon: z.union([z.boolean(), z.string()]).optional(),
});

export function createShowDeployedLinksTool(locale: Locale) {
  return tool({
    description:
      "Render a deployment-links card for portfolio projects. Use when users ask for live/deployed links of projects.",
    inputSchema: showDeployedLinksInputSchema,
    execute: async (input): Promise<DeployedLinksCardData> => {
      const includeComingSoon = normalizeIncludeComingSoon(input.includeComingSoon);
      const payload = buildDeployedLinksCardData(locale);

      if (includeComingSoon) {
        return payload;
      }

      return {
        ...payload,
        links: payload.links.filter((item) => item.status === "live"),
      };
    },
  });
}
