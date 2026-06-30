import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, FileText, Sparkles, TrendingUp, Briefcase } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { loadRecentMatches } from "@/lib/jobs";
import type { JobMatch } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — ResumeRoute" }] }),
  component: Dashboard,
});

function scoreTone(score: number) {
  if (score >= 80) return "bg-success/10 text-success border-success/20";
  if (score >= 60) return "bg-primary/10 text-primary border-primary/20";
  if (score >= 40) return "bg-warning/15 text-warning-foreground border-warning/30";
  return "bg-muted text-muted-foreground border-border";
}

function Dashboard() {
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState<JobMatch[]>([]);

  useEffect(() => {
    if (user) loadRecentMatches(user.id).then(setMatches);
  }, [user]);

  const skills = profile?.skills ?? [];
  const top = matches[0]?.match_score ?? 0;
  const stats = [
    { label: "Skills extracted", value: skills.length, icon: Sparkles },
    { label: "Matched jobs", value: matches.length, icon: Briefcase },
    { label: "Top match", value: matches.length ? `${top}%` : "—", icon: TrendingUp },
  ];

  const firstName = (profile?.full_name || user?.email || "there").split(" ")[0].split("@")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-sm text-muted-foreground">Here's what's new in your job search today.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {profile?.resume_url ? "Resume on file" : "No resume uploaded yet"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.resume_url ? "Update anytime from the Resume page." : "Upload one to start matching."}
              </p>
            </div>
          </div>
          <Button variant="outline" asChild size="sm">
            <Link to="/upload">{profile?.resume_url ? "Update resume" : "Upload resume"}</Link>
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Extracted skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="bg-accent text-primary hover:bg-accent">{s}</Badge>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI matched jobs</h2>
            <p className="text-sm text-muted-foreground">Ranked by relevance to your resume.</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/jobs">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {matches.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No matches yet. Upload your resume to get started.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {matches.slice(0, 6).map((j) => (
              <article key={j.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{j.job_title}</h3>
                    <p className="truncate text-xs text-muted-foreground">{j.company} · {j.location}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${scoreTone(j.match_score)}`}>
                    {j.match_score}% match
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {j.salary && <span className="text-xs text-muted-foreground">{j.salary}</span>}
                  <Button size="sm" asChild><a href={j.job_url} target="_blank" rel="noreferrer">Apply</a></Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
