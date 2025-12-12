import { Clock, Sparkles } from "lucide-react";
import { MemberPublic } from "@/lib/firebase-helpers/interfaces";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MatchCriterion {
  icon: typeof Clock;
  label: string;
  detail: string;
}

interface ConnectionCardProps {
  member: MemberPublic;
  matchCriteria: MatchCriterion[];
  whyMatchText: string;
}

// Extract company from title (format: "Title @ Company" or just "Title")
function extractCompanyFromTitle(title?: string): string | null {
  if (!title) return null;
  const atIndex = title.indexOf("@");
  if (atIndex !== -1) {
    return title.substring(atIndex + 1).trim();
  }
  return null;
}

// Extract role from title (format: "Title @ Company" or just "Title")
function extractRoleFromTitle(title?: string): string {
  if (!title) return "";
  const atIndex = title.indexOf("@");
  if (atIndex !== -1) {
    return title.substring(0, atIndex).trim();
  }
  return title.trim();
}

export default function ConnectionCard({
  member,
  matchCriteria,
  whyMatchText,
}: ConnectionCardProps) {
  const role = extractRoleFromTitle(member.title);
  const company = extractCompanyFromTitle(member.title);
  const displayTitle = company ? `${role} @ ${company}` : role;

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
      {/* Suggested badge */}
      <div className="mb-5 flex items-center gap-2 text-orange-500">
        <Sparkles className="h-5 w-5" strokeWidth={2.5} />
        <span className="text-sm font-semibold">Suggested for you</span>
      </div>

      {/* Name and role */}
      <div className="mb-5">
        <h2 className="mb-1 text-2xl font-bold text-stone-900">
          {member.name || "Member"}
        </h2>
        <p className="text-lg text-stone-500">{displayTitle || "No title"}</p>
      </div>

      {/* Match criteria */}
      <div className="mb-6 space-y-3">
        {matchCriteria.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-orange-500" strokeWidth={1.5} />
              <span className="font-medium text-stone-800">{item.label}</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-400">{item.detail}</span>
            </div>
          );
        })}
      </div>

      {/* Why this match section */}
      <div className="mb-6">
        <h3 className="mb-2 font-semibold text-orange-500">Why this match?</h3>
        <p className="leading-relaxed text-stone-600">{whyMatchText}</p>
      </div>

      {/* CTA Button */}
      {member.link ? (
        <Link
          href={member.link}
          target="_blank"
          className={cn(
            "inline-block w-full rounded-2xl bg-orange-100 px-6 py-4 text-center font-semibold text-stone-900 transition-colors hover:bg-orange-200",
            "plausible-event-name=Connection+Card+Click",
          )}
        >
          Start a Conversation
        </Link>
      ) : (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-2xl bg-stone-100 px-6 py-4 font-semibold text-stone-400"
        >
          Start a Conversation
        </button>
      )}
    </div>
  );
}
