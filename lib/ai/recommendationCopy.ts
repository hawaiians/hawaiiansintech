import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { MemberPublic } from "@/lib/firebase-helpers/interfaces";

type NewMemberData = {
  yearsExperience?: string;
  focusesSelected?: string[] | string;
  industriesSelected?: string[] | string;
};

/**
 * Build a concise, structured description of the match to feed into the model.
 */
function buildContext(member: MemberPublic, newMemberData: NewMemberData) {
  const { name, title, link, experience, focus, industry } = member;

  const focusNames =
    (focus as { id: string; name: string }[] | undefined)?.map(
      (f) => f?.name,
    ) ?? [];
  const industryNames =
    (industry as { id: string; name: string }[] | undefined)?.map(
      (i) => i?.name,
    ) ?? [];

  const newFocusIds = Array.isArray(newMemberData.focusesSelected)
    ? newMemberData.focusesSelected
    : newMemberData.focusesSelected
      ? [newMemberData.focusesSelected]
      : [];
  const newIndustryIds = Array.isArray(newMemberData.industriesSelected)
    ? newMemberData.industriesSelected
    : newMemberData.industriesSelected
      ? [newMemberData.industriesSelected]
      : [];

  return {
    mentor: {
      name,
      title,
      link,
      experienceLabel: experience?.[0]?.name,
      focusNames,
      industryNames,
    },
    newMember: {
      yearsExperience: newMemberData.yearsExperience,
      focusIds: newFocusIds,
      industryIds: newIndustryIds,
    },
  };
}

/**
 * Generate a short \"Why this match?\" explanation for a recommended connection.
 */
export async function generateRecommendationCopy(
  member: MemberPublic,
  newMemberData: NewMemberData,
): Promise<string> {
  const context = buildContext(member, newMemberData);

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    providerOptions: {
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
    },
    prompt: [
      "You are helping a Native Hawaiian tech community platform explain why a mentor is a good match for a new member.",
      "",
      "Write a short, natural-sounding concise couple of sentences (1-2 sentences) that:",
      "- Sounds like a real person talking, not marketing copy.",
      '- Explains in plain language why this mentor is a good fit (for example: "Taylor has experience in fields you’re interested in, like Engineering and Design. He’s been in the industry for over a decade. Ask him about his work across finance and entertainment.").',
      "- Casually mention overlapping interests, industries, or focus areas when they exist.",
      "- Mention how far ahead they are in their career only if it’s clearly helpful context.",
      "- Keep the tone warm and specific to the details in the context, without emojis or buzzwords.",
      "",
      "Context (JSON):",
      JSON.stringify(context, null, 2),
      "",
      "Return only the final explanation text. Do not include the JSON, bullet points, or any extra commentary.",
    ].join("\n"),
  });

  return text.trim();
}
