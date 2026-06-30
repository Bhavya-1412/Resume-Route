import { supabase, type JobMatch } from "@/integrations/supabase/client";
import { fetchAdzunaJobs, scoreJobAgainstSkills, type AdzunaJob } from "./adzuna";

export type RankedJob = AdzunaJob & { matchScore: number; matchedSkills: string[] };

export async function findAndStoreMatches(
  userId: string,
  userEmail: string,
  skills: string[],
): Promise<RankedJob[]> {
  const jobs = await fetchAdzunaJobs(skills);
  const ranked: RankedJob[] = jobs
    .map((j) => {
      const score = scoreJobAgainstSkills(j, skills);
      return { ...j, matchScore: score, matchedSkills: (j as any).matchedSkills ?? [] };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // Persist top 10 matches
  const top = ranked.slice(0, 10);
  if (top.length) {
    await supabase.from("job_matches").insert(
      top.map((j) => ({
        user_id: userId,
        job_title: j.title,
        company: j.company,
        location: j.location,
        salary: j.salary ?? null,
        match_score: j.matchScore,
        job_url: j.url,
        alerted: false,
      })),
    );
  }

  // Alert on strong matches
  const strong = ranked.filter((j) => j.matchScore >= 70).slice(0, 5);
  if (strong.length) {
    try {
      await supabase.functions.invoke("send-alert", {
        body: {
          to: userEmail,
          jobs: strong.map((j) => ({
            title: j.title,
            company: j.company,
            location: j.location,
            score: j.matchScore,
            url: j.url,
          })),
        },
      });
      // mark alerted
      await supabase
        .from("job_matches")
        .update({ alerted: true })
        .eq("user_id", userId)
        .gte("match_score", 70);
    } catch (e) {
      console.warn("Email alert failed (deploy send-alert edge function):", e);
    }
  }

  return ranked;
}

export async function loadRecentMatches(userId: string): Promise<JobMatch[]> {
  const { data } = await supabase
    .from("job_matches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as JobMatch[]) ?? [];
}
