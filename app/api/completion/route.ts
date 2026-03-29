import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { Ratelimit } from "@upstash/ratelimit/dist/index.js";
import { Redis } from "@upstash/redis";
import { getProjects, type Locale } from "@/lib/projects";
import resumeContextData from "@/lib/resume-context.json";

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
- If a question is overly personal and not covered by the profile, politely keep the conversation professional.
- Prefer short answers, usually 2-5 sentences, unless the user clearly asks for more detail.
- When useful, cite concrete experience from the profile instead of speaking generically.
- If the question is ambiguous, ask one concise clarification question.
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
    .replace(/[^a-z0-9\s]/g, " ");
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
    "est",
    "qui",
    "que",
    "quoi",
    "comment",
    "tes",
    "ton",
  ]);

  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function classifyIntent(question: string): Intent {
  const q = normalizeText(question);

  if (/(project|projects|projet|projets|stack|architecture|system|systeme|robot|rpg|portfolio)/.test(q)) {
    return "projects";
  }

  if (/(skill|skills|competence|competences|technology|technologies|langage|language|framework|outil|outils)/.test(q)) {
    return "skills";
  }

  if (/(education|study|studies|etud|universite|polytechnique|degree|diplome|bac|dec)/.test(q)) {
    return "education";
  }

  if (/(experience|work|emploi|job|travail|cuisinier|cook|packer|impact)/.test(q)) {
    return "experience";
  }

  if (/(contact|email|mail|linkedin|github|telephone|phone)/.test(q)) {
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
  return /(certification|certifications|certifie|certifiee|certified)/.test(q);
}

function isPhoneNumberQuestion(question: string) {
  const q = normalizeText(question);
  return /(phone|telephone|tel|phone number|telephone number|numero de telephone|num de telephone|numero|appeler|call)/.test(
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

function selectRelevantProjectContext(locale: Locale, question: string, topK = 3) {
  const projects = getProjects(locale);
  const qTokens = new Set(tokenize(question));

  const scored = projects
    .map((project) => {
      const corpus = [
        project.title,
        project.category,
        project.summary,
        project.overview,
        project.challenge,
        project.approach,
        project.outcome,
        project.stack.join(" "),
      ].join(" \n ");

      const pTokens = new Set(tokenize(corpus));
      let score = 0;

      for (const token of qTokens) {
        if (pTokens.has(token)) {
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

  return scored
    .map(({ project }) => {
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
    })
    .join("\n\n");
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

function buildSystemPrompt(locale: "fr" | "en", question: string) {
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

  const { prompt, locale } = await req.json();
  const question = typeof prompt === "string" ? prompt.trim() : "";
  const uiLocale: Locale = locale === "fr" ? "fr" : "en";
  const preferredLocale = detectQuestionLocale(question, uiLocale);
  const phoneNumberQuestion = isPhoneNumberQuestion(question);
  const deployedLinksQuestion = isDeployedLinksQuestion(question);
  const lowComplexity = isLowComplexityQuestion(question);
  const allowClarification = needsClarifyingQuestion(question);
  const systemPrompt = buildSystemPrompt(preferredLocale, question);

  if (!question) {
    return new Response("Prompt is required", { status: 400 });
  }

  // Deterministic branch for phone-number questions.
  if (phoneNumberQuestion) {
    return new Response(buildPhoneRedirectResponse(preferredLocale), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  // Deterministic branch for deployed links questions.
  if (deployedLinksQuestion) {
    return new Response(buildDeployedLinksResponse(preferredLocale), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const result = streamText({
    model,
    system: systemPrompt,
    temperature: lowComplexity ? 0.2 : 0.4,
    maxOutputTokens: lowComplexity ? 120 : 350,
    prompt:
      preferredLocale === "fr"
      ? `Answer in French unless the user explicitly asks otherwise.
    Keep the answer grounded in the provided profile/context.
    ${allowClarification ? "If information is missing, say it clearly and ask one short follow-up question." : "If information is missing, say it clearly and stop."}
    ${lowComplexity ? "For simple fact questions, answer in 1-2 short sentences and do not add extra suggestions." : "Stay concise and relevant."}

    Question: ${question}`
      : `Answer in English unless the user explicitly asks otherwise.
    Keep the answer grounded in the provided profile/context.
    ${allowClarification ? "If information is missing, say it clearly and ask one short follow-up question." : "If information is missing, say it clearly and stop."}
    ${lowComplexity ? "For simple fact questions, answer in 1-2 short sentences and do not add extra suggestions." : "Stay concise and relevant."}

    Question: ${question}`,
  });

  return result.toTextStreamResponse();
}
