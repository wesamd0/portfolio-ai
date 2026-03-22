import { SheetContent } from "@/components/ui/sheet";
import Link from "next/link";

const sections = [
  { href: "#about", label: "About" },
  { href: "#ask", label: "Ask AI" },
  { href: "#links", label: "Links" },
];

export function MobileNav() {
  return (
    <SheetContent side="right" className="border-l border-black/10 bg-[#f5f1e8]">
      <nav className="mt-10 flex flex-col space-y-5">
        {sections.map((section) => (
          <Link
            key={section.href}
            className="text-lg font-medium text-black/70 transition hover:text-black"
            href={section.href}
          >
            {section.label}
          </Link>
        ))}
        <a
          className="text-lg font-medium text-black/70 transition hover:text-black"
          href="https://www.linkedin.com/in/wesam-dawod"
          rel="noreferrer"
          target="_blank"
        >
          LinkedIn
        </a>
        <a
          className="text-lg font-medium text-black/70 transition hover:text-black"
          href="https://github.com/wesamd0"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
        </a>
      </nav>
    </SheetContent>
  );
}
