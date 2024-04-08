import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.LOGIN,
    pass: process.env.PASSWORD,
  },
});

export const handler = async (event) => {
  let body;
  try {
    if (event.body) {
      body = JSON.parse(event.body);
    } else {
      throw new Error("Le corps de la requête est vide ou manquant.");
    }
  } catch (error) {
    console.error("Erreur lors du parsing du JSON:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "La requête doit contenir un corps JSON valide.",
      }),
      headers: { "Content-Type": "application/json" },
    };
  }

  const { name, email, message } = body;

  const mailOptions = {
    from: process.env.LOGIN,
    replyTo: email,
    to: process.env.LOGIN,
    subject: `Demande d'information pour ${name}`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message envoyé avec succès!" }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Erreur lors de l'envoi du message" }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
