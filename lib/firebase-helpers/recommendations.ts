import { MemberPublic } from "./interfaces";
import { YearsOfExperienceEnum, StatusEnum } from "@/lib/enums";

interface NewMemberData {
  yearsExperience?: string;
  focusesSelected?: string | string[];
  industriesSelected?: string | string[];
}

interface ScoredMember {
  member: MemberPublic;
  score: number;
  experienceGap?: number;
  sharedInterests?: string[];
}

/**
 * Converts YearsOfExperienceEnum value to a numeric range for comparison
 * Returns the midpoint of the range for scoring purposes
 */
function getExperienceMidpoint(experience: string): number {
  switch (experience) {
    case YearsOfExperienceEnum.LESS_THAN_ONE:
      return 0.5;
    case YearsOfExperienceEnum.ONE_TO_TWO:
      return 1.5;
    case YearsOfExperienceEnum.THREE_TO_FOUR:
      return 3.5;
    case YearsOfExperienceEnum.FIVE_TO_NINE:
      return 7;
    case YearsOfExperienceEnum.TEN_TO_NINETEEN:
      return 14.5;
    case YearsOfExperienceEnum.MORE_THAN_FIFTEEN:
      return 25;
    default:
      return 0;
  }
}

/**
 * Calculates the experience gap between new member and potential mentor
 * Positive gap means mentor has more experience
 */
function calculateExperienceGap(
  newMemberExperience: string,
  mentorExperience: string,
): number {
  const newMemberMidpoint = getExperienceMidpoint(newMemberExperience);
  const mentorMidpoint = getExperienceMidpoint(mentorExperience);
  return mentorMidpoint - newMemberMidpoint;
}

/**
 * Checks for overlap between new member's selected items and mentor's items
 */
function getSharedInterests(
  newMemberSelected: string | string[] | undefined,
  mentorItems: { name: string; id: string }[] | string[] | undefined,
): string[] {
  if (!newMemberSelected || !mentorItems) return [];

  const newMemberIds = Array.isArray(newMemberSelected)
    ? newMemberSelected
    : [newMemberSelected];

  // Handle union type by checking if first item is a string
  // If array is empty, default to treating as object array (safer)
  const isStringArray =
    mentorItems.length > 0 && typeof mentorItems[0] === "string";

  const mentorIds: string[] = isStringArray
    ? (mentorItems as string[]).filter((id): id is string => id != null)
    : (mentorItems as { name: string; id: string }[])
        .filter((item) => item != null && item.id != null)
        .map((item) => item.id)
        .filter((id): id is string => id != null);

  return newMemberIds.filter((id) => mentorIds.includes(id));
}

/**
 * Scores a member based on experience gap and shared interests
 */
function scoreMember(
  member: MemberPublic,
  newMemberData: NewMemberData,
): ScoredMember {
  let score = 0;
  const sharedInterests: string[] = [];

  // Experience gap scoring (highest weight)
  if (
    newMemberData.yearsExperience &&
    member.experience &&
    member.experience.length > 0
  ) {
    const mentorExperience = member.experience[0]?.name || "";
    const experienceGap = calculateExperienceGap(
      newMemberData.yearsExperience,
      mentorExperience,
    );

    // Only score positive gaps (mentor has more experience)
    if (experienceGap > 0) {
      // Prioritize 10+ years ahead
      if (experienceGap >= 10) {
        score += 100;
      } else if (experienceGap >= 5) {
        score += 50;
      } else {
        score += 25;
      }
    }
  }

  // Industry/focus overlap scoring (medium weight)
  const sharedFocuses = getSharedInterests(
    newMemberData.focusesSelected,
    member.focus,
  );
  const sharedIndustries = getSharedInterests(
    newMemberData.industriesSelected,
    member.industry,
  );

  if (sharedFocuses.length > 0) {
    score += sharedFocuses.length * 20;
    sharedInterests.push(...sharedFocuses);
  }

  if (sharedIndustries.length > 0) {
    score += sharedIndustries.length * 20;
    sharedInterests.push(...sharedIndustries);
  }

  return {
    member,
    score,
    experienceGap:
      newMemberData.yearsExperience && member.experience?.[0]?.name
        ? calculateExperienceGap(
            newMemberData.yearsExperience,
            member.experience[0].name,
          )
        : undefined,
    sharedInterests: sharedInterests.length > 0 ? sharedInterests : undefined,
  };
}

/**
 * Gets recommended members for a new signup based on experience and interests
 * Returns up to 3 top matches
 */
export function getRecommendedMembers(
  newMemberData: NewMemberData,
  allMembers: MemberPublic[],
): MemberPublic[] {
  if (!allMembers || allMembers.length === 0) return [];

  // Filter to only approved members
  const approvedMembers = allMembers.filter(
    (member) => member.status === StatusEnum.APPROVED,
  );

  if (approvedMembers.length === 0) return [];

  // Score all members
  const scoredMembers = approvedMembers
    .map((member) => scoreMember(member, newMemberData))
    .filter((scored) => scored.score > 0) // Only include members with positive scores
    .sort((a, b) => b.score - a.score); // Sort by score descending

  // Prefer members that have a LinkedIn URL in their link field
  const scoredWithLinkedIn = scoredMembers.filter((scored) => {
    const link = scored.member.link;
    return typeof link === "string" && link.toLowerCase().includes("linkedin");
  });

  const source =
    scoredWithLinkedIn.length > 0 ? scoredWithLinkedIn : scoredMembers;

  // Return top 8
  return source.slice(0, 8).map((scored) => scored.member);
}

/**
 * Gets detailed match information for a recommended member
 */
export function getMatchDetails(
  member: MemberPublic,
  newMemberData: NewMemberData,
): {
  experienceGap?: number;
  sharedInterests?: string[];
  experienceGapText?: string;
} {
  const mentorExperience = member.experience?.[0]?.name || "";
  const experienceGap =
    newMemberData.yearsExperience && mentorExperience
      ? calculateExperienceGap(newMemberData.yearsExperience, mentorExperience)
      : undefined;

  const sharedFocuses = getSharedInterests(
    newMemberData.focusesSelected,
    member.focus,
  );
  const sharedIndustries = getSharedInterests(
    newMemberData.industriesSelected,
    member.industry,
  );

  let experienceGapText: string | undefined;
  if (experienceGap && experienceGap > 0) {
    if (experienceGap >= 10) {
      experienceGapText = "10+ years ahead";
    } else if (experienceGap >= 5) {
      experienceGapText = "5+ years ahead";
    } else {
      experienceGapText = `${Math.round(experienceGap)} years ahead`;
    }
  }

  return {
    experienceGap,
    sharedInterests:
      sharedFocuses.length > 0 || sharedIndustries.length > 0
        ? [...sharedFocuses, ...sharedIndustries]
        : undefined,
    experienceGapText,
  };
}
