import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "cathy.leffler46@ethereal.email",
    pass: "2eRpcV1agFau89Y8pu",
  },
});

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Verify your email address",
    html: `
      <h1>Verify your email address</h1>
      <p>Click the link below to verify your email address.</p>
      <a href="${confirmLink}">Verify your email address</a>
    `,
  });
};

export const sendTwoFactorEmail = async (email: string, token: string) => {
  await transporter.sendMail({
    from: "nextauthv5@resend.dev",
    to: email,
    subject: "Verify your email address",
    html: `
      <h1>2FA Verification Token</h1>
     <h2> ${token}</h2>   `,
  });
};
