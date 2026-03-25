import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { getProjectBySlug, getProjectSlugs, type Locale } from "@/lib/projects";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getProjectSlugs();
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale: Locale = lang === "fr" ? "fr" : "en";
  const project = getProjectBySlug(slug, locale);

  if (!project) {
    return {
      title: "Project not found",
    };
  }

  return {
    title: `${project.title} | Wesam Dawod`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale: Locale = lang === "fr" ? "fr" : "en";
  const project = getProjectBySlug(slug, locale);

  if (!project) {
    notFound();
  }

  const relatedProjects = getProjectSlugs().filter(
    (projectSlug) => projectSlug.slug !== project.slug,
  );

  const copy =
    locale === "fr"
      ? {
          backToHome: "Retour a l'accueil",
          projectDetail: "Details du projet",
          year: "Annee",
          stack: "Stack",
          links: "Liens",
          github: "GitHub",
          deployed: "Deploiement",
          comingSoon: "Bientot disponible",
          openGithub: "Ouvrir GitHub",
          openDeployed: "Ouvrir la version deployee",
          overview: "Vue d'ensemble",
          notes: "Notes",
          challenge: "Challenge",
          approach: "Approche",
          outcome: "Resultat",
          moreProjects: "Autres projets",
        }
      : {
          backToHome: "Back to home",
          projectDetail: "Project Detail",
          year: "Year",
          stack: "Stack",
          links: "Links",
          github: "GitHub",
          deployed: "Deployment",
          comingSoon: "Coming soon",
          openGithub: "Open GitHub",
          openDeployed: "Open deployed app",
          overview: "Overview",
          notes: "Notes",
          challenge: "Challenge",
          approach: "Approach",
          outcome: "Outcome",
          moreProjects: "More Projects",
        };

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-white sm:px-8 lg:px-12 lg:py-8">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(115,233,255,0.1),transparent_28%)]" />
        <div className="absolute left-[-6rem] top-20 h-56 w-56 rounded-full bg-[#73e9ff]/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-6rem] h-72 w-72 rounded-full bg-[#8677ff]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#73e9ff]/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/55">
          <Link
            href={locale === "fr" ? "/?lang=fr" : "/"}
            className="font-mono inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 hover:border-[#73e9ff]/25 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.backToHome}
          </Link>
          <p className="font-mono uppercase tracking-[0.22em] text-[#73e9ff]">
            {project.category}
          </p>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">
              {copy.projectDetail}
            </p>
            <h1 className="font-display text-4xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
              {project.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/64 sm:text-xl">
              {project.summary}
            </p>
          </div>

          <aside className="border border-white/10 bg-black/35 p-5">
            <dl className="grid gap-4 text-sm">
              <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-3">
                <dt className="text-white/45">{copy.year}</dt>
                <dd className="font-mono text-right text-white">{project.year}</dd>
              </div>
              <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-3">
                <dt className="text-white/45">{copy.stack}</dt>
                <dd className="max-w-[14rem] text-right text-white/78">
                  {project.stack.join(", ")}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-6">
                <dt className="text-white/45">{copy.links}</dt>
                <dd className="flex flex-col items-end gap-2 text-right">
                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      className="inline-flex items-center gap-2 text-[#73e9ff] underline decoration-[#73e9ff]/25 underline-offset-4 hover:decoration-[#73e9ff]"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {copy.openGithub}
                      <Github className="h-4 w-4" />
                    </a>
                  ) : project.slug === "distributed-mobile-cross-play-ecosystem" ? (
                    <span className="text-white/55">
                      {copy.github}: {copy.comingSoon}
                    </span>
                  ) : null}
                  {project.deployedUrl ? (
                    <a
                      href={project.deployedUrl}
                      className="inline-flex items-center gap-2 text-[#73e9ff] underline decoration-[#73e9ff]/25 underline-offset-4 hover:decoration-[#73e9ff]"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {copy.openDeployed}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : project.slug === "distributed-mobile-cross-play-ecosystem" ? (
                    <span className="text-white/55">
                      {copy.deployed}: {copy.comingSoon}
                    </span>
                  ) : null}
                </dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="border border-white/10 bg-black/35 p-5 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/42">
              {copy.overview}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
              {project.overview}
            </p>
          </article>

          <article className="border border-white/10 bg-[#0d141d]/90 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/42">
              {copy.notes}
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/68">
              {project.stack.map((item) => (
                <li key={item} className="font-mono border-b border-white/8 pb-2 last:border-b-0">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/42">
              {copy.challenge}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/68">
              {project.challenge}
            </p>
          </article>

          <article className="border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/42">
              {copy.approach}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/68">
              {project.approach}
            </p>
          </article>
        </section>

        <section className="border border-white/10 bg-black/35 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/42">
            {copy.outcome}
          </p>
          <p className="mt-4 max-w-4xl text-base leading-8 text-white/72">
            {project.outcome}
          </p>
        </section>

        <section className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
          {relatedProjects.map((projectSlug) => {
            const related = getProjectBySlug(projectSlug.slug, locale);

            if (!related) {
              return null;
            }

            return (
              <Link
                key={related.slug}
                href={`/projects/${related.slug}${locale === "fr" ? "?lang=fr" : ""}`}
                className="border border-white/10 bg-white/[0.03] p-5 hover:border-[#73e9ff]/25 hover:bg-white/[0.05]"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                  {copy.moreProjects}
                </p>
                <p className="font-display mt-3 text-2xl leading-tight text-white">
                  {related.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/62">
                  {related.summary}
                </p>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
