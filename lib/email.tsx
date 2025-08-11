import { Resend } from "resend";
import WelcomeEmail from "@/emails/welcome-email";
import { ADMIN_EMAILS, REPLY_EMAIL } from "./email/utils";
import PendingMemberEmail from "@/emails/pending-member-email";
import LoginPromptEmail from "@/emails/login-prompt";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendConfirmationEmailProps {
  email: string;
  name: string;
  recordID: string;
  location: string;
  link: string;
  title?: string;
}

export async function sendConfirmationEmails({
  email,
  recordID,
  name,
  location,
  link,
  title,
}: SendConfirmationEmailProps) {
  try {
    // TODO better error handling, thrown in `create-member`
    if (!recordID) throw new Error("No recordID provided");
    if (!email) throw new Error("No email provided");
    if (!name) throw new Error("No name provided");
    if (!location) throw new Error("No location provided");
    if (!link) throw new Error("No link provided");

    // Send welcome email to new member
    await resend.emails.send({
      from: REPLY_EMAIL,
      to: [email],
      subject: "Welcome to Hawaiians in Tech",
      react: WelcomeEmail({
        email,
        name,
        recordID,
        location,
      }),
    });

    // Send notification email to admins
    await resend.emails.send({
      from: REPLY_EMAIL,
      to: ADMIN_EMAILS,
      subject: `Member Submission: ${name}`,
      react: PendingMemberEmail({
        email,
        name,
        recordID,
        location,
        title,
        link,
      }),
    });
  } catch (error) {
    console.error(`Error sending confirmation email to ${email}`, error);
    throw error;
  }
}

export async function sendLoginPromptEmail({
  emailAddress,
  promptLink,
}: {
  emailAddress: string;
  promptLink: string;
}) {
  try {
    await resend.emails.send({
      from: REPLY_EMAIL,
      to: [emailAddress],
      subject: "Login to Hawaiians in Tech",
      react: LoginPromptEmail({
        emailAddress,
        promptLink,
      }),
    });
  } catch (error) {
    console.error(`Error sending login prompt email to ${emailAddress}`, error);
    throw error;
  }
}
