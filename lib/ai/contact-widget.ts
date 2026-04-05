import type { Locale } from "@/lib/projects";

export type ContactWidgetData = {
  title: string;
  subtitle: string;
  email: string;
  availabilityLabel: string;
  availabilityOptions: string[];
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  submitLabel: string;
  successMessage: string;
  errorMessage: string;
  invalidEmailMessage?: string;
  minCharactersMessageTemplate?: string;
};

export function isContactRelatedQuestion(question: string) {
  const q = question
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return /(contact|email|mail|linkedin|github|reach out|reach me|how can i contact|how to contact|courriel|joindre|contacter|ecrire|me joindre)/.test(
    q,
  );
}

export function buildContactWidgetData(locale: Locale): ContactWidgetData {
  if (locale === "fr") {
    return {
      title: "Disponibilite & Contact",
      subtitle:
        "Vous pouvez me contacter directement ici. Je suis ouvert aux stages et opportunites en genie logiciel.",
      email: "contact@wesamdawod.com",
      availabilityLabel: "Disponibilite",
      availabilityOptions: [
        "Stage ete 2026",
        "Mandat a temps partiel",
        "Discussion generale",
      ],
      nameLabel: "Nom",
      emailLabel: "Courriel",
      subjectLabel: "Sujet",
      messageLabel: "Message",
      submitLabel: "Envoyer",
      successMessage: "Message envoye. Merci, je reviens vers vous rapidement.",
      errorMessage: "Impossible d'envoyer pour le moment. Merci de reessayer un peu plus tard.",
      invalidEmailMessage: "{field} : veuillez entrer un courriel valide.",
      minCharactersMessageTemplate: "{field} : minimum {min} caracteres.",
    };
  }

  return {
    title: "Availability & Contact",
    subtitle:
      "Reach out directly from here. I am open to software engineering internships and opportunities.",
    email: "contact@wesamdawod.com",
    availabilityLabel: "Availability",
    availabilityOptions: [
      "Summer 2026 internship",
      "Part-time collaboration",
      "General discussion",
    ],
    nameLabel: "Name",
    emailLabel: "Email",
    subjectLabel: "Subject",
    messageLabel: "Message",
    submitLabel: "Send",
    successMessage: "Message sent. Thanks, I will get back to you soon.",
    errorMessage: "Could not send right now. Please try again shortly.",
    invalidEmailMessage: "{field}: please enter a valid email address.",
    minCharactersMessageTemplate: "{field}: minimum {min} characters.",
  };
}
