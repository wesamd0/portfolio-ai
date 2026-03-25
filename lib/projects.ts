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
  details?: {
    description?: string;
    challengeTitle?: string;
    challengeDescription?: string;
    contributionTitle?: string;
    contributionDescription?: string;
    roles?: string[];
    featuresTitle?: string;
    features?: string[];
    resultTitle?: string;
    resultDescription?: string;
    galleryTitle?: string;
    galleryCaption?: string;
    deploymentTitle?: string;
    githubLinkLabel?: string;
    deployedLinkLabel?: string;
  };
};

type ProjectSource = {
  slug: string;
  year: string;
  githubUrl?: string;
  deployedUrl?: string;
  en: ProjectContent;
  fr: ProjectContent;
};

export type Project = {
  slug: string;
  year: string;
  githubUrl?: string;
  deployedUrl?: string;
} & ProjectContent;

const projects = [
  {
    slug: "distributed-mobile-cross-play-ecosystem",
    year: "2026",
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
        "Transformation d'une architecture monolithique web en un système distribué multi-clients avec synchronisation temps réel entre client desktop et application mobile.",
      overview:
        "Le projet a converti une plateforme web existante vers une expérience multiplateforme commercialisable en orchestrant la synchronisation entre un client desktop lourd et un client mobile léger, tout en traitant la dette technique legacy.",
      challenge:
        "Le principal défi était de transposer une UX desktop vers mobile sans régression, tout en respectant un cahier des charges SRS strict et des contraintes de maintenance logicielle.",
      approach:
        "J'ai contribué à l'architecture distribuée sur AWS avec Socket.io, à la transposition UX mobile en Dart/Flutter avec capteurs natifs, au pilotage des exigences SRS, et à l'intégration de nouvelles fonctionnalités dans le code legacy avec contrôle de non-régression.",
      outcome:
        "Livraison finale prévue en mai 2026; la structure actuelle supporte déjà une synchronisation cross-play fiable et un cadre d'évolution maintenable.",
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
    githubUrl: "https://github.com/wesamd0/tactical-rpg-web",
    deployedUrl: "http://polytechnique-montr-al.gitlab.io/log2990/20251/equipe-312/log2990-312/#/home",
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
        "Conception d'une application full stack Angular/Node.js avec synchronisation temps réel WebSockets et pipeline de déploiement continu.",
      overview:
        "Le projet visait à livrer un jeu tactique robuste en production, avec une architecture distribuée complète, du front Angular jusqu'à la persistance MongoDB, dans un cadre Agile Scrum.",
      challenge:
        "Le défi était d'orchestrer en même temps la concurrence multijoueur en temps réel, la qualité logicielle via tests et revues de code, et un déploiement CI/CD fiable vers AWS.",
      approach:
        "J'ai participé transversalement à l'implémentation des fonctionnalités front/back, à la rédaction de tests unitaires (Jest/Mocha/Chai), aux revues de code, et à la configuration CI/CD avec contributions aux décisions d'architecture (UML, API REST).",
      outcome:
        "Application déployée sur AWS via pipeline CI/CD automatisé, avec gestion stable de la concurrence multijoueur et préservation de l'intégrité des historiques de parties.",
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
    githubUrl: "https://github.com/wesamd0/avr-autonomous-robot",
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
        "Conception d'un système de navigation autonome capable de cartographier et traverser un parcours d'obstacles en temps réel.",
      overview:
        "Le projet reposait sur la coordination de deux robots: un robot explorateur cartographiait le parcours puis transmettait les données via infrarouge à un robot récepteur chargé de s'orienter et sortir de sa zone.",
      challenge:
        "Le défi était de garder un comportement déterministe avec communication IR, contraintes capteurs et interruptions, tout en assurant une intégration fiable de bout en bout le jour de la démonstration.",
      approach:
        "J'ai pris la responsabilité complète du robot récepteur: machine à états en C (Attente, Réception, Centrage, Sortie), algorithmes de correction de trajectoire, intégration capteurs et support technique sur le robot suiveur de ligne pour garantir la chaîne complète.",
      outcome:
        "Le robot a exécuté le scénario de sortie de manière autonome, sans intervention humaine, sans déviation de ligne et dans les temps impartis, validant la robustesse de la logique embarquée.",
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
  {
    slug: "portfolio-ai",
    year: "2026",
    githubUrl: "https://github.com/wesamd0/portfolio-ai",
    en: {
      title: "AI-Enhanced Portfolio & Personal Brand",
      category: "Full Stack / AI / Personal Brand",
      summary:
        "Modern bilingual portfolio with an AI-powered assistant, fluid animations, and real-time project exploration.",
      overview:
        "Development of a modern, bilingual personal portfolio site featuring an AI-powered project assistant. The application integrates real-time language switching, smooth animations, and an interactive chat interface powered by large language models for dynamic project exploration.",
      challenge:
        "Build a high-performance, accessible portfolio that showcases technical work while maintaining a sophisticated visual experience across devices.",
      approach:
        "Built responsive React components with Framer Motion, implemented URL-persistent bilingual state management, integrated GROQ with RAG-enhanced prompts, and deployed on Vercel with Next.js performance optimizations.",
      outcome:
        "Successfully deployed a modern and performant portfolio that combines bilingual support, interactive AI capabilities, and polished motion while staying accessible.",
      stack: [
        "Next.js",
        "TypeScript",
        "React",
        "Framer Motion",
        "Tailwind CSS",
        "GROQ API",
        "RAG",
        "Vercel",
      ],
      details: {
        description:
          "Development of a modern, bilingual personal portfolio site featuring an AI-powered project assistant. The application integrates real-time language switching, smooth animations, and an interactive chat interface powered by large language models for dynamic project exploration.",
        challengeTitle: "The Technical Challenge",
        challengeDescription:
          "Build a high-performance, accessible portfolio that showcases technical work while maintaining a sophisticated visual experience. The challenge involved managing state across language contexts, optimizing animations without compromising responsiveness, integrating AI capabilities responsibly, and ensuring the site performed flawlessly on all device sizes from mobile to desktop.",
        contributionTitle: "Full Contribution",
        contributionDescription:
          "Single-person full-stack development encompassing:",
        roles: [
          "Frontend Architecture: Built responsive React components with Framer Motion for smooth locale transitions and hero animations",
          "State Management: Implemented bilingual context switching with URL search parameter persistence",
          "AI Integration: Configured GROQ API with RAG-enhanced prompts for contextual project discussions",
          "Performance & Deployment: Deployed on Vercel with Next.js optimizations (image optimization, automatic code splitting, edge caching)",
        ],
        featuresTitle: "Features & Results",
        features: [
          "Bilingual site with seamless language switching (EN/FR)",
          "AI-powered project assistant using RAG for contextual answers",
          "Smooth animations and transitions across all interactions",
          "Fully responsive mobile-first design",
          "Lighthouse performance score: 95+ on mobile, 98+ on desktop",
          "Real-time chat interface with streaming responses",
        ],
        resultTitle: "Result",
        resultDescription:
          "Successfully deployed a modern, performant portfolio that seamlessly combines bilingual support, interactive AI capabilities, and sophisticated animations. The site demonstrates expertise in full-stack development while remaining accessible and performant across all platforms.",
        galleryTitle: "Project Gallery",
        galleryCaption: "Live portfolio with AI assistant and bilingual support",
        deploymentTitle: "Deployment",
        githubLinkLabel: "View GitHub Repository",
        deployedLinkLabel: "View Live Portfolio",
      },
    },
    fr: {
      title: "Portfolio Ameliore par l'IA & Marque Personnelle",
      category: "Full Stack / IA / Marque Personnelle",
      summary:
        "Portfolio personnel bilingue moderne avec assistant IA, animations fluides et exploration dynamique des projets.",
      overview:
        "Conception d'un site portfolio personnel moderne et bilingue intégrant un assistant IA pour explorer les projets. L'application combine un changement de langue en temps réel, des animations fluides via Framer Motion, et une interface de chat interactive alimentée par des modèles de langage pour une exploration dynamique des projets.",
      challenge:
        "Construire un portfolio haute performance et accessible qui mette en avant les travaux techniques tout en maintenant une expérience visuelle sophistiquée.",
      approach:
        "Développement de composants React réactifs, gestion d'état bilingue avec persistance URL, intégration GROQ avec prompts RAG contextuels, et déploiement Vercel optimisé via Next.js.",
      outcome:
        "Portfolio moderne et performant déployé avec succès, combinant support bilingue, capacités IA interactives et animations sophistiquées.",
      stack: [
        "Next.js",
        "TypeScript",
        "React",
        "Framer Motion",
        "Tailwind CSS",
        "GROQ API",
        "RAG",
        "Vercel",
      ],
      details: {
        description:
          "Conception d'un site portfolio personnel moderne et bilingue intégrant un assistant IA pour explorer les projets. L'application combine un changement de langue en temps réel, des animations fluides via Framer Motion, et une interface de chat interactive alimentée par des modèles de langage pour une exploration dynamique des projets.",
        challengeTitle: "Le Defi Technique",
        challengeDescription:
          "Construire un portfolio haute performance et accessible qui mette en avant les travaux techniques tout en maintenant une expérience visuelle sophistiquée. Le défi consistait à gérer l'état entre les contextes linguistiques, optimiser les animations sans compromettre la réactivité, intégrer les capacités IA de manière responsable, et assurer que le site fonctionne parfaitement sur tous les appareils.",
        contributionTitle: "Contribution Complete",
        contributionDescription:
          "Développement full-stack complet par une seule personne incluant :",
        roles: [
          "Architecture Frontend : Composants React réactifs avec Framer Motion pour des transitions linguistiques fluides et animations hero",
          "Gestion d'Etat : Commutation contextuelle bilingue avec persistance des paramètres URL",
          "Intégration IA : Configuration de l'API GROQ avec prompts enrichis RAG pour discussions contextuelles sur les projets",
          "Performance & Deploiement : Déploiement sur Vercel avec optimisations Next.js (optimisation d'images, découpage automatique du code, cache edge)",
        ],
        featuresTitle: "Fonctionnalites & Resultats",
        features: [
          "Site bilingue avec changement de langue sans interruption (EN/FR)",
          "Assistant IA alimenté par RAG pour des réponses contextuelles",
          "Animations lisses et transitions fluides dans toutes les interactions",
          "Design mobile-first entièrement réactif",
          "Score de performance Lighthouse : 95+ sur mobile, 98+ sur desktop",
          "Interface de chat en temps réel avec réponses en streaming",
        ],
        resultTitle: "Resultat",
        resultDescription:
          "Portfolio moderne et performant déployé avec succès, combinant le support bilingue, les capacités IA interactives et les animations sophistiquées. Le site démontre l'expertise en développement full-stack tout en restant accessible et performant sur toutes les plateformes.",
        galleryTitle: "Images Illustratives du Projet",
        galleryCaption: "Portfolio en direct avec assistant IA et support bilingue",
        deploymentTitle: "Deploiement",
        githubLinkLabel: "Voir le Depot GitHub",
        deployedLinkLabel: "Voir le Portfolio en Direct",
      },
    },
  },
  {
    slug: "portfolio-classic",
    year: "2024",
    githubUrl: "https://github.com/wesamd0/portfolio-v1",
    deployedUrl: "https://v1.wesamdawod.com",
    en: {
      title: "Classic Angular Portfolio",
      category: "Frontend / Angular / Multi-Route",
      summary:
        "Structured Angular portfolio with dedicated routes for projects, skills, and professional experience.",
      overview:
        "Development of a structured, multi-route personal portfolio built with Angular. This comprehensive application provides a clean interface for recruiters to explore dedicated pages for software engineering projects, technical skills, and professional experience.",
      challenge:
        "Designing a scalable and maintainable frontend architecture using Angular's component-driven model with dynamic routing and strong responsiveness.",
      approach:
        "Built reusable SCSS-based components, implemented Angular Router for dedicated project pages, structured project data with TypeScript services, and applied a mobile-first layout strategy.",
      outcome:
        "Delivered a robust traditional portfolio that highlights strong frontend architecture fundamentals in an enterprise-ready framework.",
      stack: [
        "Angular",
        "TypeScript",
        "SCSS",
        "Angular Router",
      ],
      details: {
        description:
          "Development of a structured, multi-route personal portfolio built with Angular. This comprehensive application provides a clean, intuitive interface for recruiters to explore dedicated pages for complex software engineering projects, technical skills, and professional experience.",
        challengeTitle: "The Technical Challenge",
        challengeDescription:
          "Designing a scalable and maintainable frontend architecture using Angular's component-driven model. The challenge involved implementing efficient dynamic routing to handle dedicated project pages, managing static assets, ensuring a fully responsive layout across all devices, and creating an easily scannable UI/UX optimized for professional evaluation.",
        contributionTitle: "Full Contribution",
        contributionDescription:
          "End-to-end frontend development encompassing:",
        roles: [
          "Architecture & Routing: Designed a dynamic routing system utilizing Angular Router for seamless navigation between the main dashboard, contact sections, and dedicated individual project pages",
          "Component Design: Built reusable, encapsulated UI components with SCSS for a cohesive and professional aesthetic",
          "Data Management: Structured complex project data using TypeScript interfaces and Angular services to populate individual project views dynamically",
          "Responsive UI: Implemented a mobile-first approach ensuring perfect readability on desktop, tablet, and mobile screens",
        ],
        featuresTitle: "Features & Results",
        features: [
          "Dynamic multi-route architecture with dedicated pages for each project",
          "Fast, client-side rendering and state management powered by Angular",
          "Clean, recruiter-friendly UI/UX for rapid scanning of information",
          "Fully responsive mobile-first design",
          "Type-safe data handling and strict structural integrity with TypeScript",
          "Direct integration of downloadable resources (CV) and professional links",
        ],
        resultTitle: "Result",
        resultDescription:
          "Successfully delivered a robust, traditional portfolio that highlights strong fundamentals in an enterprise-grade framework. The multi-page architecture serves as a reliable, fast-loading professional anchor that thoroughly details engineering experience.",
        galleryTitle: "Project Gallery",
        galleryCaption: "Classic Angular Portfolio (v1)",
        deploymentTitle: "Deployment",
        githubLinkLabel: "View GitHub Repository",
        deployedLinkLabel: "View Classic Portfolio",
      },
    },
    fr: {
      title: "Portfolio Classique Angular",
      category: "Frontend / Angular / Multi-routes",
      summary:
        "Portfolio personnel Angular structuré avec pages dédiées pour projets, compétences et expérience.",
      overview:
        "Développement d'un portfolio personnel structuré et multi-routes avec Angular. Cette application complète offre une interface épurée et intuitive pour permettre aux recruteurs d'explorer facilement des pages dédiées à chaque projet complexe en génie logiciel, ainsi que les compétences techniques et l'expérience professionnelle.",
      challenge:
        "Concevoir une architecture frontend évolutive et maintenable en utilisant le modèle orienté composants d'Angular.",
      approach:
        "Mise en place d'un routage dynamique Angular Router, création de composants SCSS réutilisables, structuration des données via TypeScript et services Angular, et approche mobile-first.",
      outcome:
        "Livraison réussie d'un portfolio robuste qui met en évidence de solides bases d'architecture multi-pages dans un framework d'envergure.",
      stack: ["Angular", "TypeScript", "SCSS", "Angular Router"],
      details: {
        description:
          "Développement d'un portfolio personnel structuré et multi-routes avec Angular. Cette application complète offre une interface épurée et intuitive pour permettre aux recruteurs d'explorer facilement des pages dédiées à chaque projet complexe en génie logiciel, ainsi que les compétences techniques et l'expérience professionnelle.",
        challengeTitle: "Le Defi Technique",
        challengeDescription:
          "Concevoir une architecture frontend évolutive et maintenable en utilisant le modèle orienté composants d'Angular. Le défi consistait à implémenter un routage dynamique efficace pour gérer les pages dédiées aux projets, à assurer une mise en page entièrement réactive et à créer une UI/UX facilement lisible et optimisée pour l'évaluation.",
        contributionTitle: "Contribution Complete",
        contributionDescription:
          "Développement frontend de bout en bout incluant :",
        roles: [
          "Architecture & Routage : Conception d'un système de routage dynamique utilisant Angular Router pour une navigation fluide entre l'accueil, les sections de contact et les vues individuelles des projets",
          "Design de Composants : Création de composants UI réutilisables et encapsulés avec SCSS pour une esthétique cohérente et professionnelle",
          "Gestion des Donnees : Structuration des données de projets via des interfaces TypeScript et des services Angular pour peupler dynamiquement chaque page de projet",
          "UI Reactive : Approche mobile-first garantissant une lisibilité parfaite sur ordinateur, tablette et mobile",
        ],
        featuresTitle: "Fonctionnalites & Resultats",
        features: [
          "Architecture multi-routes dynamique avec des pages dédiées pour chaque réalisation",
          "Rendu côté client rapide et optimisé grâce à la puissance d'Angular",
          "UI/UX épurée, optimisée pour l'exploration détaillée par les recruteurs",
          "Design mobile-first entièrement réactif",
          "Typage fort et intégrité structurelle stricte assurés par TypeScript",
          "Intégration directe de ressources téléchargeables (CV) et de liens professionnels",
        ],
        resultTitle: "Resultat",
        resultDescription:
          "Livraison réussie d'un portfolio robuste qui met en évidence de solides bases d'architecture multi-pages dans un framework d'envergure. L'application sert de point d'ancrage professionnel fiable, détaillant en profondeur l'expérience en ingénierie.",
        galleryTitle: "Images Illustratives du Projet",
        galleryCaption: "Portfolio classique Angular (v1)",
        deploymentTitle: "Deploiement",
        githubLinkLabel: "Voir le Depot GitHub",
        deployedLinkLabel: "Voir le Portfolio Classique",
      },
    },
  },
] as const satisfies readonly ProjectSource[];

export type ProjectSlug = (typeof projects)[number]["slug"];

function toLocalizedProject(source: ProjectSource, locale: Locale): Project {
  const content = source[locale];

  return {
    slug: source.slug,
    year: source.year,
    githubUrl: source.githubUrl,
    deployedUrl: source.deployedUrl,
    ...content,
  };
}

export function getProjects(locale: Locale = "en") {
  const homeOrder: Record<ProjectSlug, number> = {
    "portfolio-ai": 0,
    "distributed-mobile-cross-play-ecosystem": 1,
    "portfolio-classic": 2,
    "multiplayer-tactical-rpg": 3,
    "autonomous-navigation-robot": 4,
  };

  return projects
    .slice()
    .sort((a, b) => homeOrder[a.slug] - homeOrder[b.slug])
    .map((project) => toLocalizedProject(project, locale));
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
