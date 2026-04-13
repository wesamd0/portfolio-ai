import type { SkillsWidgetData } from "@/lib/ai/skills-widget";

export type SkillsWidgetCardProps = SkillsWidgetData;

export function SkillsWidgetCard({ title, subtitle, categories }: SkillsWidgetCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0a121b] p-5 text-[#dce7f4] shadow-[0_20px_55px_rgba(0,0,0,0.34)] sm:p-6">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#73e9ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#73e9ff]/45 to-transparent" />

      <header className="mb-4">
        <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/70">{subtitle}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {categories.map((category) => (
          <section
            key={category.label}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
          >
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[#9cefff]">
              {category.label}
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <li
                  key={`${category.label}-${item}`}
                  className="font-mono rounded-md border border-white/10 bg-[#111c28] px-2 py-1 text-[0.68rem] uppercase tracking-[0.08em] text-[#c3d8ec]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
