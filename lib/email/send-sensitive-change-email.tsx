import { Resend } from "resend";
import { ADMIN_EMAILS, REPLY_EMAIL } from "@/lib/email/utils";
import SensitiveChangesEmail from "@/emails/sensitive-changes-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendSensitiveChangesEmailsProps {
  name: string;
  changes: string;
  recordID: string;
}

export async function sendSensitiveChangesEmail({
  name,
  changes,
  recordID,
}: SendSensitiveChangesEmailsProps) {
  try {
    if (!changes) throw new Error("No changes provided");

    await resend.emails.send({
      from: REPLY_EMAIL,
      to: ADMIN_EMAILS,
      subject: `Sensitive Changes: ${name}`,
      react: SensitiveChangesEmail({
        name,
        changes,
        recordID,
      }),
    });
  } catch (error) {
    console.error(`Error sending Sensitive Changes email to admin`, error);
    throw error;
  }
}
