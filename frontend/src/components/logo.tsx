import { Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Briefcase className="h-4 w-4" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Resume<span className="text-primary">Route</span>
      </span>
    </Link>
  );
}
