import { groq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { Ratelimit } from "@upstash/ratelimit/dist/index.js";
import { Redis } from "@upstash/redis";
import { isContactRelatedQuestion } from "@/lib/ai/contact-widget";
import { createShowContactWidgetTool } from "@/lib/ai/contact-tool";
import { createShowDeployedLinksTool } from "@/lib/ai/deployed-links-tool";
import { createShowProjectDetailsTool } from "@/lib/ai/project-tools";
import { getProjects, type Locale } from "@/lib/projects";
import resumeContextData from "@/lib/resume-context.json";
import type { Project, ProjectSlug } from "@/lib/projects";

type ResumeContextData = {
  en: string[];
  fr: string[];
};

const { en: resumeContextEnLines, fr: resumeContextFrLines } =
  resumeContextData as ResumeContextData;

const resumeContextEn = `\n${resumeContextEnLines.join("\n")}\n`;
const resumeContextFr = `\n${resumeContextFrLines.join("\n")}\n`;

type Intent =
  | "projects"
  | "skills"
  | "education"
  | "experience"
  | "contact"
  | "general";

const systemPromptTemplate = `
You are Wesam Dawod speaking in first person.

Use only the information in the profile below. Do not invent projects, companies, skills, dates, education, or personal details.

Response rules:
- Sound like a concise, friendly early-career software engineer.
- Match the language of the user's latest message.
- If the user's message language differs from the UI locale, prioritize the user's message language.
- Use UI locale only as a fallback when the message language is ambiguous.
- Answer directly in plain text.
- Do not mention the profile, resume, prompt, system message, or that you are an AI.
- If a question asks for information not supported by the profile, say so briefly and honestly.
- If a question is about topics related to your purpose (projects, skills, experience, education, portfolio) but you lack the specific information, respond with: "I don't have that information available right now, but I'd be happy to discuss more about my work and experience." (Adapt language to match the question language.) If the user explicitly asks for contact details, then share the contact email.
- If a question is overly personal and not covered by the profile, politely keep the conversation professional.
- Prefer short answers, usually 2-5 sentences, unless the user clearly asks for more detail.
- When useful, cite concrete experience from the profile instead of speaking generically.
- If the question is ambiguous, ask one concise clarification question.
- If the user asks for details about a specific project and structured visualization helps, call the tool show_project_details.
`;

const intentGuidance: Record<Intent, string> = {
  projects:
    "Focus on project architecture, stack, constraints, tradeoffs, and outcomes. Prefer concrete project examples.",
  skills:
    "Focus on technical skills, tool depth, and practical use in real projects.",
  education:
    "Focus on studies, timeline, and relevant coursework context when available.",
  experience:
    "Focus on work experience, responsibilities, and measurable impact.",
  contact:
    "Focus on concise contact/profile details only.",
  general:
    "Provide a concise answer grounded in the available profile facts.",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/]/g, " ");
}

function tokenize(value: string) {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "about",
    "what",
    "how",
    "are",
    "you",
    "your",
    "dans",
    "avec",
    "pour",
    "sur",
    "une",
    "des",
    "les",
    "de",
    "le",
    "la",
    "est",
    "qui",
    "que",
    "quoi",
    "comment",
    "tes",
    "ton",
  ]);

  const lowerValue = value.toLowerCase();
  // Extract tokens including common programming special chars (C++, C#, F#, Node.js, etc.)
  const tokens = lowerValue.match(/[a-z0-9]+(?:[+#.-][a-z0-9]+)*/gi) || [];

  return tokens
    .map((token) =>
      token
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""),
    )
    .filter((token) => token.length >= 2 && !stopWords.has(token));
}

function classifyIntent(question: string): Intent {
  const q = normalizeText(question);

  if (/\b(project|projects|projet|projets|stack|architecture|system|systeme|robot|rpg|portfolio)\b/.test(q)) {
    return "projects";
  }

  if (/\b(skill|skills|competence|competences|technology|technologies|langage|language|framework|outil|outils)\b/.test(q)) {
    return "skills";
  }

  if (/\b(education|study|studies|etud|universite|polytechnique|degree|diplome|bac|dec)\b/.test(q)) {
    return "education";
  }

  if (/\b(experience|work|emploi|job|travail|cuisinier|cook|packer|impact)\b/.test(q)) {
    return "experience";
  }

  if (/\b(contact|email|mail|linkedin|github|telephone|phone)\b/.test(q)) {
    return "contact";
  }

  return "general";
}

function isPortfolioQuestion(question: string) {
  const q = normalizeText(question);
  const asksPortfolioLocation =
    /(where.*portfolio|ou.*portfolio|your portfolio|ton portfolio|lien portfolio|portfolio link|classic portfolio|portfolio classique|personal site)/.test(
      q,
    );

  const asksProjectLinks =
    /(deployed|deploye|deploi|live|links of all|all .* projects|project links|liens.*projets|projets.*deployes|tous.*projets)/.test(
      q,
    );

  return asksPortfolioLocation && !asksProjectLinks;
}

function isDeployedLinksQuestion(question: string) {
  const q = normalizeText(question);
  return /(deployed|deploye|deploi|live|project links|links of all|all .* projects|liens.*projets|projets.*deployes|tous.*projets)/.test(
    q,
  );
}

function isCertificationQuestion(question: string) {
  const q = normalizeText(question);
  return /\b(certification|certifications|certifie|certifiee|certified)\b/.test(q);
}

function isPhoneNumberQuestion(question: string) {
  const q = normalizeText(question);
  return /\b(phone|telephone|tel|phone number|telephone number|numero de telephone|num de telephone|numero|appeler|call)\b/.test(
    q,
  );
}

function detectQuestionLocale(question: string, fallbackLocale: Locale): Locale {
  const q = normalizeText(question);

  const frMatches = [
    /\b(je|j|tu|vous|nous|mon|ma|mes|ton|ta|tes)\b/g,
    /\b(quel|quelle|quels|quelles|comment|pourquoi|ou|quand)\b/g,
    /\b(projet|projets|etudes|universite|experience|competence|langue|courriel|adresse)\b/g,
    /\b(francais|bonjour|merci|avec|dans|pour)\b/g,
  ]
    .map((pattern) => q.match(pattern)?.length ?? 0)
    .reduce((sum, value) => sum + value, 0);

  const enMatches = [
    /\b(i|you|my|your|we|our)\b/g,
    /\b(what|which|how|why|where|when)\b/g,
    /\b(project|projects|study|university|experience|skills|language|email|address)\b/g,
    /\b(english|hello|thanks|with|for|in)\b/g,
  ]
    .map((pattern) => q.match(pattern)?.length ?? 0)
    .reduce((sum, value) => sum + value, 0);

  if (frMatches > enMatches) {
    return "fr";
  }

  if (enMatches > frMatches) {
    return "en";
  }

  return fallbackLocale;
}

function isLowComplexityQuestion(question: string) {
  const q = normalizeText(question);
  const tokenCount = tokenize(question).length;

  const simpleFactPattern =
    /(where|location|based|email|mail|github|linkedin|certification|certifications|study|studying|university|language|languages|ou|adresse|email|courriel|certification|certifications|etudes|etudiant|universite|langue|langues|base)/;

  return tokenCount <= 12 || simpleFactPattern.test(q);
}

function needsClarifyingQuestion(question: string) {
  const q = normalizeText(question);
  const ambiguousPattern =
    /(which project|quel projet|tell me about a project|parle moi d un projet|compare|comparison|comparez|comparaison|more details|plus de details)/;

  return ambiguousPattern.test(q);
}

function buildProjectContextString(project: Project) {
  const links = [
    project.githubUrl ? `GitHub: ${project.githubUrl}` : null,
    project.deployedUrl ? `Live: ${project.deployedUrl}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return [
    `project.slug: ${project.slug}`,
    `project.title: ${project.title}`,
    `project.category: ${project.category}`,
    `project.summary: ${project.summary}`,
    `project.challenge: ${project.challenge}`,
    `project.approach: ${project.approach}`,
    `project.outcome: ${project.outcome}`,
    `project.stack: ${project.stack.join(", ")}`,
    links ? `project.links: ${links}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function selectRelevantProjectContext(locale: Locale, question: string, topK = 3) {
  const projects = getProjects(locale);
  const normalizedQuestion = normalizeText(question);

  const projectMapping: Record<string, ProjectSlug> = {
    "projet integrateur 1": "autonomous-navigation-robot",
    "projet integrateur 2": "multiplayer-tactical-rpg",
    "projet integrateur 3": "distributed-mobile-cross-play-ecosystem",
    "Integrative project 1": "autonomous-navigation-robot",
    "Integrative project 2": "multiplayer-tactical-rpg",
    "Integrative project 3": "distributed-mobile-cross-play-ecosystem",
  };

  for (const [key, slug] of Object.entries(projectMapping)) {
    if (normalizedQuestion.includes(key)) {
      const project = projects.find((p) => p.slug === slug);
      if (project) {
        return buildProjectContextString(project);
      }
    }
  }
  const qTokens = new Set(tokenize(question));

  const scored = projects
    .map((project) => {
      const titleTokens = new Set(tokenize(project.title));
      const categoryTokens = new Set(tokenize(project.category));
      const stackTokens = new Set(tokenize(project.stack.join(" ")));
      const summaryTokens = new Set(tokenize(project.summary));
      const contentTokens = new Set(
        tokenize(
          [
            project.overview,
            project.challenge,
            project.approach,
            project.outcome,
          ].join(" \n "),
        ),
      );

      let score = 0;
      for (const token of qTokens) {
        if (titleTokens.has(token)) {
          score += 10;
        }
        if (categoryTokens.has(token)) {
          score += 5;
        }
        if (stackTokens.has(token)) {
          score += 5;
        }
        if (summaryTokens.has(token)) {
          score += 2;
        }
        if (contentTokens.has(token)) {
          score += 1;
        }
      }

      return {
        project,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (!scored.length) {
    return "";
  }

  return scored.map(({ project }) => buildProjectContextString(project)).join("\n\n");
}

function buildAllProjectLinksContext(locale: Locale) {
  const projects = getProjects(locale);

  return projects
    .map((project) => {
      const deployed = project.deployedUrl ?? "Coming soon";
      const github = project.githubUrl ?? "Coming soon";

      return [
        `project.title: ${project.title}`,
        `project.deployed: ${deployed}`,
        `project.github: ${github}`,
      ].join("\n");
    })
    .join("\n\n");
}

function buildDeployedLinksResponse(locale: Locale) {
  const projects = getProjects(locale);
  const missingLabel = locale === "fr" ? "Bientôt disponible" : "Coming soon";

  const header =
    locale === "fr"
      ? "Voici les liens de mes projets déployés :"
      : "Here are my deployed project links:";

  const lines = projects.map((project) => {
    const deployed = project.deployedUrl ?? missingLabel;
    return `- ${project.title}: ${deployed}`;
  });

  return `${header}\n${lines.join("\n")}`;
}

function buildPhoneRedirectResponse(locale: Locale) {
  if (locale === "fr") {
    return "Merci pour votre message. Je préfère être contacté par email: contact@wesamdawod.com.";
  }

  return "Thanks for your message. I prefer to be contacted by email: contact@wesamdawod.com.";
}

export type DeterministicRoutingResult = {
  branch: "phone" | "deployed-links" | "none";
  preferredLocale: Locale;
  responseText: string | null;
};

export function resolveDeterministicRouting(
  question: string,
  uiLocale: Locale,
): DeterministicRoutingResult {
  const preferredLocale = detectQuestionLocale(question, uiLocale);

  if (isPhoneNumberQuestion(question)) {
    return {
      branch: "phone",
      preferredLocale,
      responseText: buildPhoneRedirectResponse(preferredLocale),
    };
  }

  if (isDeployedLinksQuestion(question)) {
    return {
      branch: "deployed-links",
      preferredLocale,
      responseText: buildDeployedLinksResponse(preferredLocale),
    };
  }

  return {
    branch: "none",
    preferredLocale,
    responseText: null,
  };
}

export function buildSystemPrompt(locale: "fr" | "en", question: string) {
  const profileContext = locale === "fr" ? resumeContextFr : resumeContextEn;
  const intent = classifyIntent(question);
  const relevantProjectContext = selectRelevantProjectContext(locale, question);
  const lowComplexity = isLowComplexityQuestion(question);
  const allowClarification = needsClarifyingQuestion(question);
  const portfolioQuestion = isPortfolioQuestion(question);
  const certificationQuestion = isCertificationQuestion(question);
  const deployedLinksQuestion = isDeployedLinksQuestion(question);

  const retrievalSection = relevantProjectContext
    ? `\n\nRelevant project context:\n${relevantProjectContext}`
    : "\n\nRelevant project context:\n- No strongly matched project chunk. If needed, ask a short clarifying question instead of guessing.";

  const allLinksSection = deployedLinksQuestion
    ? `\n\nAll project links context:\n${buildAllProjectLinksContext(locale)}`
    : "";

  const specialBehaviorSection = locale === "fr"
    ? `

Special behavior:
- Si la question concerne le portfolio/site, indique clairement: "Vous êtes déjà sur mon portfolio" puis invite à explorer les projets en faisant défiler. Mentionne aussi qu'un portfolio classique est disponible dans le contexte des projets.
- Si la question concerne les certifications, ne réponds pas seulement "non". Donne une réponse courte, honnête et motivée (ex: aucune certification pour l'instant, mais progression active via projets concrets).
`
    : `

Special behavior:
- If asked about portfolio/site, clearly state: "You are already on my portfolio" and invite the user to explore projects by scrolling. Also mention that a classic portfolio is available in the project context.
- If asked about certifications, do not answer with only "no". Give a short, honest, motivated answer (for example: no certifications yet, but active progress through concrete projects).
`;

  const targetedBehavior = [
    portfolioQuestion
      ? locale === "fr"
        ? "Targeted instruction: réponse portfolio orientée navigation (portfolio actuel + portfolio classique)."
        : "Targeted instruction: portfolio-navigation answer (current portfolio + classic portfolio mention)."
      : null,
    certificationQuestion
      ? locale === "fr"
        ? "Targeted instruction: réponse certifications courte, motivée, sans négativité sèche."
        : "Targeted instruction: short, motivated certifications response, not a dry negative."
      : null,
    deployedLinksQuestion
      ? locale === "fr"
        ? "Targeted instruction: lister tous les liens de projets déployés disponibles dans le contexte (un par projet), sans rediriger vers un message générique de portfolio."
        : "Targeted instruction: list all available deployed project links from context (one per project), and do not fall back to generic portfolio-navigation wording."
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `${systemPromptTemplate}

Current intent: ${intent}
Intent guidance: ${intentGuidance[intent]}
Response mode: ${lowComplexity ? "short_fact" : "standard"}

Output constraints:
- Do not prepend unrelated fragments.
- Answer only what was asked.
- ${lowComplexity ? "Use 1-2 short sentences maximum." : "Use 2-5 sentences unless more detail is requested."}
- ${allowClarification ? "If essential detail is missing, ask one concise clarifying question." : "Do not ask a follow-up question unless the request is truly ambiguous."}
- For contact/credential fact questions, return the fact directly with no extra commentary.
${specialBehaviorSection}
${targetedBehavior ? `\n${targetedBehavior}` : ""}

Profile:
${profileContext}${retrievalSection}${allLinksSection}`;
}

const ratelimit =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(10, "5 m"),
        analytics: true,
      })
    : false;

const model = groq("meta-llama/llama-4-scout-17b-16e-instruct");

function extractQuestionFromMessages(messages: UIMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role !== "user") {
      continue;
    }

    const textParts = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join(" ")
      .trim();

    if (textParts) {
      return textParts;
    }
  }

  return "";
}

export function GET() {
  return new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response("Missing GROQ_API_KEY", { status: 500 });
  }

  if (ratelimit) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "local";
    const rl = await ratelimit.limit(ip);

    if (!rl.success) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
  }

  const requestBody = await req.json();
  const locale = requestBody?.locale;
  const prompt = requestBody?.prompt;
  const requestMessages = Array.isArray(requestBody?.messages)
    ? (requestBody.messages as UIMessage[])
    : [];

  const questionFromPrompt = typeof prompt === "string" ? prompt.trim() : "";
  const questionFromMessages = extractQuestionFromMessages(requestMessages);
  const question = questionFromMessages || questionFromPrompt;
  const uiLocale: Locale = locale === "fr" ? "fr" : "en";
  const deterministicRouting = resolveDeterministicRouting(question, uiLocale);
  const preferredLocale = deterministicRouting.preferredLocale;
  const lowComplexity = isLowComplexityQuestion(question);
  const allowClarification = needsClarifyingQuestion(question);
  const systemPrompt = buildSystemPrompt(preferredLocale, question);

  if (!question) {
    return new Response("Prompt is required", { status: 400 });
  }

  // Deterministic branch for phone-number questions.
  if (deterministicRouting.branch === "phone" && deterministicRouting.responseText) {
    const deterministicResult = streamText({
      model,
      prompt: deterministicRouting.responseText,
      temperature: 0,
      maxOutputTokens: 80,
    });

    return deterministicResult.toUIMessageStreamResponse();
  }

  // Deterministic branch for deployed links questions.
  if (
    deterministicRouting.branch === "deployed-links" &&
    deterministicRouting.responseText
  ) {
    const deterministicResult = streamText({
      model,
      prompt:
        preferredLocale === "fr"
          ? `Appelle l'outil show_deployed_links pour afficher les liens de deploiement de tous les projets dans une carte UI.
Ne fournis pas de texte markdown long.`
          : `Call the show_deployed_links tool to render deployment links for all projects in a UI card.
Do not return long markdown text.`,
      temperature: 0,
      maxOutputTokens: 120,
      tools: {
        show_deployed_links: createShowDeployedLinksTool(preferredLocale),
      },
      toolChoice: {
        type: "tool",
        toolName: "show_deployed_links",
      },
      stopWhen: stepCountIs(2),
    });

    return deterministicResult.toUIMessageStreamResponse();
  }

  // Deterministic branch for explicit contact questions.
  if (isContactRelatedQuestion(question)) {
    const deterministicResult = streamText({
      model,
      prompt:
        preferredLocale === "fr"
          ? `Reponds en une phrase concise avec l'email de contact, puis appelle l'outil show_contact_widget.
Ne donne pas de long bloc markdown.`
          : `Answer in one concise sentence with the contact email, then call the show_contact_widget tool.
Do not return a long markdown block.`,
      temperature: 0,
      maxOutputTokens: 120,
      tools: {
        show_contact_widget: createShowContactWidgetTool(preferredLocale),
      },
      stopWhen: stepCountIs(3),
    });

    return deterministicResult.toUIMessageStreamResponse();
  }

  const messageInstruction =
    preferredLocale === "fr"
      ? `Answer in French unless the user explicitly asks otherwise.
Keep the answer grounded in the provided profile/context.
${allowClarification ? "If information is missing, say it clearly and ask one short follow-up question." : "If information is missing, say it clearly and stop."}
${lowComplexity ? "For simple fact questions, answer in 1-2 short sentences and do not add extra suggestions." : "Stay concise and relevant."}`
      : `Answer in English unless the user explicitly asks otherwise.
Keep the answer grounded in the provided profile/context.
${allowClarification ? "If information is missing, say it clearly and ask one short follow-up question." : "If information is missing, say it clearly and stop."}
${lowComplexity ? "For simple fact questions, answer in 1-2 short sentences and do not add extra suggestions." : "Stay concise and relevant."}`;

  const modelMessages = requestMessages.length > 0
    ? await convertToModelMessages(requestMessages)
    : null;

  const result = streamText({
    model,
    system: systemPrompt,
    temperature: lowComplexity ? 0.2 : 0.4,
    maxOutputTokens: lowComplexity ? 120 : 350,
    tools: {
      show_project_details: createShowProjectDetailsTool(preferredLocale),
      show_deployed_links: createShowDeployedLinksTool(preferredLocale),
      show_contact_widget: createShowContactWidgetTool(preferredLocale),
    },
    stopWhen: stepCountIs(4),
    ...(modelMessages
      ? {
          messages: modelMessages,
        }
      : {
          prompt: `${messageInstruction}\n\nQuestion: ${question}`,
        }),
  });

  return result.toUIMessageStreamResponse();
}
