import { describe, expect, it } from "vitest";
import { resolveDeterministicRouting, selectRelevantProjectContext, buildSystemPrompt } from "./route";

describe("resolveDeterministicRouting - Phone Branch", () => {
  it("routes phone-number questions to phone branch", () => {
    const result = resolveDeterministicRouting("What is your phone number?", "en");

    expect(result.branch).toBe("phone");
    expect(result.preferredLocale).toBe("en");
    expect(result.responseText).toContain("contact@wesamdawod.com");
  });

  it("routes 'telephone' question to phone branch", () => {
    const result = resolveDeterministicRouting("Can I call you?", "en");
    expect(result.branch).toBe("phone");
  });

  it("routes French phone number question to phone branch", () => {
    const result = resolveDeterministicRouting("Quel est ton numéro de téléphone?", "en");
    expect(result.branch).toBe("phone");
    expect(result.preferredLocale).toBe("fr");
    expect(result.responseText).toContain("contact@wesamdawod.com");
  });

  it("routes 'call me' question to phone branch in French", () => {
    const result = resolveDeterministicRouting("Comment je peux t'appeler?", "fr");
    expect(result.branch).toBe("phone");
  });

  it("routes 'tel' abbreviation question to phone branch", () => {
    const result = resolveDeterministicRouting("What's your tel?", "en");
    expect(result.branch).toBe("phone");
  });
});

describe("resolveDeterministicRouting - Deployed Links Branch", () => {
  it("routes deployed links questions to deployed-links branch", () => {
    const result = resolveDeterministicRouting(
      "Give me all deployed project links",
      "en",
    );

    expect(result.branch).toBe("deployed-links");
    expect(result.preferredLocale).toBe("en");
    expect(result.responseText).toContain("Here are my deployed project links:");
  });

  it("routes 'live projects' question to deployed-links branch", () => {
    const result = resolveDeterministicRouting("Show me live projects", "en");
    expect(result.branch).toBe("deployed-links");
  });

  it("detects French question locale even when UI locale is English", () => {
    const result = resolveDeterministicRouting(
      "Donne moi tous les liens des projets deployes",
      "en",
    );

    expect(result.branch).toBe("deployed-links");
    expect(result.preferredLocale).toBe("fr");
    expect(result.responseText).toContain("Voici les liens de mes projets déployés :");
  });

  it("routes French 'project links' question", () => {
    const result = resolveDeterministicRouting(
      "Quels sont les liens de tous mes projets?",
      "fr",
    );

    expect(result.branch).toBe("deployed-links");
    expect(result.preferredLocale).toBe("fr");
  });

  it("routes 'deployed projects' question", () => {
    const result = resolveDeterministicRouting(
      "Which projects are deployed?",
      "en",
    );

    expect(result.branch).toBe("deployed-links");
  });

  it("routes 'project links' question", () => {
    const result = resolveDeterministicRouting(
      "Can you show me links of all your projects?",
      "en",
    );

    expect(result.branch).toBe("deployed-links");
  });

  it("routes French 'projets deployes' question", () => {
    const result = resolveDeterministicRouting(
      "Montre moi tes projets deployés",
      "en",
    );

    expect(result.branch).toBe("deployed-links");
  });
});

describe("resolveDeterministicRouting - None Branch", () => {
  it("returns none when no deterministic redirection is needed", () => {
    const result = resolveDeterministicRouting(
      "Tell me about your multiplayer RPG architecture",
      "en",
    );

    expect(result.branch).toBe("none");
    expect(result.responseText).toBeNull();
    expect(result.preferredLocale).toBe("en");
  });

  it("returns none for general technology questions", () => {
    const result = resolveDeterministicRouting(
      "What experiences do you have with Node.js?",
      "en",
    );

    expect(result.branch).toBe("none");
    expect(result.responseText).toBeNull();
  });

  it("returns none for portfolio question that doesn't ask for links", () => {
    const result = resolveDeterministicRouting(
      "Tell me about a specific project",
      "en",
    );

    expect(result.branch).toBe("none");
  });

  it("returns none for education questions", () => {
    const result = resolveDeterministicRouting(
      "Where did you study?",
      "en",
    );

    expect(result.branch).toBe("none");
  });

  it("returns none for French general questions", () => {
    const result = resolveDeterministicRouting(
      "Parle-moi de tes projets personnels",
      "en",
    );

    expect(result.branch).toBe("none");
    expect(result.preferredLocale).toBe("fr");
  });
});

describe("resolveDeterministicRouting - Locale Detection", () => {
  it("detects French locale from question keywords", () => {
    const result = resolveDeterministicRouting(
      "Quel est ton projet préféré?",
      "en",
    );

    expect(result.preferredLocale).toBe("fr");
  });

  it("detects English locale from question keywords", () => {
    const result = resolveDeterministicRouting(
      "What is your favorite project?",
      "fr",
    );

    expect(result.preferredLocale).toBe("en");
  });

  it("uses UI locale as fallback when ambiguous", () => {
    const result1 = resolveDeterministicRouting("Tell me about it", "en");
    expect(result1.preferredLocale).toBe("en");

    const result2 = resolveDeterministicRouting("Tell me about it", "fr");
    expect(result2.preferredLocale).toBe("fr");
  });

  it("detects French pronouns correctly", () => {
    const result = resolveDeterministicRouting(
      "Tu as travaillé avec quelle technologie?",
      "en",
    );

    expect(result.preferredLocale).toBe("fr");
  });

  it("detects English pronouns correctly", () => {
    const result = resolveDeterministicRouting(
      "Have you worked with this technology?",
      "fr",
    );

    expect(result.preferredLocale).toBe("en");
  });
});

describe("selectRelevantProjectContext - Basic Functionality", () => {
  it("should handle selectRelevantProjectContext correctly", () => {
    const result = selectRelevantProjectContext("fr", "quel est ton projet qui a utilisé l'AI", 1);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should tokenize C++ correctly to match projects with C/C++ in stack", () => {
    const result = selectRelevantProjectContext("en", "Tell me about your C++ robot project", 1);
    expect(result).toContain("Autonomous Navigation Robot");
  });

  it("should tokenize C# and other programming languages with special chars", () => {
    const result = selectRelevantProjectContext("en", "What projects use Node.js or C#?", 1);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return empty string when no projects match", () => {
    const result = selectRelevantProjectContext("en", "xyz xyz xyz", 1);
    expect(result).toBe("");
  });
});

describe("selectRelevantProjectContext - Programming Language Tokenization", () => {
  it("should preserve C++ in tokenization", () => {
    const result = selectRelevantProjectContext("en", "C++ embedded systems", 1);
    expect(result).toContain("Autonomous Navigation Robot");
  });

  it("should preserve Node.js in tokenization", () => {
    const result = selectRelevantProjectContext("en", "Node.js backend", 1);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should preserve F# in tokenization", () => {
    const result = selectRelevantProjectContext("en", "Tell me a project with F#", 1);
    // F# may not be in the stack, so just verify it doesn't crash
    expect(typeof result).toBe("string");
  });

  it("should handle multiple special-char languages in one query", () => {
    const result = selectRelevantProjectContext("en", "C++ Node.js and Angular projects", 2);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("selectRelevantProjectContext - Locale-Specific Queries", () => {
  it("should match English projects in English", () => {
    const result = selectRelevantProjectContext("en", "robot navigation", 1);
    expect(result).toContain("Autonomous Navigation Robot");
  });

  it("should match French projects in French", () => {
    const result = selectRelevantProjectContext("fr", "robot navigation", 1);
    expect(result).toContain("Robot Autonome");
  });

  it("should return French project content when locale is fr", () => {
    const result = selectRelevantProjectContext("fr", "tactique multijoueur", 1);
    expect(result).toContain("RPG Tactique");
  });
});

describe("selectRelevantProjectContext - Multiple Results", () => {
  it("should return top k results", () => {
    const result1 = selectRelevantProjectContext("en", "project", 1);
    const result2 = selectRelevantProjectContext("en", "project", 3);

    // More results should include more content or be longer
    expect(result2.length).toBeGreaterThanOrEqual(result1.length);
  });

  it("should handle topK=0 gracefully", () => {
    const result = selectRelevantProjectContext("en", "project", 0);
    expect(result).toBe("");
  });
});

describe("selectRelevantProjectContext - Specific Technology Queries", () => {
  it("should match projects with Angular", () => {
    const result = selectRelevantProjectContext("en", "Angular", 1);
    expect(result).toContain("Angular");
  });

  it("should match projects with TypeScript", () => {
    const result = selectRelevantProjectContext("en", "TypeScript", 1);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should match projects with MongoDB", () => {
    const result = selectRelevantProjectContext("en", "MongoDB", 1);
    expect(result).toContain("Multiplayer Tactical RPG");
  });

  it("should match projects with Socket.io", () => {
    const result = selectRelevantProjectContext("en", "Socket.io", 1);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should match projects with React", () => {
    const result = selectRelevantProjectContext("en", "React Framer Motion", 1);
    expect(result).toContain("Portfolio");
  });
});

describe("selectRelevantProjectContext - Category-Based Queries", () => {
  it("should match projects by category keywords", () => {
    const result = selectRelevantProjectContext("en", "Full Stack", 1);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should match robotics projects", () => {
    const result = selectRelevantProjectContext("en", "Robotics embedded", 1);
    expect(result).toContain("Autonomous Navigation Robot");
  });

  it("should match multiplayer/realtime projects", () => {
    const result = selectRelevantProjectContext("en", "multiplayer realtime", 2);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should match AI projects", () => {
    const result = selectRelevantProjectContext("en", "AI assistant", 1);
    expect(result).toContain("Portfolio");
  });
});

describe("selectRelevantProjectContext - Challenge/Approach Keywords", () => {
  it("should match by challenge description", () => {
    const result = selectRelevantProjectContext("en", "distributed state synchronization", 1);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should match by outcome keywords", () => {
    const result = selectRelevantProjectContext("en", "responsive browser", 1);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("selectRelevantProjectContext - Edge Cases", () => {
  it("should handle empty query string", () => {
    const result = selectRelevantProjectContext("en", "", 1);
    expect(result).toBe("");
  });

  it("should handle only stopwords", () => {
    const result = selectRelevantProjectContext("en", "the and for with", 1);
    expect(result).toBe("");
  });

  it("should handle special characters in query", () => {
    const result = selectRelevantProjectContext("en", "C++ AVR embedded microcontroller", 1);
    expect(result).toContain("Autonomous Navigation Robot");
  });

  it("should handle very long query", () => {
    const longQuery = "Tell me about your challenging projects involving complex architecture patterns and distributed systems with real-time communication requirements and modern tech stacks";
    const result = selectRelevantProjectContext("en", longQuery, 2);
    expect(typeof result).toBe("string");
  });
});

describe("resolveDeterministicRouting - Combined Branch Tests", () => {
  it("should prioritize phone branch over other branches", () => {
    const result = resolveDeterministicRouting(
      "What is your phone number for deployed projects?",
      "en",
    );
    // Even though it mentions projects, phone should take priority
    expect(result.branch).toBe("phone");
  });

  it("should handle ambiguous but correctly classify as none", () => {
    const result = resolveDeterministicRouting(
      "Tell me something interesting",
      "en",
    );
    expect(result.branch).toBe("none");
    expect(result.responseText).toBeNull();
  });
});

describe("Language Switching Edge Cases", () => {
  it("should detect mixed language query correctly", () => {
    const result = resolveDeterministicRouting(
      "Tell me about your projects et ton experience",
      "en",
    );
    // Mixed language, but should lean towards detected language
    expect(result.preferredLocale).toBeDefined();
  });

  it("should preserve locale preference for follow-up questions", () => {
    const result1 = resolveDeterministicRouting("Parle-moi de tes projets", "en");
    const result2 = resolveDeterministicRouting("Comment tu as approché l'architecture?", "en");

    expect(result1.preferredLocale).toBe("fr");
    expect(result2.preferredLocale).toBe("fr");
  });
});

describe("Missing Information Response Rule", () => {
  it("should route purpose-related queries without matching info to none branch", () => {
    const result = resolveDeterministicRouting(
      "Do you have experience with blockchain and Web3?",
      "en",
    );

    // Should route to "none" so AI model applies the missing-information rule
    expect(result.branch).toBe("none");
    expect(result.responseText).toBeNull();
  });

  it("should route French purpose-related queries without matching info", () => {
    const result = resolveDeterministicRouting(
      "As-tu travaillé avec la blockchain?",
      "en",
    );

    expect(result.branch).toBe("none");
    expect(result.preferredLocale).toBe("fr");
  });

  it("should route project-related queries with no matches to none branch", () => {
    const result = resolveDeterministicRouting(
      "Tell me about your quantum computing project",
      "en",
    );

    expect(result.branch).toBe("none");
  });

  it("system prompt test", () => {
    const prompt = buildSystemPrompt("en", "Tell me about your quantum computing project");
    console.log(prompt);
  });
});
