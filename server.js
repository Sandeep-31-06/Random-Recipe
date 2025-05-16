const express = require("express");
const admin = require("firebase-admin");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

const serviceAccount = {
  type: process.env.FB_type,
  project_id: process.env.FB_project_id,
  private_key_id: process.env.FB_private_key_id,
  private_key: process.env.FB_private_key.replace(/\\n/g, "\n"),
  client_email: process.env.FB_client_email,
  client_id: process.env.FB_client_id,
  auth_uri: process.env.FB_auth_uri,
  token_uri: process.env.FB_token_uri,
  auth_provider_x509_cert_url: process.env.FB_auth_provider,
  client_x509_cert_url: process.env.FB_client_cert
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await auth.createUser({ email, password });
    await db.collection("users").doc(userRecord.uid).set({ email });
    res.status(200).send("Signup successful!");
  } catch (err) {
    res.status(400).send("Signup error: " + err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email } = req.body;
  try {
    await auth.getUserByEmail(email);
    res.status(200).send("Login successful!");
  } catch (err) {
    res.status(401).send("Login error: " + err.message);
  }
});

app.post("/save-favorite", async (req, res) => {
  const { id, title, image, instructions, email } = req.body;

  console.log("Received favorite save:", req.body);

  if (!id || !title || !image || !instructions || !email) {
    console.log("❌ Missing fields");
    return res.status(400).send("Missing required fields.");
  }

  try {
    await db.collection("favorites").doc(`${email}_${id}`).set({
      id, title, image, instructions, email,
    });

    console.log("✅ Saved recipe for", email);
    res.send("✅ Recipe saved successfully!");
  } catch (error) {
    console.error("🔥 Firestore error:", error);
    res.status(500).send("Internal server error while saving favorite.");
  }
});

app.post("/remove-favorite", async (req, res) => {
  const { id, email } = req.body;

  if (!id || !email) {
    return res.status(400).send("Missing id or email");
  }

  try {
    await db.collection("favorites").doc(`${email}_${id}`).delete();
    res.send("✅ Favorite removed");
  } catch (error) {
    console.error("🔥 Firestore error while deleting:", error.message);
    res.status(500).send("Error removing favorite");
  }
});


app.get("/favorites", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send("Missing email");

  try {
    const snapshot = await db
      .collection("favorites")
      .where("email", "==", email)
      .get();

    const data = snapshot.docs.map(doc => doc.data());
    res.json(data);
  } catch (error) {
    console.error("Error loading favorites:", error.message);
    res.status(500).send("Failed to load favorites");
  }
});

app.use((req, res) => {
  res.status(404).send("Page not found!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


