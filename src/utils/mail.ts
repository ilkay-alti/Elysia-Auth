import { Resend } from "resend";

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}`;
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "nextauthv5@resend.dev",
    to: email,
    subject: "Verify your email address",
    html: `
      <h1>Verify your email address</h1>
      <p>Click the link below to verify your email address.</p>
      <a href="${confirmLink}">Verify your email address</a>
    `,
  });
};
