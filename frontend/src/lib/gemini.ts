import Groq from "groq-sdk";

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function extractSkillsFromResume(resumeText: string): Promise<string[]> {
  try {
    if (!resumeText || typeof resumeText !== "string") return [];

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Extract ONLY a JSON array of technical skills from the resume. No explanations. Example: [\"React\",\"Node.js\",\"Python\"]",
        },
        {
          role: "user",
          content: resumeText.slice(0, 15000),
        },
      ],
      temperature: 0.2,
    });

    const content = response.choices?.[0]?.message?.content ?? "[]";

    // SAFE PARSE
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed
          .map((s) => String(s).trim())
          .filter(Boolean)
          .slice(0, 25);
      }
    } catch {
      // fallback extraction
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) return parsed.map(String);
        } catch {}
      }
    }

    return [];
  } catch (err) {
    console.error("Groq error:", err);
    return [];
  }
}