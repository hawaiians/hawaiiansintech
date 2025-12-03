import { MemberPublic } from "@/lib/firebase-helpers/interfaces";
import { Clock, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecommendedConnectionCardProps {
  member: MemberPublic;
  newMemberData: {
    yearsExperience?: string;
    focusesSelected?: string | string[];
    industriesSelected?: string | string[];
  };
  focuses?: { id: string; name: string }[];
  industries?: { id: string; name: string }[];
}

export default function RecommendedConnectionCard({
  member,
  newMemberData,
  focuses = [],
  industries = [],
}: RecommendedConnectionCardProps) {
  // Extract company from title (format: "Role @ Company" or just "Role")
  const titleParts = member.title?.split(" @ ") || [];
  const role = titleParts[0] || member.title || "";
  const company = titleParts[1] || "";

  // Calculate experience gap
  const mentorExperience = member.experience?.[0]?.name || "";
  const newMemberExperience = newMemberData.yearsExperience || "";
  let experienceGap = 0;
  let experienceGapText = "";

  if (newMemberExperience && mentorExperience) {
    const getMidpoint = (exp: string): number => {
      switch (exp) {
        case "Less than a year":
          return 0.5;
        case "1 - 2 years":
          return 1.5;
        case "3 - 4 years":
          return 3.5;
        case "5 - 9 years":
          return 7;
        case "10 - 19 years":
          return 14.5;
        case "More than 20 years":
          return 25;
        default:
          return 0;
      }
    };

    const gap =
      getMidpoint(mentorExperience) - getMidpoint(newMemberExperience);
    if (gap > 0) {
      experienceGap = gap;
      if (gap >= 10) {
        experienceGapText = "10+ years ahead";
      } else if (gap >= 5) {
        experienceGapText = "5+ years ahead";
      } else {
        experienceGapText = `${Math.round(gap)} years ahead`;
      }
    }
  }

  // Get shared interests
  const getSharedInterests = (
    selected: string | string[] | undefined,
    memberItems: { name: string; id: string }[] | string[] | undefined,
    allItems: { id: string; name: string }[],
  ): string[] => {
    if (!selected || !memberItems) return [];

    const selectedIds = Array.isArray(selected) ? selected : [selected];
    const memberIds = memberItems
      .filter((item) => item != null) // Filter out null/undefined items
      .map((item) => (typeof item === "string" ? item : item?.id))
      .filter((id) => id != null); // Filter out any null/undefined IDs

    const sharedIds = selectedIds.filter((id) => memberIds.includes(id));
    return allItems
      .filter((item) => sharedIds.includes(item.id))
      .map((item) => item.name);
  };

  const sharedFocuses = getSharedInterests(
    newMemberData.focusesSelected,
    member.focus,
    focuses,
  );
  const sharedIndustries = getSharedInterests(
    newMemberData.industriesSelected,
    member.industry,
    industries,
  );

  const sharedInterests = [...sharedFocuses, ...sharedIndustries];
  const similarIndustryText =
    sharedInterests.length > 0
      ? sharedInterests.slice(0, 2).join(" & ")
      : "Similar interests";

  // Format detail text to prevent awkward breaks (e.g., keep "& Design" together)
  const formatDetailText = (text: string): string => {
    return text.replace(/ & /g, "\u00A0&\u00A0"); // Use non-breaking spaces around &
  };

  // Generate "Why this match?" text
  const generateWhyMatchText = (): string => {
    const parts: string[] = [];
    const memberName = member.name?.split(" ")[0] || "This member";

    if (experienceGap >= 10) {
      parts.push(
        `${memberName} has walked a similar path and is 10+ years ahead in their career.`,
      );
    } else if (experienceGap >= 5) {
      parts.push(
        `${memberName} has walked a similar path and is several years ahead in their career.`,
      );
    } else if (experienceGap > 0) {
      parts.push(
        `${memberName} has walked a similar path and is ahead in their career.`,
      );
    }

    if (sharedInterests.length > 0) {
      const interestsText =
        sharedInterests.length === 1
          ? sharedInterests[0]
          : sharedInterests.slice(0, 2).join(" and ");
      parts.push(
        `They share your interests in ${interestsText} and are passionate about growing the next generation of kanaka in tech.`,
      );
    } else {
      parts.push(
        "They're passionate about growing the next generation of kanaka in tech.",
      );
    }

    if (company) {
      parts.push(`Ask ${memberName} about their experience at ${company}.`);
    } else if (role) {
      parts.push(`Ask ${memberName} about their journey as a ${role}.`);
    }

    return parts.join(" ");
  };

  const matchCriteria = [
    experienceGap > 0 && {
      icon: Clock,
      label: experienceGapText,
      detail: "Can guide your path",
    },
    sharedInterests.length > 0 && {
      icon: Briefcase,
      label: "Similar interests",
      detail: similarIndustryText,
    },
  ].filter(Boolean);

  if (matchCriteria.length === 0) return null;

  return (
    <div className="flex h-full flex-col rounded-3xl bg-white p-4 shadow-md sm:p-6">
      {/* Suggested badge */}
      <div className="mb-4 flex items-center gap-1.5 text-orange-500">
        <Sparkles className="h-4 w-4 flex-shrink-0" strokeWidth={2.5} />
        <span className="text-xs font-semibold uppercase tracking-wide">
          Suggested for you
        </span>
      </div>

      {/* Name and role */}
      <div className="mb-4">
        <h2 className="mb-1 line-clamp-1 text-xl font-bold leading-tight text-stone-900">
          {member.name}
        </h2>
        <p className="break-words text-sm leading-snug text-stone-500">
          {company ? (
            <>
              {role} <span className="whitespace-nowrap">@ {company}</span>
            </>
          ) : (
            role
          )}
        </p>
      </div>

      {/* Match criteria */}
      <div className="mb-5 space-y-2.5">
        {matchCriteria.map((item, i) => {
          if (!item) return null;
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <Icon
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500"
                strokeWidth={1.5}
              />
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5">
                <span className="text-xs font-medium leading-snug text-stone-800">
                  {item.label}
                </span>
                <span className="font-light text-stone-400">·</span>
                <span className="break-words text-xs leading-snug text-stone-500">
                  {formatDetailText(item.detail)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Why this match section */}
      <div className="mb-5 flex-1">
        <h3 className="mb-2 text-xs font-semibold leading-tight text-orange-500">
          Why this match?
        </h3>
        <p className="break-words text-xs leading-relaxed text-stone-600">
          {generateWhyMatchText()}
        </p>
      </div>

      {/* CTA Button */}
      <Button
        type="button"
        variant="secondaryBrand"
        size="sm"
        className="plausible-event-name=Recommended+Connection+Click w-full rounded-xl text-sm"
        disabled={!member.link}
        onClick={() => {
          if (!member.link) return;
          if (typeof window !== "undefined") {
            window.open(member.link, "_blank", "noopener,noreferrer");
          }
        }}
      >
        Start a Conversation
      </Button>
    </div>
  );
}
