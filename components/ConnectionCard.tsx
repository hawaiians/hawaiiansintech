import { Clock, MapPin, Briefcase, Sparkles } from "lucide-react";
import { MemberPublic } from "@/lib/firebase-helpers/interfaces";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full">
      {/* Suggested badge */}
      <div className="flex items-center gap-2 text-orange-500 mb-5">
        <Sparkles className="w-5 h-5" strokeWidth={2.5} />
        <span className="font-semibold text-sm">Suggested for you</span>
      </div>

      {/* Name and role */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-stone-900 mb-1">
          {member.name || "Member"}
        </h2>
        <p className="text-stone-500 text-lg">{displayTitle || "No title"}</p>
      </div>

      {/* Match criteria */}
      <div className="space-y-3 mb-6">
        {matchCriteria.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
              <span className="font-medium text-stone-800">{item.label}</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-400">{item.detail}</span>
            </div>
          );
        })}
      </div>

      {/* Why this match section */}
      <div className="mb-6">
        <h3 className="text-orange-500 font-semibold mb-2">Why this match?</h3>
        <p className="text-stone-600 leading-relaxed">{whyMatchText}</p>
      </div>

      {/* CTA Button */}
      {member.link ? (
        <Link
          href={member.link}
          target="_blank"
          className={cn(
            "w-full bg-orange-100 hover:bg-orange-200 text-stone-900 font-semibold py-4 px-6 rounded-2xl transition-colors inline-block text-center",
            "plausible-event-name=Connection+Card+Click",
          )}
        >
          Start a Conversation
        </Link>
      ) : (
        <button
          disabled
          className="w-full bg-stone-100 text-stone-400 font-semibold py-4 px-6 rounded-2xl cursor-not-allowed"
        >
          Start a Conversation
        </button>
      )}
    </div>
  );
}

