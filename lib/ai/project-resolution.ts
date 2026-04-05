import { getProjects, type Locale, type Project, type ProjectSlug } from "@/lib/projects";

export type ProjectCardData = {
  projectName: string;
  techStack: string[];
  role: string;
  architectureDescription: string;
};

export const projectAliasesBySlug: Record<ProjectSlug, string[]> = {
  "distributed-mobile-cross-play-ecosystem": [
    "distributed architecture software evolution",
    "software evolution",
    "distributed architecture",
    "distributed cross play",
    "cross play ecosystem",
    "integrative project 3",
    "projet integrateur 3",
    "log3900",
    "mobile cross play",
    "distributed mobile",
  ],
  "multiplayer-tactical-rpg": [
    "multiplayer tactical rpg",
    "tactical rpg",
    "multiplayer game",
    "integrative project 2",
    "projet integrateur 2",
    "log2990",
    "rpg tactique",
    "websocket game",
  ],
  "autonomous-navigation-robot": [
    "autonomous navigation robot",
    "navigation robot",
    "autonomous robot",
    "robot project",
    "embedded robot",
    "integrative project 1",
    "projet integrateur 1",
    "inf1900",
    "avr robot",
  ],
  "portfolio-ai": [
    "portfolio ai",
    "ai portfolio",
    "code optimizer",
    "optimizer",
    "personal site ai",
    "genui portfolio",
    "nextjs portfolio",
  ],
  "portfolio-classic": [
    "classic portfolio",
    "angular portfolio",
    "portfolio v1",
    "old portfolio",
    "legacy portfolio",
    "classic angular portfolio",
  ],
};

export function normalizeProjectText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const normalizedAliasEntries = Object.entries(projectAliasesBySlug).flatMap(
  ([slug, aliases]) =>
    aliases.map((alias) => [normalizeProjectText(alias), slug as ProjectSlug] as const),
);

export function projectToCardData(project: Project): ProjectCardData {
  return {
    projectName: project.title,
    techStack: project.stack,
    role: project.category,
    architectureDescription: `${project.challenge} ${project.approach} ${project.outcome}`,
  };
}

export function resolveProjectByQuestion(locale: Locale, question: string) {
  const projects = getProjects(locale);
  const normalizedQuestion = normalizeProjectText(question);

  for (const [alias, slug] of normalizedAliasEntries) {
    if (normalizedQuestion.includes(alias)) {
      const aliasProject = projects.find((project) => project.slug === slug);
      if (aliasProject) {
        return aliasProject;
      }
    }
  }

  const directMatch = projects.find((project) => {
    const title = normalizeProjectText(project.title);
    const slug = normalizeProjectText(project.slug.replace(/-/g, " "));
    return normalizedQuestion.includes(title) || normalizedQuestion.includes(slug);
  });

  if (directMatch) {
    return directMatch;
  }

  const qTokens = new Set(normalizedQuestion.split(" ").filter(Boolean));
  const best = projects
    .map((project) => {
      const projectTokens = new Set(
        normalizeProjectText(
          [
            project.title,
            project.slug.replace(/-/g, " "),
            project.summary,
            project.category,
            project.stack.join(" "),
          ].join(" "),
        )
          .split(" ")
          .filter(Boolean),
      );

      let score = 0;
      for (const token of qTokens) {
        if (projectTokens.has(token)) {
          score += 1;
        }
      }

      return { project, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  return best && best.score >= 2 ? best.project : undefined;
}

export function resolveProjectCardByQuestion(locale: Locale, question: string): ProjectCardData | null {
  const project = resolveProjectByQuestion(locale, question);
  return project ? projectToCardData(project) : null;
}
