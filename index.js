const PORT = 4000;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const routes = express.Router();
const FarmerModel = require("./models/farmer");
const SellerModel = require("./models/seller");
const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");
app.use("/api", routes);

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const jsonParser = bodyParser.json();

//cors
routes.use(cors());

// Function connect DB
async function connectToMongoDB() {
  const uri = `${process.env.SECRET_MONGO}`;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client;
  } catch (err) {
    console.error("Error connecting to MongoDB: ", err);
    throw err;
  }
}

// ------- producers ------------ //
// Add producer
routes.post("/add-producer/:id", jsonParser, async (req, res) => {
  try {
    // connect MongoDB
    let client = await connectToMongoDB();

    const formData = req.body;
    const id = req.params.id;

    // Select database and collection
    const database = client.db("farmers");
    const collection = database.collection(`farmer_${id}`);

    const newFarmer = new FarmerModel(formData);

    // Insert data collection
    const result = await collection.insertOne(newFarmer.toObject());

    console.log("Document inserted successfully:", result);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error processing request: ", err);
    res.status(500).send("Error processing request");
  }
});

// Get all producers
routes.get("/list-producers/:id", async (req, res) => {
  try {
    // connect MongoDB
    let client = await connectToMongoDB();

    const id = req.params.id;

    // Select the database and collection associated with this ID
    const database = client.db("farmers");
    const collection = database.collection(`farmer_${id}`);

    // Utilisez la méthode find pour récupérer tous les agriculteurs
    const farmers = await collection.find({}).toArray();

    res.status(200).json(farmers);
  } catch (err) {
    console.error("Erreur lors du traitement de la demande : ", err);
    res.status(500).send("Erreur lors du traitement de la demande");
  }
});

// ------- sellers ------------ //
routes.post("/add-seller/:id", jsonParser, async (req, res) => {
  try {
    // connect MongoDB
    let client = await connectToMongoDB();

    const formData = req.body;
    const id = req.params.id;

    // Select database and collection
    const database = client.db("sellers");
    const collection = database.collection(`seller_${id}`);

    const newSeller = new SellerModel(formData);

    // Insert data collection
    const result = await collection.insertOne(newSeller.toObject());

    console.log("Document inserted successfully:", result);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error processing request: ", err);
    res.status(500).send("Error processing request");
  }
});

routes.get("/list-sellers/:id", async (req, res) => {
  try {
    // connect MongoDB
    let client = await connectToMongoDB();

    const id = req.params.id;

    // Select the database and collection associated with this ID
    const database = client.db("sellers");
    const collection = database.collection(`seller_${id}`);

    // Utilisez la méthode find pour récupérer tous les agriculteurs
    const sellers = await collection.find({}).toArray();

    res.status(200).json(sellers);
  } catch (err) {
    console.error("Erreur lors du traitement de la demande : ", err);
    res.status(500).send("Erreur lors du traitement de la demande");
  }
});

// send email via the contact form
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASSWORD,
  },
});

routes.post("/contact", jsonParser, (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.MAIL,
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
