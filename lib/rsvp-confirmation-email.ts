type SendRSVPConfirmationEmailInput = {
  toEmail: string;
  guestName: string;
};

type SendRSVPConfirmationEmailResult = {
  sent: boolean;
  skipped: boolean;
};

const RSVP_CONFIRMATION_SUBJECT = "Wedding Invitation Confirmed - Chibuike & Jessica (12.06.2026)";
const RSVP_CONFIRMATION_TEXT =
  "Your invitation to the wedding for Chibuike and Jessica 12.06.2026 is confirmed. Save the date and we hope to see you there.";

async function readErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

export async function sendRSVPConfirmationEmail(
  input: SendRSVPConfirmationEmailInput
): Promise<SendRSVPConfirmationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RSVP_CONFIRMATION_FROM_EMAIL || "";

  if (!apiKey || !from) {
    return { sent: false, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.toEmail],
      subject: RSVP_CONFIRMATION_SUBJECT,
      text: `${input.guestName},\n\n${RSVP_CONFIRMATION_TEXT}`,
      html: `<p>${input.guestName},</p><p>${RSVP_CONFIRMATION_TEXT}</p>`
    })
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(`RSVP confirmation email failed (${response.status}): ${JSON.stringify(body)}`);
  }

  return { sent: true, skipped: false };
}
