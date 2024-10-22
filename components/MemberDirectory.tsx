import { MemberPublic } from "@/lib/firebase-helpers/interfaces";
import { cn } from "@/lib/utils";

export interface DirectoryMember extends MemberPublic {
  focus: { active?: boolean; id: string; name: string }[];
  industry: { active?: boolean; id: string; name: string }[];
  experienceFilter: { active?: boolean; id: string; name: string }[];
  regionFilter: { active?: boolean; id: string; name: string }[];
}

interface MemberDirectoryProps {
  members?: DirectoryMember[];
}

export default function MemberDirectory({ members }: MemberDirectoryProps) {
  const isFiltered =
    members.filter(
      (mem) =>
        mem.focus
          .concat(mem.industry)
          .concat(mem.experienceFilter)
          .concat(mem.regionFilter)
          ?.filter((foc) => foc.active).length > 0,
    ).length > 0;

  return (
    <section
      className={`
        mt-8
        grid
        gap-4
        px-4
        pb-4
      `}
    >
      {members
        .filter(
          (member) =>
            member.link.includes("linkedin.com") ||
            member.link.includes("lnkd.in"),
        )
        .map((member, i) => {
          const isSelected =
            member.focus
              .concat(member.industry)
              .concat(member.experienceFilter)
              .concat(member.regionFilter)
              ?.filter((foc) => foc.active).length > 0;
          return (
            <a
              className={cn(
                `
              group
              flex
              flex-col
              rounded-2xl
              border-4
              border-transparent
              bg-tan-300/50
              px-2
              py-1
              transition-all
              hover:border-tan-400
              hover:bg-tan-300
              hover:no-underline
              sm:px-4
              sm:py-2
            `,
                isSelected
                  ? "border-brown-600/50 bg-brown-600/10 hover:border-brown-600/30 hover:bg-brown-600/30"
                  : isFiltered
                    ? "opacity-50 hover:opacity-100"
                    : "",
              )}
              key={`member-${member.id}`}
              href={member.link}
              target="_blank"
            >
              <h2
                className={cn(
                  `
                text-2xl
                font-medium
                tracking-tight
                text-stone-800
                group-visited:text-red-400
              `,
                  isSelected && "text-stone-900",
                )}
              >
                {member.name}
              </h2>
            </a>
          );
        })}
    </section>
  );
}
