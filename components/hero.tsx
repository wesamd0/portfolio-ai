"use client";

import { useCompletion } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
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
    href: "mailto:wesamd2003@gmail.com",
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

export function Hero() {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>("en");
  const [text, setText] = useState("");
  const [enableVisualFx, setEnableVisualFx] = useState(false);
  const copy = content[locale];
  const projects = getProjects(locale);
  const {
    completion,
    isLoading,
    handleInputChange,
    handleSubmit,
    setInput,
  } = useCompletion({
    api: "/api/completion",
    body: { locale },
    streamProtocol: "text",
    onFinish: (_prompt, answer) => {
      const cleanedAnswer = answer.replace(/<\/?answer>/g, "").trim();
      setText(cleanedAnswer);
    },
    onError: (error) => toast.error(error.message),
  });

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

  const handleSubmitWrapper = (event: FormEvent<HTMLFormElement>) => {
    handleSubmit(event);
    setInput("");
  };

  const handleLocaleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);
    setText("");
    setInput("");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-5 pb-20 pt-5 sm:px-8 lg:px-12 lg:pb-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(115,233,255,0.12),transparent_34%)]" />
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#73e9ff]/8 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#73e9ff]/40 to-transparent" />
        {enableVisualFx ? (
          <FlickeringGrid
            className="absolute inset-0 size-full opacity-18 [mask-image:radial-gradient(circle_at_top,black_18%,transparent_62%)]"
            squareSize={4}
            gridGap={10}
            color="#73e9ff"
            maxOpacity={0.1}
            flickerChance={0.04}
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
              className="relative w-full overflow-hidden border border-white/10 bg-black/40 p-5 text-left shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8"
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

              <div className="flex flex-col items-center gap-3 border-b border-white/10 pb-5 text-center">
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

              <div className="mx-auto mt-6 max-w-3xl">
                <motion.div
                  key={`${locale}-${text || completion || "empty"}`}
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="mb-4 min-h-64 border border-white/10 bg-[#091018] px-4 py-4 text-left text-sm leading-7 text-[#d7e2ec] sm:px-5"
                >
                  {isLoading && completion.length > 0 ? (
                    <p>{completion.replace(/<\/?answer>/g, "").trim()}</p>
                  ) : text ? (
                    <p>{text}</p>
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
                  className="border border-white/10 bg-white/[0.03] p-5 text-center"
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
                  className="border border-white/10 bg-white/[0.03] p-6 text-left"
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

            <section className="w-full border border-white/10 bg-black/30 p-5 text-left sm:p-6">
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
                    className="group block border border-white/10 bg-white/[0.02] p-5 hover:border-[#73e9ff]/25 hover:bg-white/[0.04]"
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
