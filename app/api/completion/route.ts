import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const resumeContext = `
Wesam Dawod
Location: Laval, Quebec, Canada
LinkedIn: https://www.linkedin.com/in/wesam-dawod
GitHub: https://github.com/wesamd0
Portfolio: https://wesamdawod.com
Email: contact@wesamdawod.com
Phone: [redacted phone]

EDUCATION
- Full-time Software Engineering student, Polytechnique Montreal, 08/2023-05/2027
- Diploma in Pure and Applied Sciences (DEC), College Montmorency, 08/2021-Winter 2023

EXPERIENCE
- La Cage Place Bell, Cook, 02/2022-06/2025
  - Managed time and priorities in a fast-paced kitchen while helping deliver 100+ orders per hour.
  - Coordinated closely with the kitchen team to maintain quality and consistency under pressure.
- AGT Clic Foods Inc., Packer, 06/2020-08/2020 and 06/2021-08/2021
  - Worked collaboratively with the production team and communicated priorities to meet quotas.

PROJECTS
- Distributed real-time desktop and mobile system, Polytechnique Montreal, 01/2026-05/2026
  - Architected a real-time distributed solution on AWS using Socket.io.
  - Built a Flutter mobile app with native sensors and reactive state management.
  - Implemented a Node.js backend handling persistence and application logic.
  - Led requirements engineering and budget tracking for an approximately 1000-hour project.
- Interactive portfolio website, personal project, 11/2025-02/2026
  - Designed a responsive interface using HTML5, SCSS, and Tailwind CSS.
  - Set up CI/CD and hosting with AWS Amplify and optimized media delivery.
- Tactical role-playing web platform, Polytechnique Montreal, 01/2025-05/2025
  - Built an Angular front end and a Node.js, WebSocket, and NoSQL backend.
  - Created a CI/CD pipeline with GitLab Pages and AWS EC2.
  - Used Jasmine, Mocha, and Chai for testing and collaborated in an Agile Scrum team.
  - Implemented real-time shared state with Socket.io.
- Autonomous robot project, Polytechnique Montreal, 01/2024-05/2024
  - Developed an embedded system around an AVR microcontroller.
  - Programmed timers and interrupts in C/C++ on Linux with AVR LibC.
  - Integrated distance, infrared, and line sensors for autonomous navigation.

SKILLS
- Languages: Python, C/C++, Java, HTML/CSS, TypeScript, JavaScript, SQL, Dart
- Frameworks and libraries: Angular, React, Flutter, Node.js, Socket.io
- Engineering: distributed systems, embedded real-time systems, object-oriented programming, UML, Agile Scrum, CI/CD, unit testing, integration testing, software requirements
- Databases and tools: SQL, NoSQL, MongoDB, MySQL, Docker, AWS, Git, GitHub, GitLab, Visual Studio Code, Visual Studio, JetBrains tools, Figma
- Platforms: iOS, Android, Linux, macOS, Windows

LANGUAGES
- French: fluent
- English: professional proficiency
- Arabic: native language
`;

const systemPrompt = `
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

Profile:
${resumeContext}
`;

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
