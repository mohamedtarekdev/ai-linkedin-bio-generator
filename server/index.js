import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log("KEY:", process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  systemInstruction:
    "You write LinkedIn content. Follow the requested target format strictly. Keep it crisp, modern, and human. Avoid clichés and emojis unless asked.",
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/generate", async (req, res) => {
  try {
    const {
      name,
      role,
      yearsOfExperience,
      skills,
      tone = "professional", // professional | friendly | bold
      target = "headline", // headline | about | bio
    } = req.body || {};

    if (!role || !skills) {
      return res.status(400).json({
        error: "Missing required fields: role, skills",
      });
    }

    const exampleUser = `Target: headline
        Name: Mohamed
        Role: Software Engineer
        Experience: 2 years
        Skills: Node.js, MySQL, REST APIs
        Tone: professional`;

    const exampleAssistant =
      "Software Engineer | Node.js & MySQL | Building scalable APIs & reliable systems";

    const userPrompt = `Target: ${target}
        Name: ${name || "N/A"}
        Role: ${role}
        Experience: ${yearsOfExperience || "N/A"}
        Skills: ${Array.isArray(skills) ? skills.join(", ") : skills}
        Tone: ${tone}

        Rules:
        - If Target=headline: 1 line, max 120 chars.
        - If Target=bio: 2-3 lines.
        - If Target=about: 5-8 lines, with 3 bullet points at the end.
        - No placeholders like [Your Name].`;

    const prompt = `
        Example Input:
        ${exampleUser}

        Example Output:
        ${exampleAssistant}

        Now generate for:
        ${userPrompt}
        `.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    });

    const text = result.response.text()?.trim() || "";
    res.json({ text });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Server error",
      message: err?.message,
    });
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
