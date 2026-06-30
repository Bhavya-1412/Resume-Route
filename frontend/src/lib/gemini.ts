const KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const MODEL = "gemini-1.5-flash";

export async function extractSkillsFromResume(resumeText: string): Promise<string[]> {
  const prompt = `Extract a JSON array of distinct technical skills, tools, frameworks, languages, and notable keywords from this resume. Return ONLY a JSON array of short strings, max 25 items, no prose.\n\nResume:\n${resumeText.slice(0, 15000)}`;

  const isApiKey = KEY.startsWith("AIza");
  const url = isApiKey
    ? `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!isApiKey) headers["Authorization"] = `Bearer ${KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return Array.from(
        new Set(
          parsed
            .map((s: unknown) => String(s).trim())
            .filter((s) => s.length > 0 && s.length < 50),
        ),
      ).slice(0, 25);
    }
  } catch {
    // try to find JSON inside
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const p = JSON.parse(match[0]);
        if (Array.isArray(p)) return p.map(String).slice(0, 25);
      } catch {}
    }
  }
  return [];
}
