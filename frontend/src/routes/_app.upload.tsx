import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Upload as UploadIcon, FileText, CheckCircle2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { extractPdfText } from "@/lib/pdf-extract";
import { extractSkillsFromResume } from "@/lib/gemini";
import { findAndStoreMatches } from "@/lib/jobs";

export const Route = createFileRoute("/_app/upload")({
  ssr: false,
  head: () => ({ meta: [{ title: "Upload resume — ResumeRoute" }] }),
  component: UploadPage,
});

function UploadPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<string>("");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Please upload a PDF.");
      return;
    }
    setFile(f);
  };

  const process = async () => {
    if (!file || !user) return;
    setProcessing(true);
    try {
      setStage("Reading PDF…");
      const text = await extractPdfText(file);
      if (text.trim().length < 50) throw new Error("Could not extract text from this PDF.");

      setStage("Uploading resume…");
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const up = await supabase.storage.from("resumes").upload(path, file, { upsert: true });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("resumes").getPublicUrl(path);

      setStage("Extracting skills with AI…");
      const extracted = await extractSkillsFromResume(text);
      if (!extracted.length) throw new Error("AI returned no skills. Try a more detailed resume.");
      setSkills(extracted);

      setStage("Saving profile…");
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        skills: extracted,
        resume_url: pub.publicUrl,
      });

      setStage("Finding matching jobs…");
      const ranked = await findAndStoreMatches(user.id, user.email!, extracted);
      const strong = ranked.filter((j) => j.matchScore >= 70).length;
      await refreshProfile();
      toast.success(`Done — ${ranked.length} jobs found${strong ? `, ${strong} strong matches alerted.` : "."}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? "Something went wrong.");
    } finally {
      setProcessing(false);
      setStage("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
        <p className="text-sm text-muted-foreground">
          Upload a PDF — we'll extract your skills and use them to find matches.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-6 shadow-card">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors ${
            dragOver ? "border-primary bg-accent" : "border-border bg-surface hover:bg-surface-hover"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <UploadIcon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium">
            Drag and drop your resume, or <span className="text-primary">browse files</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PDF, up to 10 MB</p>
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>

        {file && (
          <div className="mt-4 flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={process} disabled={processing}>
                {processing ? (<><Loader2 className="h-4 w-4 animate-spin" /> {stage || "Working…"}</>) : "Analyze & match"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)} aria-label="Remove" disabled={processing}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {skills.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h2 className="text-sm font-semibold">Extracted skills</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Pulled from your resume using AI.</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="bg-accent text-primary hover:bg-accent">
                {s}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
