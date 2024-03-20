const PORT = 4000;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const routes = express.Router();
const nodemailer = require("nodemailer");
app.use("/api", routes);

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const jsonParser = bodyParser.json();

//cors
routes.use(cors());

// send an email via the contact form
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.LOGIN,
    pass: process.env.PASSWORD,
  },
});

routes.post("/contact", jsonParser, (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: process.env.LOGIN,
    replyTo: email,
    to: process.env.LOGIN,
    subject: `Demande d'information pour ${name}`,
    text: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email envoyé : " + info.response);
    res.send("Message envoyé avec succès!");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server up and running on http://localhost:${PORT}`);
});
