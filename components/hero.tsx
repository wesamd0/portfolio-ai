"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ContactAvailabilityCard, type ContactAvailabilityCardProps } from "@/components/contact-availability-card";
import { DeployedLinksCard, type DeployedLinksCardProps } from "@/components/deployed-links-card";
import { ProjectCard, type ProjectCardProps } from "@/components/project-card";
import { SkillsWidgetCard, type SkillsWidgetCardProps } from "@/components/skills-widget-card";
import { buildContactWidgetData, isContactRelatedQuestion } from "@/lib/ai/contact-widget";
import { buildSkillsWidgetData, isGlobalSkillsOverviewQuestion } from "@/lib/ai/skills-widget";
import {
  buildDeployedLinksCardData,
  isDeployedLinksQuestion,
  resolveProjectCardByQuestion,
} from "@/lib/ai/project-resolution";
import { getProjects } from "@/lib/projects";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { toast } from "sonner";

const socialLinks = [
  {
    label: {
      en: "GitHub",
      fr: "GitHub",
    },
    href: "https://github.com/wesamd0",
    icon: Github,
  },
  {
    label: {
      en: "LinkedIn",
      fr: "LinkedIn",
    },
    href: "https://www.linkedin.com/in/wesam-dawod",
    icon: Linkedin,
  },
  {
    label: {
      en: "Email",
      fr: "Courriel",
    },
    href: "mailto:contact@wesamdawod.com",
    icon: Mail,
  },
];

const content = {
  en: {
    topLabel: "Software Engineering / Systems / Interfaces",
    statusBadge: "Software Engineering Student",
    schoolBadge: "Polytechnique Montreal",
    intro:
      "I build software that stays calm under pressure, from distributed multiplayer systems and embedded robotics to clean interfaces for complex products.",
    askLabel: "Ask Wesam",
    askTitle: "The AI layer is the homepage.",
    askText:
      "Ask about coursework, projects, tech stack, or the tradeoffs behind the systems below.",
    emptyState:
      "Start with what I am studying, how I build systems, or what I learned from the projects below.",
    placeholders: [
      "What are you studying at Polytechnique Montreal?",
      "What kind of projects do you like building?",
      "What technologies do you work with most?",
    ],
    introNotes: [
      {
        label: "Based in",
        value: "Laval, Quebec",
      },
      {
        label: "Studying",
        value: "Software Engineering at Polytechnique Montreal",
      },
      {
        label: "Working style",
        value: "Calm execution under pressure and strong team coordination",
      },
    ],
    profileNotes: [
      {
        title: "How I Build",
        text:
          "I like projects with moving parts: live state, clear architecture, and interfaces that still feel simple when the system behind them is not.",
      },
      {
        title: "What Grounds Me",
        text:
          "Working in a high-pressure kitchen taught me to prioritize fast, communicate clearly, and keep quality steady when the pace picks up.",
      },
      {
        title: "Languages",
        text:
          "Fluent in French, comfortable in English, and native in Arabic. That range helps me move cleanly between teams, users, and technical contexts.",
      },
    ],
    projectsLabel: "Selected Projects",
    projectsText:
      "Real-time systems, embedded logic, and products that had to keep working once they left the prototype stage.",
    openLabel: "Open",
    highlights: [
      "Distributed systems",
      "Real-time applications",
      "Embedded software",
      "CI/CD thinking",
    ],
  },
  fr: {
    topLabel: "Génie logiciel / Systèmes / Interfaces",
    statusBadge: "Étudiant en génie logiciel",
    schoolBadge: "Polytechnique Montreal",
    intro:
      "Je construis des logiciels solides sous pression, des systèmes multijoueurs distribués et robots embarqués jusqu'aux interfaces claires pour des produits complexes.",
    askLabel: "Demander à Wesam",
    askTitle: "La couche IA est la page d'accueil.",
    askText:
      "Pose une question sur mon parcours, mes projets, mon stack technique ou les compromis derrière les systèmes ci-dessous.",
    emptyState:
      "Commence par mes études, ma façon de construire des systèmes ou ce que j'ai appris des projets ci-dessous.",
    placeholders: [
      "Qu'étudies-tu à Polytechnique Montreal ?",
      "Quel type de projets aimes-tu construire ?",
      "Avec quelles technologies travailles-tu le plus ?",
    ],
    introNotes: [
      {
        label: "Basé à",
        value: "Laval, Quebec",
      },
      {
        label: "Études",
        value: "Génie logiciel à Polytechnique Montreal",
      },
      {
        label: "Style de travail",
        value: "Exécution calme sous pression et coordination claire en équipe",
      },
    ],
    profileNotes: [
      {
        title: "Ma façon de construire",
        text:
          "J'aime les projets avec plusieurs pièces en mouvement : état temps réel, architecture claire et interfaces qui restent simples même quand le système derrière est complexe.",
      },
      {
        title: "Ce qui me structure",
        text:
          "Le travail en cuisine sous pression m'a appris à prioriser vite, communiquer clairement et garder une qualité constante quand le rythme s'accélère.",
      },
      {
        title: "Langues",
        text:
          "Je parle couramment français, je suis à l'aise en anglais et l'arabe est ma langue maternelle. Ça m'aide à naviguer proprement entre équipes, utilisateurs et contexte technique.",
      },
    ],
    projectsLabel: "Projets sélectionnés",
    projectsText:
      "Des systèmes temps réel, de la logique embarquée et des produits qui devaient rester fiables au-delà du prototype.",
    openLabel: "Ouvrir",
    highlights: [
      "Systèmes distribués",
      "Applications temps réel",
      "Logiciel embarqué",
      "Réflexe CI/CD",
    ],
  },
} as const;

type Locale = keyof typeof content;

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*+-";

function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const totalFrames = Math.min(Math.max(Math.floor(text.length * 0.45) + 4, 7), 14);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const renderFrame = () => {
      const revealCount = Math.floor((frame / totalFrames) * text.length);
      const next = text
        .split("")
        .map((char, index) => {
          if (char === " ") {
            return " ";
          }

          if (index < revealCount || !/[A-Za-z0-9]/.test(char)) {
            return char;
          }

          return SCRAMBLE_CHARS[(index + frame * 3) % SCRAMBLE_CHARS.length];
        })
        .join("");

      setDisplay(next);

      if (frame < totalFrames) {
        frame += 1;
        timeoutId = setTimeout(renderFrame, 14);
      } else {
        setDisplay(text);
      }
    };

    renderFrame();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [text]);

  return (
    <span aria-label={text} className={className}>
      {display}
    </span>
  );
}

const localizedVariants = {
  enter: () => ({
    opacity: 0,
    scale: 0.995,
    filter: "blur(8px)",
  }),
  center: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: () => ({
    opacity: 0,
    scale: 1.005,
    filter: "blur(6px)",
  }),
};

type ToolPartLike = {
  type?: unknown;
  input?: unknown;
  output?: unknown;
  args?: unknown;
  result?: unknown;
  toolName?: unknown;
};

function isProjectCardPayload(value: unknown): value is ProjectCardProps {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.projectName === "string" &&
    Array.isArray(candidate.techStack) &&
    candidate.techStack.every((item) => typeof item === "string") &&
    typeof candidate.role === "string" &&
    typeof candidate.architectureDescription === "string"
  );
}

function isDeployedLinksPayload(value: unknown): value is DeployedLinksCardProps {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.title === "string" &&
    Array.isArray(candidate.links) &&
    candidate.links.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const link = item as Record<string, unknown>;
      return (
        typeof link.projectName === "string" &&
        typeof link.deployedUrl === "string" &&
        (link.status === "live" || link.status === "coming-soon")
      );
    })
  );
}

function isContactWidgetPayload(value: unknown): value is ContactAvailabilityCardProps {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.subtitle === "string" &&
    typeof candidate.email === "string" &&
    Array.isArray(candidate.availabilityOptions) &&
    typeof candidate.submitLabel === "string"
  );
}

function isSkillsWidgetPayload(value: unknown): value is SkillsWidgetCardProps {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.title === "string" &&
    typeof candidate.subtitle === "string" &&
    Array.isArray(candidate.categories) &&
    candidate.categories.every((category) => {
      if (!category || typeof category !== "object") {
        return false;
      }

      const typedCategory = category as Record<string, unknown>;
      return (
        typeof typedCategory.label === "string" &&
        Array.isArray(typedCategory.items) &&
        typedCategory.items.every((item) => typeof item === "string")
      );
    })
  );
}

function collectProjectCards(parts: unknown): ProjectCardProps[] {
  if (!Array.isArray(parts)) {
    return [];
  }

  const cards: ProjectCardProps[] = [];

  for (const part of parts) {
    if (!part || typeof part !== "object") {
      continue;
    }

    const toolPart = part as ToolPartLike;

    if (toolPart.type === "tool-show_project_details") {
      const payloadCandidates = [
        toolPart.output,
        toolPart.result,
        toolPart.input,
        toolPart.args,
      ];

      const payload = payloadCandidates.find((candidate) =>
        isProjectCardPayload(candidate),
      );

      if (payload) {
        cards.push(payload);
      }
      continue;
    }

    if (toolPart.type === "tool-invocation" && toolPart.toolName === "show_project_details") {
      const payloadCandidates = [
        toolPart.result,
        toolPart.output,
        toolPart.args,
        toolPart.input,
      ];

      const payload = payloadCandidates.find((candidate) =>
        isProjectCardPayload(candidate),
      );

      if (payload) {
        cards.push(payload);
      }
    }
  }

  return cards;
}

function collectDeployedLinksCards(parts: unknown): DeployedLinksCardProps[] {
  if (!Array.isArray(parts)) {
    return [];
  }

  const cards: DeployedLinksCardProps[] = [];

  for (const part of parts) {
    if (!part || typeof part !== "object") {
      continue;
    }

    const toolPart = part as ToolPartLike;

    if (toolPart.type === "tool-show_deployed_links") {
      const payloadCandidates = [
        toolPart.output,
        toolPart.result,
        toolPart.input,
        toolPart.args,
      ];

      const payload = payloadCandidates.find((candidate) =>
        isDeployedLinksPayload(candidate),
      );

      if (payload) {
        cards.push(payload);
      }
      continue;
    }

    if (toolPart.type === "tool-invocation" && toolPart.toolName === "show_deployed_links") {
      const payloadCandidates = [
        toolPart.result,
        toolPart.output,
        toolPart.args,
        toolPart.input,
      ];

      const payload = payloadCandidates.find((candidate) =>
        isDeployedLinksPayload(candidate),
      );

      if (payload) {
        cards.push(payload);
      }
    }
  }

  const seen = new Set<string>();

  return cards.filter((card) => {
    const signature = JSON.stringify(card);

    if (seen.has(signature)) {
      return false;
    }

    seen.add(signature);
    return true;
  });
}

function collectContactWidgets(parts: unknown): ContactAvailabilityCardProps[] {
  if (!Array.isArray(parts)) {
    return [];
  }

  const widgets: ContactAvailabilityCardProps[] = [];

  for (const part of parts) {
    if (!part || typeof part !== "object") {
      continue;
    }

    const toolPart = part as ToolPartLike;

    if (toolPart.type === "tool-show_contact_widget") {
      const payloadCandidates = [
        toolPart.output,
        toolPart.result,
        toolPart.input,
        toolPart.args,
      ];

      const payload = payloadCandidates.find((candidate) =>
        isContactWidgetPayload(candidate),
      );

      if (payload) {
        widgets.push(payload);
      }
      continue;
    }

    if (toolPart.type === "tool-invocation" && toolPart.toolName === "show_contact_widget") {
      const payloadCandidates = [
        toolPart.result,
        toolPart.output,
        toolPart.args,
        toolPart.input,
      ];

      const payload = payloadCandidates.find((candidate) =>
        isContactWidgetPayload(candidate),
      );

      if (payload) {
        widgets.push(payload);
      }
    }
  }

  const seen = new Set<string>();

  return widgets.filter((widget) => {
    const signature = JSON.stringify(widget);
    if (seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  });
}

function collectSkillsWidgets(parts: unknown): SkillsWidgetCardProps[] {
  if (!Array.isArray(parts)) {
    return [];
  }

  const widgets: SkillsWidgetCardProps[] = [];

  for (const part of parts) {
    if (!part || typeof part !== "object") {
      continue;
    }

    const toolPart = part as ToolPartLike;

    if (toolPart.type === "tool-show_skills_widget") {
      const payloadCandidates = [
        toolPart.output,
        toolPart.result,
        toolPart.input,
        toolPart.args,
      ];

      const payload = payloadCandidates.find((candidate) =>
        isSkillsWidgetPayload(candidate),
      );

      if (payload) {
        widgets.push(payload);
      }
      continue;
    }

    if (toolPart.type === "tool-invocation" && toolPart.toolName === "show_skills_widget") {
      const payloadCandidates = [
        toolPart.result,
        toolPart.output,
        toolPart.args,
        toolPart.input,
      ];

      const payload = payloadCandidates.find((candidate) =>
        isSkillsWidgetPayload(candidate),
      );

      if (payload) {
        widgets.push(payload);
      }
    }
  }

  const seen = new Set<string>();

  return widgets.filter((widget) => {
    const signature = JSON.stringify(widget);
    if (seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  });
}

function collectText(parts: unknown) {
  if (!Array.isArray(parts)) {
    return "";
  }

  const fullText = parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        Boolean(part) &&
        typeof part === "object" &&
        (part as { type?: unknown }).type === "text" &&
        typeof (part as { text?: unknown }).text === "string",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();

  const deltaText = parts
    .filter(
      (part): part is { type: "text-delta"; textDelta: string } =>
        Boolean(part) &&
        typeof part === "object" &&
        (part as { type?: unknown }).type === "text-delta" &&
        typeof (part as { textDelta?: unknown }).textDelta === "string",
    )
    .map((part) => part.textDelta)
    .join("")
    .trim();

  if (fullText && deltaText) {
    return fullText.length >= deltaText.length ? fullText : deltaText;
  }

  return fullText || deltaText;
}

function getPreviousUserQuestion(messages: Array<{ role: string; parts: unknown }>, index: number) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = messages[cursor];
    if (candidate.role !== "user") {
      continue;
    }

    const text = collectText(candidate.parts);
    if (text) {
      return text;
    }
  }

  return "";
}

function getSingleContactLine(locale: Locale) {
  return locale === "fr"
    ? "Vous pouvez me contacter à l'adresse suivante : contact@wesamdawod.com."
    : "You can contact me at: contact@wesamdawod.com.";
}

function normalizeAssistantContactText(
  rawText: string,
  locale: Locale,
  hasContactWidget: boolean,
  isContactQuestion: boolean,
) {
  const trimmed = rawText.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (!isContactQuestion) {
    return trimmed;
  }

  const hasEmail = trimmed.toLowerCase().includes("contact@wesamdawod.com");

  // When the contact widget is present, keep one contact sentence only.
  if (hasContactWidget && hasEmail) {
    return getSingleContactLine(locale);
  }

  if (!hasEmail && !hasContactWidget) {
    return trimmed;
  }

  const normalizedWhitespace = trimmed.replace(/\s+/g, " ").trim();
  const sentenceChunks = normalizedWhitespace
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const emailSentence = sentenceChunks.find((sentence) =>
    sentence.toLowerCase().includes("contact@wesamdawod.com"),
  );

  if (emailSentence) {
    return emailSentence;
  }

  return getSingleContactLine(locale);
}

export function Hero() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>("en");
  const [input, setInput] = useState("");
  const [enableVisualFx, setEnableVisualFx] = useState(false);
  const chatViewportRef = useRef<HTMLDivElement>(null);
  const copy = content[locale];
  const projects = getProjects(locale);
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/completion",
      body: { locale },
    }),
    onError: (error) => toast.error(error.message),
  });
  const isLoading = status === "submitted" || status === "streaming";

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    if (!chatViewportRef.current) {
      return;
    }

    chatViewportRef.current.scrollTo({
      top: chatViewportRef.current.scrollHeight,
      behavior,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateVisualFx = () => {
      const desktopViewport = window.innerWidth >= 768;
      setEnableVisualFx(desktopViewport && !motionMedia.matches);
    };

    updateVisualFx();

    window.addEventListener("resize", updateVisualFx);
    motionMedia.addEventListener("change", updateVisualFx);

    return () => {
      window.removeEventListener("resize", updateVisualFx);
      motionMedia.removeEventListener("change", updateVisualFx);
    };
  }, []);

  useEffect(() => {
    const langParam = searchParams.get("lang");

    if (langParam === "fr") {
      setLocale("fr");
      return;
    }

    if (langParam === "en") {
      setLocale("en");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!chatViewportRef.current) {
      return;
    }

    scrollChatToBottom("smooth");
  }, [messages, isLoading, scrollChatToBottom]);

  useEffect(() => {
    // Locale switch re-mounts the animated section; run a second pass after transition.
    const rafId = requestAnimationFrame(() => {
      scrollChatToBottom("auto");
    });

    const timeoutId = window.setTimeout(() => {
      scrollChatToBottom("auto");
    }, 240);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [locale, messages.length, scrollChatToBottom]);

  const handleSubmitWrapper = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextPrompt = input.trim();

    if (!nextPrompt) {
      return;
    }

    sendMessage({ text: nextPrompt });
    setInput("");
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    setInput("");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-3 pb-20 pt-5 sm:px-8 lg:px-12 lg:pb-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(115,233,255,0.12),transparent_34%)]" />
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#73e9ff]/8 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#73e9ff]/40 to-transparent" />
        {enableVisualFx ? (
          <FlickeringGrid
            className="absolute inset-0 size-full opacity-18 [mask-image:radial-gradient(circle_at_top,black_18%,transparent_62%)]"
            squareSize={8}
            gridGap={14}
            color="#73e9ff"
            maxOpacity={0.07}
            flickerChance={0.015}
          />
        ) : null}
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 text-center">
        <div className="flex w-full flex-col items-center gap-3 border border-white/10 bg-black/30 px-4 py-2 text-[0.68rem] uppercase tracking-[0.34em] text-white/52 sm:flex-row sm:justify-between">
          <div className="font-mono flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center sm:justify-start sm:text-left">
            <span className="font-display text-[#73e9ff]">AI</span>
            <ScrambleText text={copy.topLabel} />
          </div>

          <div className="relative inline-flex overflow-hidden rounded-[10px] border border-[#73e9ff]/25 bg-[#091018] p-1 text-[0.65rem] shadow-[0_0_0_1px_rgba(115,233,255,0.08),0_12px_30px_rgba(0,0,0,0.2)]">
            {(["en", "fr"] as const).map((nextLocale) => (
              <button
                key={nextLocale}
                type="button"
                onClick={() => handleLocaleChange(nextLocale)}
                className={`relative isolate min-w-[64px] rounded-[7px] px-2.5 py-1.5 font-mono transition sm:min-w-[82px] sm:px-3 sm:py-2 ${
                  locale === nextLocale
                    ? "text-[#081018]"
                    : "text-white/55 hover:text-white"
                }`}
              >
                {locale === nextLocale ? (
                  <motion.span
                    layoutId="locale-indicator"
                    className="absolute inset-0 rounded-[7px] border border-[#73e9ff]/35 bg-[#73e9ff] shadow-[0_0_24px_rgba(115,233,255,0.25)]"
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10 flex items-center justify-center">
                  <span>{nextLocale.toUpperCase()}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={locale}
            variants={localizedVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="flex w-full flex-col items-center gap-8"
          >
            <section id="about" className="flex w-full flex-col items-center gap-6 pt-8">
              <div className="flex flex-wrap justify-center gap-2 text-[0.7rem] uppercase tracking-[0.28em] text-white/54">
                <span className="border border-[#73e9ff]/25 bg-[#73e9ff]/10 px-3 py-1 text-[#a5f4ff]">
                  <ScrambleText text={copy.statusBadge} />
                </span>
                <span className="border border-white/10 px-3 py-1">
                  <ScrambleText text={copy.schoolBadge} />
                </span>
              </div>

              <h1 className="font-display max-w-4xl text-[clamp(3.4rem,10vw,7rem)] leading-[0.88] text-white">
                Wesam Dawod
              </h1>

              <p className="max-w-2xl text-base leading-7 text-[#c7d0da] sm:text-lg sm:leading-8">
                {copy.intro}
              </p>

              <ul className="flex flex-wrap justify-center gap-3 text-sm text-white/70">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <a
                      className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-4 py-2.5 hover:border-[#73e9ff]/25 hover:text-white"
                      href={href}
                      rel="noreferrer"
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                    >
                      <Icon className="h-4 w-4 text-[#73e9ff]" />
                      {label[locale]}
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            <section
              id="ask"
              className="relative w-full overflow-hidden border border-white/8 bg-black/40 p-4 text-left shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:border-white/10 sm:p-8"
            >
              <motion.div
                key={`scan-${locale}`}
                initial={{
                  opacity: 0,
                  scaleX: 0.35,
                }}
                animate={{
                  opacity: [0, 0.45, 0],
                  scaleX: [0.35, 1, 0.35],
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 origin-center bg-gradient-to-r from-transparent via-[#73e9ff]/12 to-transparent"
              />

              <div className="flex flex-col items-center gap-2 border-b border-white/8 pb-4 text-center sm:gap-3 sm:border-white/10 sm:pb-5">
                <span className="font-display text-base text-[#73e9ff]">
                  <ScrambleText text={copy.askLabel} />
                </span>
                <h2 className="max-w-2xl text-2xl font-medium leading-tight text-white sm:text-3xl">
                  <ScrambleText text={copy.askTitle} />
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-white/56 sm:text-base">
                  {copy.askText}
                </p>
              </div>

              <div className="mx-auto mt-4 max-w-3xl sm:mt-6">
                <motion.div
                  key={`${locale}-${messages.length}`}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="mb-3 min-h-64 border border-white/8 bg-[#091018] px-3 py-3 text-left text-sm leading-7 text-[#d7e2ec] sm:mb-4 sm:border-white/10 sm:px-5 sm:py-4"
                >
                  {messages.length > 0 ? (
                    <div
                      ref={chatViewportRef}
                      className="max-h-[30rem] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(115,233,255,0.55)_rgba(255,255,255,0.07)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.06] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#73e9ff]/70 [&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:hover:bg-[#73e9ff] sm:space-y-3 sm:pr-2"
                    >
                      {messages.map((message, index) => {
                        const textContent = collectText(message.parts);
                        const cards = collectProjectCards(message.parts);
                        const deployedLinksCards = collectDeployedLinksCards(message.parts);
                        const contactWidgets = collectContactWidgets(message.parts);
                        const skillsWidgets = collectSkillsWidgets(message.parts);
                        const isUser = message.role === "user";
                        const previousUserQuestion = !isUser
                          ? getPreviousUserQuestion(messages, index)
                          : "";
                        const fallbackCard =
                          !isUser && cards.length === 0 && previousUserQuestion
                            ? resolveProjectCardByQuestion(locale, previousUserQuestion)
                            : null;
                        const cardsToRender = fallbackCard ? [fallbackCard] : cards;
                        const fallbackDeployedLinksCard =
                          !isUser &&
                          deployedLinksCards.length === 0 &&
                          previousUserQuestion &&
                          isDeployedLinksQuestion(previousUserQuestion)
                            ? buildDeployedLinksCardData(locale)
                            : null;
                        const deployedLinksCardsToRender = fallbackDeployedLinksCard
                          ? [fallbackDeployedLinksCard]
                          : deployedLinksCards;
                        const fallbackContactWidget =
                          !isUser &&
                          contactWidgets.length === 0 &&
                          previousUserQuestion && isContactRelatedQuestion(previousUserQuestion)
                            ? buildContactWidgetData(locale)
                            : null;
                        const contactWidgetsToRender = fallbackContactWidget
                          ? [fallbackContactWidget]
                          : contactWidgets;
                        const isContactQuestion =
                          !isUser &&
                          Boolean(previousUserQuestion) &&
                          isContactRelatedQuestion(previousUserQuestion);
                        const fallbackSkillsWidget =
                          !isUser &&
                          skillsWidgets.length === 0 &&
                          previousUserQuestion &&
                          isGlobalSkillsOverviewQuestion(previousUserQuestion) &&
                          !resolveProjectCardByQuestion(locale, previousUserQuestion)
                            ? buildSkillsWidgetData(locale)
                            : null;
                        const skillsWidgetsToRender = fallbackSkillsWidget
                          ? [fallbackSkillsWidget]
                          : skillsWidgets;
                        const displayText = isUser
                          ? textContent
                          : normalizeAssistantContactText(
                              textContent,
                              locale,
                              contactWidgetsToRender.length > 0,
                              isContactQuestion,
                            );

                        return (
                          <div
                            key={message.id}
                            className={`space-y-1.5 sm:space-y-2 ${isUser ? "flex justify-end" : ""}`}
                          >
                            {displayText ? (
                              <div
                                className={`max-w-[94%] rounded-xl border px-3 py-2.5 leading-7 sm:max-w-[92%] sm:px-4 sm:py-3 ${
                                  isUser
                                    ? "border-[#73e9ff]/22 bg-[#0e1a25] text-[#d5ecff] sm:border-[#73e9ff]/28"
                                    : "border-white/8 bg-[#0f1823] text-[#d7e2ec] sm:border-white/10"
                                }`}
                              >
                                {displayText}
                              </div>
                            ) : null}

                            {!isUser
                              ? cardsToRender.map((card, cardIndex) => (
                                  <ProjectCard
                                    key={`${message.id}-${card.projectName}-${cardIndex}`}
                                    projectName={card.projectName}
                                    techStack={card.techStack}
                                    role={card.role}
                                    architectureDescription={card.architectureDescription}
                                  />
                                ))
                              : null}

                            {!isUser
                              ? deployedLinksCardsToRender.map((card, cardIndex) => (
                                  <DeployedLinksCard
                                    key={`${message.id}-${card.title}-${cardIndex}`}
                                    title={card.title}
                                    links={card.links}
                                    deploymentTitle={card.deploymentTitle}
                                  />
                                ))
                              : null}

                            {!isUser
                              ? contactWidgetsToRender.map((widget, widgetIndex) => (
                                  <ContactAvailabilityCard
                                    key={`${message.id}-${widget.title}-${widgetIndex}`}
                                    title={widget.title}
                                    subtitle={widget.subtitle}
                                    email={widget.email}
                                    availabilityLabel={widget.availabilityLabel}
                                    availabilityOptions={widget.availabilityOptions}
                                    nameLabel={widget.nameLabel}
                                    emailLabel={widget.emailLabel}
                                    subjectLabel={widget.subjectLabel}
                                    messageLabel={widget.messageLabel}
                                    submitLabel={widget.submitLabel}
                                    successMessage={widget.successMessage}
                                    errorMessage={widget.errorMessage}
                                  />
                                ))
                              : null}

                            {!isUser
                              ? skillsWidgetsToRender.map((widget, widgetIndex) => (
                                  <SkillsWidgetCard
                                    key={`${message.id}-${widget.title}-${widgetIndex}`}
                                    title={widget.title}
                                    subtitle={widget.subtitle}
                                    categories={widget.categories}
                                  />
                                ))
                              : null}
                          </div>
                        );
                      })}

                      {isLoading ? (
                        <p className="text-xs uppercase tracking-[0.22em] text-[#73e9ff]/70">
                          Thinking...
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-white/42">{copy.emptyState}</p>
                  )}
                </motion.div>

                <PlaceholdersAndVanishInput
                  placeholders={copy.placeholders}
                  onChange={handleInputChange}
                  onSubmit={handleSubmitWrapper}
                />
              </div>
            </section>

            <section className="grid w-full gap-4 md:grid-cols-3">
              {copy.introNotes.map((note) => (
                <article
                  key={note.label}
                  className="border border-white/10 bg-white/[0.03] p-4 text-center sm:p-5"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                    {note.label}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#d8e0ea]">
                    {note.value}
                  </p>
                </article>
              ))}
            </section>

            <section className="grid w-full gap-4 md:grid-cols-2">
              {copy.profileNotes.slice(0, 2).map((note) => (
                <article
                  key={note.title}
                  className="border border-white/10 bg-white/[0.03] p-4 text-left sm:p-6"
                >
                  <h2 className="font-display text-2xl leading-tight text-white">
                    <ScrambleText text={note.title} />
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    {note.text}
                  </p>
                </article>
              ))}
            </section>

            <section className="w-full border border-white/10 bg-black/30 p-4 text-left sm:p-6">
              <div className="flex flex-col items-center gap-3 border-b border-white/10 pb-4 text-center">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  <ScrambleText text={copy.projectsLabel} />
                </p>
                <p className="max-w-2xl text-base leading-7 text-white/56">
                  {copy.projectsText}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.slug}
                    className="group block border border-white/10 bg-white/[0.02] p-4 hover:border-[#73e9ff]/25 hover:bg-white/[0.04] sm:p-5"
                    href={`/projects/${project.slug}${locale === "fr" ? "?lang=fr" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left">
                      <div className="space-y-3">
                        <div className="font-mono flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.22em] text-white/40 sm:justify-start">
                          <span>{project.category}</span>
                          <span>{project.year}</span>
                        </div>
                        <h2 className="font-display max-w-2xl text-2xl leading-tight text-white sm:text-[2rem]">
                          {project.title}
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
                          {project.summary}
                        </p>
                      </div>

                      <div className="font-mono inline-flex items-center gap-2 text-sm text-[#73e9ff]">
                        {copy.openLabel}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </div>

                    <ul className="mt-6 flex flex-wrap justify-center gap-2 text-xs uppercase tracking-[0.14em] text-white/42 sm:justify-start">
                      {project.stack.slice(0, 4).map((item) => (
                        <li
                          key={item}
                          className="font-mono border border-white/10 bg-[#0d141d] px-2.5 py-1.5"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Link>
                ))}
              </div>
            </section>

            <ul className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {copy.highlights.map((item, index) => (
                <li
                  key={item}
                  className="font-mono flex items-center justify-between border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/68"
                >
                  <span>{item}</span>
                  <span className="text-xs text-[#73e9ff]/80">
                    0{index + 1}
                  </span>
                </li>
              ))}
            </ul>

            <p className="max-w-2xl text-sm leading-7 text-white/48">
              {copy.profileNotes[2].text}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}
