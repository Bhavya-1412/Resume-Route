import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Upload,
  Sparkles,
  Briefcase,
  BellRing,
  CheckCircle2,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Join free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <Badge className="mb-4 bg-accent text-primary hover:bg-accent" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" /> AI-powered matching
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              The fastest way from{" "}
              <span className="text-primary">resume to interview</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Drop in your PDF resume. ResumeRoute extracts your skills, matches you to live
              jobs from across the web, and alerts you the moment a strong fit appears.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get started — it's free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
            <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "Free to join, no credit card",
                "Skill extraction in seconds",
                "Live jobs from Adzuna",
                "Email alerts on 70%+ matches",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-semibold">Today's top matches</p>
                  <p className="text-xs text-muted-foreground">Based on alex-morgan-resume.pdf</p>
                </div>
                <Badge className="bg-success/10 text-success" variant="secondary">
                  4 new
                </Badge>
              </div>
              <ul className="mt-4 space-y-3">
                {[
                  { title: "Senior Full Stack Engineer", company: "Northwind Labs", score: 94 },
                  { title: "Frontend Engineer, Platform", company: "Lumen Health", score: 88 },
                  { title: "Backend Engineer (Python)", company: "Vesta AI", score: 82 },
                ].map((j) => (
                  <li
                    key={j.title}
                    className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">{j.title}</p>
                      <p className="text-xs text-muted-foreground">{j.company}</p>
                    </div>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                      {j.score}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-full bg-primary/20 blur-2xl md:block" />
            <div className="absolute -right-8 -top-8 hidden h-32 w-32 rounded-full bg-primary/10 blur-3xl md:block" />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">How ResumeRoute works</h2>
            <p className="mt-3 text-muted-foreground">
              Three steps from upload to opportunity.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Upload,
                title: "Upload your resume",
                body: "Drag and drop a PDF. We never share it without your permission.",
              },
              {
                icon: Sparkles,
                title: "AI extracts your skills",
                body: "Gemini reads your resume and turns it into structured skill tags.",
              },
              {
                icon: Briefcase,
                title: "Get matched jobs",
                body: "We pull live roles and rank them by relevance to your profile.",
              },
            ].map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
            <BellRing className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">Be first on the great roles</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              When a job scores 70% or higher, we'll email you instantly so you can apply before
              the rush.
            </p>
            <Button asChild size="lg" className="mt-2">
              <Link to="/signup">
                Create your free account <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} ResumeRoute. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
