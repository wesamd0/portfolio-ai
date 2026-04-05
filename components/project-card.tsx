import { Cpu, Layers3, Network } from "lucide-react";

export type ProjectCardProps = {
  projectName: string;
  techStack: string[];
  role: string;
  architectureDescription: string;
};

export function ProjectCard({
  projectName,
  techStack,
  role,
  architectureDescription,
}: ProjectCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0a121b] p-5 text-[#dce7f4] shadow-[0_20px_55px_rgba(0,0,0,0.34)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#73e9ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#73e9ff]/40 to-transparent" />

      <header className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#73e9ff]/85">
            Project Spotlight
          </p>
          <h3 className="mt-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
            {projectName}
          </h3>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#73e9ff]/30 bg-[#73e9ff]/10 px-3 py-1 text-xs text-[#a7f4ff]">
          <Network className="h-3.5 w-3.5" />
          GenUI
        </span>
      </header>

      <div className="relative z-10 mt-5 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="font-mono flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-white/55">
            <Layers3 className="h-3.5 w-3.5 text-[#73e9ff]" />
            Role
          </p>
          <p className="mt-2 text-sm leading-6 text-[#d8e4f1]">{role}</p>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="font-mono flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-white/55">
            <Cpu className="h-3.5 w-3.5 text-[#73e9ff]" />
            Tech Stack
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <li
                key={tech}
                className="font-mono rounded-md border border-white/10 bg-[#111c28] px-2.5 py-1 text-[0.72rem] uppercase tracking-[0.08em] text-[#c3d8ec]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="relative z-10 mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white/55">
          Architecture
        </p>
        <p className="mt-2 text-sm leading-7 text-[#d8e4f1]">{architectureDescription}</p>
      </section>
    </article>
  );
}
