import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { fetchAdzunaJobs, scoreJobAgainstSkills, type AdzunaJob } from "@/lib/adzuna";

export const Route = createFileRoute("/_app/jobs")({
  ssr: false,
  head: () => ({ meta: [{ title: "Jobs — ResumeRoute" }] }),
  component: JobsPage,
});

function scoreTone(score: number) {
  if (score >= 80) return "bg-success/10 text-success border-success/20";
  if (score >= 60) return "bg-primary/10 text-primary border-primary/20";
  if (score >= 40) return "bg-warning/15 text-warning-foreground border-warning/30";
  return "bg-muted text-muted-foreground border-border";
}

function JobsPage() {
  const { profile } = useAuth();
  const skills = useMemo(() => profile?.skills ?? [], [profile]);

  const [query, setQuery] = useState("");
  const [matched, setMatched] = useState<(AdzunaJob & { matchScore: number })[]>([]);
  const [all, setAll] = useState<(AdzunaJob & { matchScore: number })[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      if (skills.length) {
        const m = await fetchAdzunaJobs(skills);
        setMatched(
          m.map((j) => ({ ...j, matchScore: scoreJobAgainstSkills(j, skills) }))
            .sort((a, b) => b.matchScore - a.matchScore),
        );
      }
      const browseTerms = q ? [q] : ["software"];
      const a = await fetchAdzunaJobs(browseTerms, { resultsPerPage: 30 });
      setAll(a.map((j) => ({ ...j, matchScore: scoreJobAgainstSkills(j, skills) })));
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [skills.join("|")]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground">Live results from Adzuna (India).</p>
        </div>
        <form className="flex w-full max-w-md items-center gap-2 sm:w-auto"
              onSubmit={(e) => { e.preventDefault(); load(query); }}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search job titles or companies" className="pl-9" />
          </div>
          <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}</Button>
        </form>
      </div>

      {skills.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">AI matched jobs</h2>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">{matched.length}</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {matched.map((j) => <JobItem key={j.id} job={j} tone={scoreTone(j.matchScore)} />)}
            {!matched.length && !loading && (
              <p className="text-sm text-muted-foreground">No matches yet.</p>
            )}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold">Browse all jobs</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{all.length}</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {all.map((j) => <JobItem key={j.id} job={j} tone={scoreTone(j.matchScore)} />)}
        </div>
      </section>
    </div>
  );
}

function JobItem({ job, tone }: { job: AdzunaJob & { matchScore: number }; tone: string }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{job.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{job.company} · {job.location}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${tone}`}>
          {job.matchScore}% match
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{job.description}</p>
      <div className="mt-3 flex items-center justify-between">
        {job.salary && <span className="text-xs text-muted-foreground">{job.salary}</span>}
        <Button size="sm" asChild><a href={job.url} target="_blank" rel="noreferrer">Apply</a></Button>
      </div>
    </article>
  );
}
