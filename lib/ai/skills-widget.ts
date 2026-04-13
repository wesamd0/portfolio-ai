import type { Locale } from "@/lib/projects";

export type SkillCategory = {
  label: string;
  items: string[];
};

export type SkillsWidgetData = {
  title: string;
  subtitle: string;
  categories: SkillCategory[];
};

function normalizeQuestion(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSkillsRelatedQuestion(question: string) {
  const q = normalizeQuestion(question);
  return /\b(skill|skills|competence|competences|stack|tech stack|technology|technologies|framework|frameworks|language|languages|outil|outils|techno|technos)\b/.test(q);
}

export function isGlobalSkillsOverviewQuestion(question: string) {
  const q = normalizeQuestion(question);

  if (!isSkillsRelatedQuestion(q)) {
    return false;
  }

  // Only trigger widget for broad overview/list intents.
  return /(what are your|what skills do you|what skills did you|which skills do you|which skills did you|list your|summarize your|overview of your|your technical skills|your tech stack|technologies do you use|what technologies did you use|which technologies|show me your skills|skills you used|skills did you use|quelles sont tes|quelles competences|quelles technologies|quelles technologies as tu utilise|quelles competences as tu utilise|liste tes|resume tes|apercu de tes|competences techniques|ton stack technique|montre tes competences|quels sont tes outils|competences que tu utilises|technologies que tu utilises)/.test(
    q,
  );
}

const PROGRAMMING_LANGUAGES = [
  "C",
  "C++",
  "C#",
  "Python",
  "Java",
  "Dart",
  "TypeScript",
  "JavaScript",
  "HTML",
  "SCSS",
  "SQL",
];

const WEB_MOBILE_TECH = [
  "Angular",
  "Flutter",
  "Qt",
  "Node.js",
  "Tailwind CSS",
  "React",
  "Next.js",
  "Framer Motion",
];

const ARCHITECTURE_NETWORK_DATA = [
  "Distributed systems design",
  "Real-time systems design",
  "Socket.io",
  "WebSockets",
  "Cybersecurity",
  "GROQ API integration",
  "MongoDB",
  "MySQL",
  "REST APIs",
  "API design",
];

const DEVOPS_TOOLS_ENVIRONMENTS = [
  "Linux",
  "AWS Amplify",
  "AWS EC2",
  "Vercel",
  "Git",
  "GitHub",
  "GitLab",
  "Docker",
  "CI/CD",
  "Scrum",
  "Kanban",
  "Windows",
  "iOS",
  "Android",
  "Microsoft Office",
  "UML",
  "Lucidchart",
  "Draw.io",
];

export function buildSkillsWidgetData(locale: Locale): SkillsWidgetData {
  if (locale === "fr") {
    return {
      title: "Competences techniques",
      subtitle:
        "Apercu de mes competences techniques principales en programmation, web/mobile, architecture et outillage professionnel.",
      categories: [
        {
          label: "Langages de programmation",
          items: PROGRAMMING_LANGUAGES,
        },
        {
          label: "Technologies Web & mobiles",
          items: WEB_MOBILE_TECH,
        },
        {
          label: "Architecture, Reseaux & Donnees",
          items: ARCHITECTURE_NETWORK_DATA,
        },
        {
          label: "DevOps, outils & environnements",
          items: DEVOPS_TOOLS_ENVIRONMENTS,
        },
      ],
    };
  }

  return {
    title: "Technical Skills",
    subtitle:
      "Overview of my core technical skills across programming, web/mobile development, architecture, and professional tooling.",
    categories: [
      {
        label: "Languages",
        items: PROGRAMMING_LANGUAGES,
      },
      {
        label: "Web & Mobile Technologies",
        items: WEB_MOBILE_TECH,
      },
      {
        label: "Architecture, Networks & Data",
        items: ARCHITECTURE_NETWORK_DATA,
      },
      {
        label: "DevOps, Tools & Environments",
        items: DEVOPS_TOOLS_ENVIRONMENTS,
      },
    ],
  };
}
