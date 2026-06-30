const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID as string;
const APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY as string;

export type AdzunaJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  url: string;
  created: string;
};

export async function fetchAdzunaJobs(
  keywords: string[],
  opts: { country?: string; resultsPerPage?: number } = {},
): Promise<AdzunaJob[]> {
  const country = opts.country ?? "in";
const what = keywords[0]?.trim() || "python";
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  url.searchParams.set("app_id", APP_ID);
  url.searchParams.set("app_key", APP_KEY);
  url.searchParams.set("results_per_page", String(opts.resultsPerPage ?? 30));
  url.searchParams.set("what", what);
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Adzuna error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const jobs: AdzunaJob[] = (data.results ?? []).map((j: any) => ({
    id: String(j.id),
    title: j.title ?? "Untitled",
    company: j.company?.display_name ?? "Unknown",
    location: j.location?.display_name ?? "",
    salary:
      j.salary_min || j.salary_max
        ? `${j.salary_min ? Math.round(j.salary_min).toLocaleString() : "?"} – ${j.salary_max ? Math.round(j.salary_max).toLocaleString() : "?"}`
        : undefined,
    description: j.description ?? "",
    url: j.redirect_url ?? "#",
    created: j.created ?? "",
  }));
  return jobs;
}

export function scoreJobAgainstSkills(job: AdzunaJob, skills: string[]): number {
  if (!skills.length) return 0;
  const hay = `${job.title} ${job.description}`.toLowerCase();
  let hits = 0;
  const matched: string[] = [];
  for (const s of skills) {
    const k = s.toLowerCase().trim();
    if (k.length < 2) continue;
    if (hay.includes(k)) {
      hits++;
      matched.push(s);
    }
  }
  const ratio = hits / skills.length;
  // Boost a bit so meaningful overlap reads as high match
  const score = Math.min(100, Math.round(ratio * 140));
  (job as any).matchedSkills = matched;
  return score;
}
