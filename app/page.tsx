import { Suspense } from "react";
import { Hero } from "../components/hero";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Hero />
    </Suspense>
  );
}
