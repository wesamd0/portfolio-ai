export type Locale = "en" | "fr";

type ProjectContent = {
  title: string;
  category: string;
  summary: string;
  overview: string;
  challenge: string;
  approach: string;
  outcome: string;
  stack: string[];
};

type ProjectSource = {
  slug: string;
  year: string;
  liveUrl?: string;
  en: ProjectContent;
  fr: ProjectContent;
};

export type Project = {
  slug: string;
  year: string;
  liveUrl?: string;
} & ProjectContent;

const projects = [
  {
    slug: "distributed-mobile-cross-play-ecosystem",
    year: "2026",
    liveUrl: "https://wesamdawod.com/rpg-evolution",
    en: {
      title: "Distributed & Mobile Cross-Play Ecosystem",
      category: "Systems / Mobile / Realtime",
      summary:
        "Transformation of a monolithic web architecture into a distributed multi-client system with real-time synchronization between desktop and mobile.",
      overview:
        "This project reworked a single web-first product into a system that could move cleanly between desktop and mobile while keeping the same state, session flow, and response model.",
      challenge:
        "A monolith made it hard to support multiple client surfaces without duplicated logic or drifting state.",
      approach:
        "The application was decomposed into coordinated clients with Socket.io handling live state, Flutter and Dart handling the mobile experience, Node.js managing the backend, and AWS providing the deployment layer.",
      outcome:
        "The final structure supported real-time play across devices while keeping the system coherent enough to extend and maintain.",
      stack: ["Flutter", "Dart", "Socket.io", "Node.js", "AWS"],
    },
    fr: {
      title: "Ecosysteme Cross-Play Distribue et Mobile",
      category: "Architecture distribuee / Mobile / Temps reel",
      summary:
        "Transformation d'une architecture monolithique web en un systeme distribue multi-clients avec synchronisation temps reel entre client desktop et application mobile.",
      overview:
        "Le projet a converti une plateforme web existante vers une experience multiplateforme commercialisable en orchestrant la synchronisation entre un client desktop lourd et un client mobile leger, tout en traitant la dette technique legacy.",
      challenge:
        "Le principal defi etait de transposer une UX desktop vers mobile sans regression, tout en respectant un cahier des charges SRS strict et des contraintes de maintenance logicielle.",
      approach:
        "J'ai contribue a l'architecture distribuee sur AWS avec Socket.io, a la transposition UX mobile en Dart/Flutter avec capteurs natifs, au pilotage des exigences SRS, et a l'integration de nouvelles fonctionnalites dans le code legacy avec controle de non-regression.",
      outcome:
        "Livraison finale prevue en mai 2026; la structure actuelle supporte deja une synchronisation cross-play fiable et un cadre d'evolution maintenable.",
      stack: [
        "Dart",
        "Flutter",
        "Socket.io",
        "Node.js",
        "Architecture distribuee",
        "AWS (EC2)",
        "SRS",
        "CI/CD",
      ],
    },
  },
  {
    slug: "multiplayer-tactical-rpg",
    year: "2025",
    liveUrl: "https://wesamdawod.com/rpg",
    en: {
      title: "Multiplayer Tactical RPG",
      category: "Full Stack / Multiplayer / CI/CD",
      summary:
        "Full-stack multiplayer game application built with real-time synchronization, continuous deployment, and a disciplined delivery workflow.",
      overview:
        "This project focused on building a tactical RPG that felt responsive in the browser while keeping the gameplay loop stable under live multiplayer conditions.",
      challenge:
        "The main problem was coordinating player actions, game state, and deployment quality without letting the experience become fragile.",
      approach:
        "Angular handled the interface, Node.js and MongoDB managed the application layer and persistence, Socket.io kept players synchronized, and CI/CD kept the release process predictable.",
      outcome:
        "The result was a multiplayer system that could be iterated on quickly without sacrificing stability or game feel.",
      stack: ["Angular", "Node.js", "MongoDB", "Socket.io", "CI/CD"],
    },
    fr: {
      title: "RPG Tactique Multijoueur",
      category: "Full Stack / Multijoueur / CI/CD",
      summary:
        "Conception d'une application full stack Angular/Node.js avec synchronisation temps reel WebSockets et pipeline de deploiement continu.",
      overview:
        "Le projet visait a livrer un jeu tactique robuste en production, avec une architecture distribuee complete, du front Angular jusqu'a la persistence MongoDB, dans un cadre Agile Scrum.",
      challenge:
        "Le defi etait d'orchestrer en meme temps la concurrence multijoueur en temps reel, la qualite logicielle via tests et revues de code, et un deploiement CI/CD fiable vers AWS.",
      approach:
        "J'ai participe transversalement a l'implementation des fonctionnalites front/back, a la redaction de tests unitaires (Jest/Mocha/Chai), aux revues de code, et a la configuration CI/CD avec contributions aux decisions d'architecture (UML, API REST).",
      outcome:
        "Application deployee sur AWS via pipeline CI/CD automatise, avec gestion stable de la concurrence multijoueur et preservation de l'integrite des historiques de parties.",
      stack: [
        "Angular 17",
        "TypeScript",
        "Node.js / Express",
        "MongoDB",
        "WebSockets",
        "AWS (EC2)",
        "CI/CD (GitLab)",
        "Jasmine / Jest / Mocha / Chai",
      ],
    },
  },
  {
    slug: "autonomous-navigation-robot",
    year: "2024",
    liveUrl: "https://wesamdawod.com/robot",
    en: {
      title: "Autonomous Navigation Robot",
      category: "Embedded / Robotics / Navigation",
      summary:
        "Autonomous multi-robot navigation system using infrared communication, mapping, sensors, and deterministic embedded logic.",
      overview:
        "This project explored embedded coordination in a physical environment, where navigation, timing, and sensor feedback had to stay consistent in real conditions.",
      challenge:
        "Robotic movement had to remain deterministic while still reacting to changing position data, obstacles, and communication signals.",
      approach:
        "C and C++ were used for the embedded logic, AVR handled the low-level control path, infrared communication linked the robots, and sensor input informed movement and mapping decisions.",
      outcome:
        "The system produced a reliable navigation behavior that showed how tightly controlled embedded logic can still support autonomous coordination.",
      stack: ["C/C++", "AVR", "Infrared", "Sensors", "Linux"],
    },
    fr: {
      title: "Robot Autonome de Navigation",
      category: "Embarque / Robotique / Navigation",
      summary:
        "Conception d'un systeme de navigation autonome capable de cartographier et traverser un parcours d'obstacles en temps reel.",
      overview:
        "Le projet reposait sur la coordination de deux robots: un robot explorateur cartographiait le parcours puis transmettait les donnees via infrarouge a un robot recepteur charge de s'orienter et sortir de sa zone.",
      challenge:
        "Le defi etait de garder un comportement deterministe avec communication IR, contraintes capteurs et interruptions, tout en assurant une integration fiable de bout en bout le jour de la demonstration.",
      approach:
        "J'ai pris la responsabilite complete du robot recepteur: machine a etats en C (Attente, Reception, Centrage, Sortie), algorithmes de correction de trajectoire, integration capteurs et support technique sur le robot suiveur de ligne pour garantir la chaine complete.",
      outcome:
        "Le robot a execute le scenario de sortie de maniere autonome, sans intervention humaine, sans deviation de ligne et dans les temps impartis, validant la robustesse de la logique embarquee.",
      stack: [
        "C / C++",
        "Linux Env.",
        "AVR LibC",
        "Microcontroleur AVR",
        "Communication IR",
        "Capteurs / Interruptions",
      ],
    },
  },
] as const satisfies readonly ProjectSource[];

export type ProjectSlug = (typeof projects)[number]["slug"];

function toLocalizedProject(source: ProjectSource, locale: Locale): Project {
  const content = source[locale];

  return {
    slug: source.slug,
    year: source.year,
    liveUrl: source.liveUrl,
    ...content,
  };
}

export function getProjects(locale: Locale = "en") {
  return projects.map((project) => toLocalizedProject(project, locale));
}

export function getProjectBySlug(slug: string, locale: Locale = "en") {
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    return undefined;
  }

  return toLocalizedProject(project, locale);
}

export function getProjectSlugs() {
  return projects.map((project) => ({ slug: project.slug }));
}
