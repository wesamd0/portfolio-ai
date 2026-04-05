import type { DeployedLinkItem } from "@/lib/ai/project-resolution";

export type DeployedLinksCardProps = {
  title: string;
  links: DeployedLinkItem[];
};

export function DeployedLinksCard({ title, links }: DeployedLinksCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0a121b] p-5 text-[#dce7f4] shadow-[0_20px_55px_rgba(0,0,0,0.34)] sm:p-6">
      <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-[#73e9ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#73e9ff]/45 to-transparent" />

      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
        <span className="rounded-full border border-[#73e9ff]/35 bg-[#73e9ff]/12 px-2.5 py-1 text-xs uppercase tracking-[0.12em] text-[#9cefff]">
          Deployments
        </span>
      </header>

      <ul className="space-y-2.5">
        {links.map((item) => {
          const isLive = item.status === "live";

          return (
            <li
              key={`${item.projectName}-${item.deployedUrl}`}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-[#dbe7f4]">{item.projectName}</p>

              {isLive ? (
                <a
                  href={item.deployedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs uppercase tracking-[0.1em] text-[#73e9ff] hover:text-[#b6f8ff]"
                >
                  {item.liveLinkText ?? "Open Live Link"}
                </a>
              ) : (
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-white/55">
                  {item.deployedUrl}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
