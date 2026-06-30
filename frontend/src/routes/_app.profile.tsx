import { createFileRoute } from "@tanstack/react-router";
import { Mail, FileText, Download } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Profile — ResumeRoute" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile } = useAuth();
  const name = profile?.full_name || user?.email?.split("@")[0] || "User";
  const ini = name.split(" ").map((p) => p[0]?.toUpperCase()).slice(0, 2).join("");

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <div className="h-28 bg-gradient-to-r from-primary to-primary-hover" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-card">
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">{ini}</AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" />{user?.email}</span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Resume</h2>
          {profile?.resume_url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={profile.resume_url} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" /> Download
              </a>
            </Button>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-md border border-border bg-surface p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile?.resume_url ? "Resume on file" : "No resume uploaded"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6 shadow-card">
        <h2 className="text-base font-semibold">Skills</h2>
        <p className="text-xs text-muted-foreground">Extracted from your resume. Used to rank job matches.</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(profile?.skills ?? []).map((s) => (
            <Badge key={s} variant="secondary" className="bg-accent text-primary hover:bg-accent">{s}</Badge>
          ))}
          {!profile?.skills?.length && <p className="text-sm text-muted-foreground">No skills yet — upload a resume.</p>}
        </div>
      </section>
    </div>
  );
}
