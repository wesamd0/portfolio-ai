import { z } from "zod";

const contactPayloadSchema = z.object({
  name: z.string().min(2).max(120),
  senderEmail: z.string().email().max(200),
  subject: z.string().max(180).optional().default(""),
  message: z.string().min(10).max(4000),
  availability: z.string().max(120).optional().default(""),
});

type ContactErrorCode =
  | "INVALID_PAYLOAD"
  | "MISSING_EMAIL_CONFIGURATION"
  | "RESEND_REQUEST_FAILED"
  | "CONTACT_API_INTERNAL_ERROR";

function jsonError(
  status: number,
  code: ContactErrorCode,
  message: string,
  details?: Record<string, unknown>,
) {
  return Response.json(
    {
      ok: false,
      code,
      message,
      ...(details ? { details } : {}),
    },
    { status },
  );
}

function getProviderErrorMessage(providerError: unknown) {
  if (!providerError) {
    return "";
  }

  if (typeof providerError === "string") {
    return providerError;
  }

  if (typeof providerError === "object") {
    const maybeError = providerError as {
      message?: unknown;
      error?: unknown;
      name?: unknown;
    };

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message.trim();
    }

    if (typeof maybeError.error === "string" && maybeError.error.trim()) {
      return maybeError.error.trim();
    }

    if (typeof maybeError.name === "string" && maybeError.name.trim()) {
      return maybeError.name.trim();
    }
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = contactPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(400, "INVALID_PAYLOAD", "Invalid contact payload.", {
        issues: parsed.error.issues,
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const receiverEmail =
      process.env.CONTACT_RECEIVER_EMAIL ?? "contact@wesamdawod.com";
    const fromEmail = process.env.CONTACT_FROM_EMAIL;

    const missingEnv: string[] = [];
    if (!resendApiKey) {
      missingEnv.push("RESEND_API_KEY");
    }
    if (!fromEmail) {
      missingEnv.push("CONTACT_FROM_EMAIL");
    }

    if (missingEnv.length > 0) {
      return jsonError(
        500,
        "MISSING_EMAIL_CONFIGURATION",
        "Missing required email configuration.",
        { missingEnv },
      );
    }

    const { name, senderEmail, subject, message, availability } = parsed.data;
    const safeSubject = subject.trim() || "Portfolio chat contact";

    const text = [
      `New chat contact submission`,
      `Name: ${name}`,
      `Sender email: ${senderEmail}`,
      `Availability: ${availability || "Not specified"}`,
      `Subject: ${safeSubject}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [receiverEmail],
        reply_to: senderEmail,
        subject: `[Portfolio Chat] ${safeSubject}`,
        text,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      const providerError = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : await response.text().catch(() => null);

      const providerMessage = getProviderErrorMessage(providerError);
      const testModeHint = fromEmail?.includes("onboarding@resend.dev")
        ? " If you are using onboarding@resend.dev, Resend test mode usually only allows sending to your own account email. Use a verified domain sender for production."
        : "";
      const failureMessage = providerMessage
        ? `Failed to send email via provider: ${providerMessage}.${testModeHint}`
        : `Failed to send email via provider.${testModeHint}`;

      return jsonError(
        502,
        "RESEND_REQUEST_FAILED",
        failureMessage,
        {
          providerStatus: response.status,
          providerError,
        },
      );
    }

    return Response.json({ ok: true, message: "Message sent" }, { status: 200 });
  } catch (error) {
    console.error("[contact-api] Unexpected error", error);
    return jsonError(
      500,
      "CONTACT_API_INTERNAL_ERROR",
      "Unexpected server error while sending message.",
    );
  }
}
