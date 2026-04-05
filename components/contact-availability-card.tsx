"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { ContactWidgetData } from "@/lib/ai/contact-widget";

export type ContactAvailabilityCardProps = ContactWidgetData;

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 200;
const MAX_SUBJECT_LENGTH = 180;
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactAvailabilityCard({
  title,
  subtitle,
  email,
  availabilityLabel,
  availabilityOptions,
  nameLabel,
  emailLabel,
  subjectLabel,
  messageLabel,
  submitLabel,
  successMessage,
  errorMessage,
  invalidEmailMessage,
  minCharactersMessageTemplate,
}: ContactAvailabilityCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [availability, setAvailability] = useState(availabilityOptions[0] ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const trimmedName = name.trim();
  const trimmedEmail = senderEmail.trim();
  const trimmedMessage = message.trim();
  const nameTooShort = Boolean(trimmedName) && trimmedName.length < MIN_NAME_LENGTH;
  const emailInvalid =
    Boolean(trimmedEmail) && !EMAIL_PATTERN.test(trimmedEmail);
  const messageTooShort =
    Boolean(trimmedMessage) && trimmedMessage.length < MIN_MESSAGE_LENGTH;
  const isFormValid =
    Boolean(trimmedName) &&
    Boolean(trimmedEmail) &&
    Boolean(trimmedMessage) &&
    !emailInvalid &&
    !nameTooShort &&
    !messageTooShort;
  const isSubmitDisabled = isSubmitting || !isFormValid;

  const isFrench = submitLabel.toLowerCase() === "envoyer";
  const defaultInvalidEmailMessageTemplate = isFrench
    ? "{field} : veuillez entrer un courriel valide."
    : "{field}: please enter a valid email address.";
  const defaultMinimumMessageTemplate = isFrench
    ? "{field} : minimum {min} caracteres."
    : "{field}: minimum {min} characters.";

  const formatMinimumMessage = (fieldLabel: string, minimum: number) => {
    const template = minCharactersMessageTemplate ?? defaultMinimumMessageTemplate;
    return template
      .replace("{field}", fieldLabel)
      .replace("{min}", String(minimum));
  };

  const formattedInvalidEmailMessage =
    (invalidEmailMessage ?? defaultInvalidEmailMessageTemplate).replace(
      "{field}",
      emailLabel,
    );

  const formattedNameMinimumMessage = formatMinimumMessage(
    nameLabel,
    MIN_NAME_LENGTH,
  );
  const formattedMessageMinimumMessage = formatMinimumMessage(
    messageLabel,
    MIN_MESSAGE_LENGTH,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = senderEmail.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    const trimmedAvailability = availability.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast.error(errorMessage);
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      toast.error(formattedInvalidEmailMessage);
      return;
    }

    if (trimmedName.length < MIN_NAME_LENGTH) {
      toast.error(formattedNameMinimumMessage);
      return;
    }

    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      toast.error(formattedMessageMinimumMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          senderEmail: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
          availability: trimmedAvailability,
        }),
      });

      if (!response.ok) {
        let detailedMessage = "";

        try {
          const errorPayload = await response.json();
          if (
            errorPayload &&
            typeof errorPayload === "object" &&
            "message" in errorPayload &&
            typeof errorPayload.message === "string"
          ) {
            detailedMessage = errorPayload.message;
          }
        } catch {
          const rawText = await response.text().catch(() => "");
          if (rawText.trim()) {
            detailedMessage = rawText.trim();
          }
        }

        throw new Error(detailedMessage || errorMessage);
      }

      toast.success(successMessage);
      setName("");
      setSenderEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      const detailedMessage =
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : errorMessage;

      toast.error(detailedMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0a121b] p-5 text-[#dce7f4] shadow-[0_20px_55px_rgba(0,0,0,0.34)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#73e9ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#73e9ff]/45 to-transparent" />

      <header className="relative z-10 mb-4">
        <p className="text-lg font-semibold text-white sm:text-xl">{title}</p>
        <p className="mt-2 text-sm leading-6 text-white/70">{subtitle}</p>
        <p className="mt-2 text-sm text-[#9feeff]">{email}</p>
      </header>

      <form className="relative z-10 space-y-3" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-left">
            <span className="text-xs uppercase tracking-[0.12em] text-white/60">{nameLabel}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              className="w-full rounded-lg border border-white/10 bg-[#101926] px-3 py-2 text-sm text-white outline-none focus:border-[#73e9ff]/45"
            />
            {nameTooShort ? (
              <p className="text-xs text-rose-300">{formattedNameMinimumMessage}</p>
            ) : null}
          </label>

          <label className="space-y-1.5 text-left">
            <span className="text-xs uppercase tracking-[0.12em] text-white/60">{emailLabel}</span>
            <input
              value={senderEmail}
              onChange={(event) => setSenderEmail(event.target.value)}
              type="email"
              aria-invalid={emailInvalid}
              maxLength={MAX_EMAIL_LENGTH}
              className={`w-full rounded-lg border bg-[#101926] px-3 py-2 text-sm text-white outline-none focus:border-[#73e9ff]/45 ${
                emailInvalid ? "border-rose-300/70" : "border-white/10"
              }`}
            />
            {emailInvalid ? (
              <p className="text-xs text-rose-300">{formattedInvalidEmailMessage}</p>
            ) : null}
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-left">
            <span className="text-xs uppercase tracking-[0.12em] text-white/60">{availabilityLabel}</span>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#101926] px-3 py-2 text-sm text-white outline-none focus:border-[#73e9ff]/45"
            >
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-left">
            <span className="text-xs uppercase tracking-[0.12em] text-white/60">{subjectLabel}</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={MAX_SUBJECT_LENGTH}
              className="w-full rounded-lg border border-white/10 bg-[#101926] px-3 py-2 text-sm text-white outline-none focus:border-[#73e9ff]/45"
            />
          </label>
        </div>

        <label className="space-y-1.5 text-left">
          <span className="text-xs uppercase tracking-[0.12em] text-white/60">{messageLabel}</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            maxLength={MAX_MESSAGE_LENGTH}
            className="w-full resize-none rounded-lg border border-white/10 bg-[#101926] px-3 py-2 text-sm text-white outline-none focus:border-[#73e9ff]/45"
          />
          {messageTooShort ? (
            <p className="text-xs text-rose-300">{formattedMessageMinimumMessage}</p>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="rounded-lg border border-[#73e9ff]/35 bg-[#73e9ff]/12 px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#9feeff] transition hover:bg-[#73e9ff]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "..." : submitLabel}
        </button>
      </form>
    </article>
  );
}
