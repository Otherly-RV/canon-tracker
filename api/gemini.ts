import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    return;
  }

  // Most developers should use Gemini Developer API keys (AI Studio).
  // If you are using Vertex AI instead, change vertexai to true.
  const ai = new GoogleGenAI({ apiKey, vertexai: false });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const prompt = String(body?.prompt || "");

    const out = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { role: "user", parts: [{ text: prompt }] },
      config: { temperature: 0.2 }
    });

    res.status(200).json({ text: out.text });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Gemini failed" });
  }
}
