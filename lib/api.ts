import airtable from "airtable";
import { useEmailCloaker } from "helpers";

airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
});

interface BaseProps {
  name:
    | "Members"
    | "Regions"
    | "Roles"
    | "Focuses"
    | "Industries"
    | "Experience";
  view?: string;
}

const getBase = async ({ name, view }: BaseProps) => {
  return airtable
    .base(process.env.AIRTABLE_BASE)(name)
    .select({
      view: view || "All",
    })
    .all();
};

const apiFilterTypes = {
  focus: "Focuses",
  industry: "Industries",
  experience: "Experience",
  region: "Regions",
};

export interface MemberPublic {
  name?: string;
  companySize?: string;
  emailAbbr?: string[];
  focus?: { name: string; id: string }[] | string[];
  focusSuggested?: string;
  id?: string;
  industry?: { name: string; id: string }[] | string[];
  industrySuggested?: string;
  link?: string;
  location?: string;
  region?: string;
  title?: string;
  yearsExperience?: string;
}

export interface MemberPublicEditing extends MemberPublic {
  editing?: { field: string; changeTo: string | string[] }[];
}

export async function getMembers(): Promise<MemberPublic[]> {
  return Promise.all([
    getBase({ name: "Members", view: "Approved" }),
    getBase({ name: "Focuses", view: "Approved" }),
    getBase({ name: "Industries", view: "Approved" }),
    getBase({ name: "Regions" }),
  ]).then((values) => {
    const [members, focuses, industries, regions] = values;
    return members
      .map((member) => {
        const regionLookup =
          regions.find((region) => {
            const memberRegion = member.fields["Region"];
            if (memberRegion && Array.isArray(memberRegion)) {
              return region.id === member.fields["Region"][0];
            }
          })?.fields["Name"] || null;

        const focusLookup = () => {
          const memberFocus = member.fields["Focus"];
          if (memberFocus && Array.isArray(memberFocus)) {
            return memberFocus.map((foc) => {
              return (
                focuses
                  .filter((thisFoc) => foc === thisFoc.id)
                  .map((foc) => {
                    return {
                      name:
                        typeof foc.fields["Name"] === "string"
                          ? foc.fields["Name"]
                          : null,
                      id:
                        typeof foc.fields["ID"] === "string"
                          ? foc.fields["ID"]
                          : null,
                    };
                  })[0] || null
              );
            });
          }
          return null;
        };

        const industryLookup = () => {
          const memberIndustry = member.fields["Industry"];
          if (memberIndustry && Array.isArray(memberIndustry)) {
            return memberIndustry.map((ind) => {
              return (
                industries
                  .filter((thisInd) => ind === thisInd.id)
                  .map((ind) => {
                    return {
                      name:
                        typeof ind.fields["Name"] === "string"
                          ? ind.fields["Name"]
                          : null,
                      id:
                        typeof ind.fields["ID"] === "string"
                          ? ind.fields["ID"]
                          : null,
                    };
                  })[0] || null
              );
            });
          }
          return null;
        };

        const emailLookup = () => {
          const memberEmail = member.fields["Email"];
          if (member.fields["Email"] === undefined) {
            return null;
          }
          const [first, last, domain] = useEmailCloaker(memberEmail);
          return [first, last, domain];
        };

        return {
          name:
            typeof member.fields["Name"] === "string"
              ? member.fields["Name"]
              : null,
          location:
            typeof member.fields["Location"] === "string"
              ? member.fields["Location"]
              : null,
          link:
            typeof member.fields["Link"] === "string"
              ? member.fields["Link"]
              : null,
          title:
            typeof member.fields["Title"] === "string"
              ? member.fields["Title"]
              : null,
          id:
            typeof member.fields["RecordID"] === "string"
              ? member.fields["RecordID"]
              : null,
          companySize:
            typeof member.fields["Company Size"] === "string"
              ? member.fields["Company Size"]
              : null,
          yearsExperience:
            typeof member.fields["Years of Experience"] === "string"
              ? member.fields["Years of Experience"]
              : null,
          emailAbbr: emailLookup(),
          region: typeof regionLookup === "string" ? regionLookup : null,
          industry: industryLookup(),
          focus: focusLookup(),
        };
      })
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
  });
}

function hasApprovedMembers(approvedMemberIds: string[], memberList) {
  // TODO: add type to memberList
  for (const member in memberList) {
    if (approvedMemberIds.includes(memberList[member])) {
      return true;
    }
  }
  return false;
}

export interface Filter {
  name: string;
  id: string;
  filterType: string;
  members?: string[];
  count?: number;
  hasApprovedMembers?: boolean;
}

export async function getFilters(
  filterType: string,
  limitByMembers?: boolean,
  approvedMemberIds?: string[]
): Promise<Filter[]> {
  const filters = await getBase({
    name: apiFilterTypes[filterType],
    view: "Approved",
  });
  return filters
    .filter(
      (role) =>
        role.fields["Name"] &&
        (limitByMembers
          ? hasApprovedMembers(approvedMemberIds, role.fields["Members"])
          : true)
    )
    .map((role) => {
      return {
        name:
          typeof role.fields["Name"] === "string" ? role.fields["Name"] : null,
        id: typeof role.fields["ID"] === "string" ? role.fields["ID"] : null,
        filterType: filterType,
        members: Array.isArray(role.fields["Members"])
          ? role.fields["Members"]
          : null,
        count: Array.isArray(role.fields["Members"])
          ? role.fields["Members"].length
          : 0,
        hasApprovedMembers: limitByMembers
          ? hasApprovedMembers(approvedMemberIds, role.fields["Members"])
          : null,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export interface FilterBasic {
  name: string;
  id: string;
}

export async function getFiltersBasic(
  members: MemberPublic[],
  filterType: string
): Promise<Filter[]> {
  const filterList = [];
  const filters = await getBase({
    name: apiFilterTypes[filterType],
  });
  const returnedFilters = filters.map((role) => {
    return {
      name:
        typeof role.fields["Name"] === "string" ? role.fields["Name"] : null,
      id: typeof role.fields["ID"] === "string" ? role.fields["ID"] : null,
    };
  });
  returnedFilters.forEach((fil) => {
    filterList.push({
      name: fil.name,
      id: fil.id,
      filterType: filterType,
      members: [],
      count: 0,
      hasApprovedMembers: false,
    });
  });
  const memFil = members.filter((member) =>
    filterType == "experience" ? member.yearsExperience : member.region
  );
  memFil.forEach((member) => {
    let expIndex = filterList.findIndex(
      (exp) =>
        exp.name ===
        (filterType == "experience" ? member.yearsExperience : member.region)
    );
    if (!filterList[expIndex].hasApprovedMembers)
      filterList[expIndex].hasApprovedMembers = true;
    filterList[expIndex].count++;
    filterList[expIndex].members.push(member.id);
  });
  return filterList;
}
