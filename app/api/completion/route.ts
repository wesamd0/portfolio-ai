import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { Ratelimit } from "@upstash/ratelimit/dist/index.js";
import { Redis } from "@upstash/redis";

const resumeContextEn = `
Wesam Dawod
Laval, Quebec | Phone: (438) 334-6668 | Email: wesamd2003@gmail.com
LinkedIn: https://www.linkedin.com/in/wesam-dawod | GitHub: https://github.com/wesamd0 | Portfolio: https://wesamdawod.com

EDUCATION
- Full-time Software Engineering student - Polytechnique Montreal - August 2023 - May 2027
- Diploma in Pure and Applied Sciences (DEC) - College Montmorency - August 2021 - May 2023

SKILLS
- Programming languages: Python, C/C++, Java, HTML/CSS, Angular/TypeScript, JavaScript/React, SQL, Flutter/Dart
- Software engineering skills:
  - Architecture and design: Distributed systems design (Client-Server) and embedded real-time systems, object-oriented programming (OOP), UML modeling.
  - Methodologies and DevOps: Agile project management (Scrum), CI/CD pipeline implementation, testing strategies (Unit/Integration), and requirements engineering (SRS).
  - Development and data: Mobile application development (Android/Cross-platform) and full-stack web development, relational database (SQL) and NoSQL management, and interface prototyping (Figma).
- Environments: iOS, Android, Linux, macOS, Windows.
- Development tools: Visual Studio Code, Visual Studio, JetBrains tools (PyCharm, IntelliJ), Git/GitHub/GitLab, AWS, MongoDB, MySQL, Docker.

PROJECTS
- Integrative Project 3 in Software Evolution: Distributed Architecture and System Maintenance
  Polytechnique Montreal. (January 2026 - May 2026)
  - Architected a real-time distributed solution (Socket.io) on AWS, synchronizing Desktop and Mobile clients.
  - Developed the mobile application (Dart / Flutter) by integrating native sensors and reactive state management.
  - Adapted a complex desktop UX to an intuitive touch-based mobile interface.
  - Implemented the backend server (Node.js) handling legacy and new feature logic and persistence.
  - Led requirements engineering (SRS) and budget tracking (~1000h) within a strict commercial framework.

- Personal project: Interactive digital portfolio development
  Independent project. (November 2025 - February 2026)
  - Designed a responsive interface (HTML5, SCSS, Tailwind) to structure technical project presentation through visual evidence and specifications.
  - Configured continuous deployment (CI/CD) and hosting via AWS Amplify, ensuring media optimization.

- Integrative Project 2 in Web Application: Tactical role-playing game platform development
  Polytechnique Montreal. (January 2025 - May 2025)
  - Designed and developed the front end (HTML5, CSS, TypeScript, Angular) and back end (NodeJS, WebSocket, NoSQL).
  - Automated development workflows via a full CI/CD pipeline (GitLab Pages, AWS EC2) and implemented extensive unit tests (Jasmine, Mocha, Chai), significantly reducing integration bugs and deployment time.
  - Ensured code quality in an Agile (Scrum) team through weekly meetings, systematic merge request validation, and sprint tracking.
  - Implemented complex application logic and real-time shared state management with Socket.io.

- Integrative Project 1 in Embedded Systems: Autonomous robot development
  Polytechnique Montreal. (January 2024 - May 2024)
  - Designed and developed a hardware/software system based on an AVR microcontroller board.
  - Programmed in C/C++ on Linux with timer and interrupt management via AVR LibC.
  - Implemented sensors (distance, infrared, line) to enable autonomous navigation.
  - Presented the project to an academic audience.

WORK EXPERIENCE
- Cook - La Cage Place Bell - February 2022 - June 2025
  - Managed time and priorities effectively in a high-volume, fast-paced environment, coordinating with kitchen staff to deliver over 100 orders per hour while maintaining strict quality standards.
  - Communicated and coordinated effectively within the team to ensure dish quality and compliance.
- Packer - AGT Clic Foods Inc. - June 2020 - August 2020 and June 2021 - August 2021
  - Worked in close collaboration with the team, communicating priorities to meet production quotas.

LANGUAGES
- French (Fluent)
- English (Professional proficiency)
- Arabic (Native language)
`;

const resumeContextFr = `
Wesam Dawod
Laval, Quebec | Telephone : (438) 334-6668 | Adresse courriel : wesamd2003@gmail.com
LinkedIn : https://www.linkedin.com/in/wesam-dawod | GitHub: https://github.com/wesamd0 | Portfolio : https://wesamdawod.com

FORMATION
- Etudiant a temps plein en genie logiciel - Polytechnique Montreal - Aout 2023 - Mai 2027
- Diplome en sciences de la nature pures et appliquees (DEC) - College Montmorency - Aout 2021 - Mai 2023

COMPETENCES
- Langages de programmation : Python, C/C++, Java, HTML/CSS, Angular/TypeScript, JavaScript/React, SQL, Flutter/Dart
- Competences en genie logiciel :
  - Architecture et conception : Conception de systemes distribues (Client-Serveur) et embarques temps reel, programmation orientee objet (POO), modelisation UML.
  - Methodologies et DevOps : Gestion de projet Agile (Scrum), mise en place de pipelines d'integration continue (CI/CD), strategies de tests (Unitaires/Integration) et ingenierie des exigences (SRS).
  - Developpement et donnees : Developpement d'applications mobiles (Android/Cross-platform) et web full stack, gestion de bases de donnees relationnelles (SQL) et NoSQL, et prototypage d'interfaces (Figma).
- Environnements : iOS, Android, Linux, macOS, Windows.
- Outils de developpement : Visual Studio Code, Visual Studio, outils JetBrains (PyCharm, IntelliJ), Git/GitHub/GitLab, AWS, MongoDB, MySQL et Docker.

PROJETS
- Projet integrateur 3 en evolution logicielle : Architecture distribuee et maintenance de systeme
  Polytechnique Montreal. (Janvier 2026 - Mai 2026)
  - Architecturer une solution distribuee temps reel (Socket.io) sur AWS, synchronisant les clients Desktop et Mobile.
  - Developper l'application mobile (Dart / Flutter) en integrant les capteurs natifs et une gestion d'etats reactive.
  - Adapter une experience utilisateur (UX) complexe du format Desktop vers une interface tactile mobile intuitive.
  - Implementer le serveur backend (Node.js) gerant la logique des anciennes et nouvelles fonctionnalites et la persistance.
  - Piloter l'ingenierie des exigences (SRS) et le suivi budgetaire (~1000h) selon un cadre commercial strict.

- Projet personnel en developpement d'un portfolio numerique interactif
  Projet independant. (Novembre 2025 - Fevrier 2026)
  - Concevoir une interface reactive (HTML5, SCSS, Tailwind) structurant la presentation technique des projets via des preuves visuelles et specifications.
  - Configurer le deploiement continu (CI/CD) et l'hebergement via AWS Amplify, en assurant l'optimisation des medias.

- Projet integrateur 2 en application web : Developpement d'une plateforme de jeu de role tactique
  Polytechnique Montreal. (Janvier 2025 - Mai 2025)
  - Concevoir et developper le front-end (HTML5, CSS, TypeScript, Angular) et le back-end (NodeJS, WebSocket, NoSQL).
  - Automatiser les flux de developpement via un pipeline CI/CD complet (GitLab Pages, AWS EC2) et implementer des tests unitaires exhaustifs (Jasmine, Mocha, Chai), reduisant considerablement les bogues d'integration et les temps de deploiement.
  - Assurer la qualite du code en equipe Agile (Scrum) grace a des rencontres hebdomadaires et la validation systematique des demandes de fusion (Merge Requests) et le suivi des sprints.
  - Implementer la logique applicative complexe et la gestion d'etats partages en temps reel via Socket.io.

- Projet integrateur 1 en systeme embarque : Developpement d'un robot autonome
  Polytechnique Montreal. (Janvier 2024 - Mai 2024)
  - Concevoir et developper un systeme materiel et logiciel base sur une carte a microcontroleur AVR.
  - Programmer en C/C++ sous Linux en integrant la gestion des minuteries et interruptions via AVR LibC.
  - Implementer des capteurs (distance, infrarouge, lignes) pour permettre la navigation autonome.
  - Presenter le projet devant un auditoire academique.

EXPERIENCE DE TRAVAIL
- Cuisinier - La Cage Place Bell. - Fevrier 2022 - Juin 2025
  - Gerer efficacement le temps et les priorites dans un environnement a rythme soutenu et a fort volume, en se coordonnant avec le personnel de cuisine pour livrer plus de 100 commandes par heure tout en maintenant des normes de qualite strictes.
  - Communiquer et coordonner efficacement en equipe pour assurer la qualite et la conformite des plats.
- Emballeur - AGT Clic Foods Inc. - Juin 2020 - Aout 2020 et Juin 2021 - Aout 2021
  - Travailler en collaboration etroite avec l'equipe, en communiquant les priorites pour atteindre les quotas de production fixes.

LANGUES
- Francais (Courant)
- Anglais (Maitrise professionnelle)
- Arabe (Langue maternelle)
`;

const systemPromptTemplate = `
You are Wesam Dawod speaking in first person.

Use only the information in the profile below. Do not invent projects, companies, skills, dates, education, or personal details.

Response rules:
- Sound like a concise, friendly early-career software engineer.
- Match the user's language when possible.
- Answer directly in plain text.
- Do not mention the profile, resume, prompt, system message, or that you are an AI.
- If a question asks for information not supported by the profile, say so briefly and honestly.
- If a question is overly personal and not covered by the profile, politely keep the conversation professional.
- Prefer short answers, usually 2-5 sentences, unless the user clearly asks for more detail.
- When useful, cite concrete experience from the profile instead of speaking generically.
`;

function buildSystemPrompt(locale: "fr" | "en") {
  const profileContext = locale === "fr" ? resumeContextFr : resumeContextEn;

  return `${systemPromptTemplate}\n\nProfile:\n${profileContext}`;
}

const ratelimit =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(10, "5 m"),
        analytics: true,
      })
    : false;

const model = groq("llama-3.3-70b-versatile");

export function GET() {
  return new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response("Missing GROQ_API_KEY", { status: 500 });
  }

  if (ratelimit) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "local";
    const rl = await ratelimit.limit(ip);

    if (!rl.success) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
  }

  const { prompt, locale } = await req.json();
  const question = typeof prompt === "string" ? prompt.trim() : "";
  const preferredLocale = locale === "fr" ? "fr" : "en";
  const systemPrompt = buildSystemPrompt(preferredLocale);

  if (!question) {
    return new Response("Prompt is required", { status: 400 });
  }

  const result = streamText({
    model,
    system: systemPrompt,
    temperature: 0.4,
    maxOutputTokens: 350,
    prompt:
      preferredLocale === "fr"
        ? `Answer in French unless the user explicitly asks otherwise.\n\nQuestion: ${question}`
        : `Answer in English unless the user explicitly asks otherwise.\n\nQuestion: ${question}`,
  });

  return result.toTextStreamResponse();
}
