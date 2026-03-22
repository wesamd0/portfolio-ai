"use client";

import Link from "next/link";

export function NavBar() {
  return (
    <header className="w-full px-6 py-5 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-5xl justify-center px-6 py-1">
        <Link className="font-gambarino text-3xl text-black" href="/">
          Wesam Dawod
        </Link>
      </div>
    </header>
  );
}
