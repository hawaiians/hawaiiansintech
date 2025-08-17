import { Filter, MemberPublic } from "./interfaces";
import { CompanySizeEnum, YearsOfExperienceEnum, StatusEnum } from "../enums";
export type { MemberPublic };

/**
 * Stubbed function to simulate fetching technologists
 * without connecting to firebase.
 * Generates anonymized, on-the-fly mock data that matches
 * the real getMembers function structure.
 *
 * @param count - Number of mock members to generate (default: 50)
 * @param seed - Seed for consistent randomization (default: 12345)
 * @returns Generated mock member data
 */

// List of common first names in Hawaii
const MOCK_FIRST_NAMES = [
  "Kai",
  "Leilani",
  "Keoni",
  "Mahina",
  "Koa",
  "Noelani",
  "Kaleo",
  "Liko",
  "Keala",
  "Anela",
  "Ikaika",
  "Kailani",
  "Malie",
  "Pono",
  "Kawika",
  "Kalani",
  "Maile",
  "Joshua",
  "Michael",
  "Christopher",
  "Justin",
  "Matthew",
  "Jordan",
  "Ryan",
  "Brandon",
  "James",
  "Daniel",
  "Andrew",
  "Kyle",
  "Nicholas",
  "Joseph",
  "John",
  "Jonathan",
  "Robert",
  "David",
  "Kevin",
  "Anthony",
  "Sean",
  "Zachary",
  "Ashley",
  "Jessica",
  "Nicole",
  "Brittany",
  "Jennifer",
  "Sarah",
  "Amanda",
  "Michelle",
  "Chelsea",
  "Lauren",
  "Samantha",
  "Jasmine",
  "Amber",
  "Tiffany",
  "Rachel",
  "Alyssa",
  "Megan",
  "Elizabeth",
  "Kayla",
  "Kimberly",
  "Courtney",
  "Melissa",
];

// List of common last names in Hawaii
const MOCK_LAST_NAMES = [
  "Nakamura",
  "Yamamoto",
  "Tanaka",
  "Watanabe",
  "Sato",
  "Kaneshiro",
  "Matsumoto",
  "Yamada",
  "Kimura",
  "Takahashi",
  "Suzuki",
  "Yoshida",
  "Inouye",
  "Kobayashi",
  "Sakamoto",
  "Nakamoto",
  "Saito",
  "Miyamoto",
  "Hashimoto",
  "Ikeda",
  "Sasaki",
  "Hayashi",
  "Nakagawa",
  "Pascua",
  "Corpuz",
  "Santos",
  "Reyes",
  "Cruz",
  "Ramos",
  "Medeiros",
  "Souza",
  "Silva",
  "Freitas",
  "Rodrigues",
  "Gomes",
  "Carvalho",
  "Lee",
  "Wong",
  "Kim",
  "Young",
  "Chang",
  "Chun",
  "Ching",
  "Lau",
  "Higa",
  "Lum",
  "Oshiro",
  "Ho",
  "Chong",
  "Domingo",
  "Leong",
  "Chung",
  "Pang",
  "Miyashiro",
  "Fujimoto",
  "Chan",
  "Arakaki",
  "Murakami",
  "Yee",
  "Kam",
  "Tom",
  "Nishimura",
  "Shimabukuro",
  "Au",
  "Fong",
  "Yuen",
  "Chen",
  "Lam",
];

const MOCK_LOCATIONS = [
  "Honolulu",
  "Hilo",
  "Kailua-Kona",
  "Kahului",
  "Lihue",
  "Pearl City",
  "Kailua",
  "Kaneohe",
  "Waipahu",
  "Mililani",
  "Aiea",
  "Kihei",
  "San Francisco Bay Area",
  "Los Angeles",
  "Seattle",
  "Portland",
  "Austin",
  "Denver",
  "Chicago",
  "New York",
  "Boston",
  "Atlanta",
  "Miami",
  "Phoenix",
  "Las Vegas",
  "San Diego",
  "Sacramento",
  "Washington DC",
];

const MOCK_REGIONS = [
  "California",
  "Hawai‛i",
  "Washington",
  "Texas",
  "Oregon",
  "New York",
  "Nevada",
  "Utah",
  "Arizona",
  "Florida",
  "Colorado",
  "Virginia",
  "Japan",
  "Michigan",
  "Massachusetts",
  "Australia",
  "Delaware",
  "Minnesota",
  "Idaho",
  "Maryland",
  "Oklahoma",
  "United Kingdom",
  "Illinois",
  "New Jersey",
  "Georgia",
  "Arkansas",
  "Aotearoa",
];

const MOCK_TITLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Principal Software Engineer",
  "Engineering Manager",
  "Senior Engineering Manager",
  "Product Manager",
  "Senior Product Manager",
  "Product Designer",
  "UX Designer",
  "UI Designer",
  "UX/UI Designer",
  "Senior UX Designer",
  "Principal Designer",
  "Data Scientist",
  "Senior Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Mobile Developer",
  "iOS Developer",
  "Android Developer",
  "QA Engineer",
  "Software Engineer in Test",
  "Security Engineer",
  "Cloud Architect",
  "Technical Lead",
  "CTO",
  "VP Engineering",
];

const MOCK_FOCUSES = [
  { name: "Engineering", id: "focus_engineering" },
  { name: "Design", id: "focus_design" },
  { name: "Product", id: "focus_product" },
  { name: "Data Science", id: "focus_data_science" },
  { name: "DevOps", id: "focus_devops" },
  { name: "Security", id: "focus_security" },
  { name: "Mobile", id: "focus_mobile" },
  { name: "Frontend", id: "focus_frontend" },
  { name: "Backend", id: "focus_backend" },
  { name: "Machine Learning", id: "focus_ml" },
  { name: "Cloud", id: "focus_cloud" },
  { name: "QA/Testing", id: "focus_qa" },
];

const MOCK_INDUSTRIES = [
  { name: "Internet / Technology", id: "industry_tech" },
  { name: "Healthcare", id: "industry_healthcare" },
  { name: "Financial Services", id: "industry_fintech" },
  { name: "E-commerce", id: "industry_ecommerce" },
  { name: "Education", id: "industry_education" },
  { name: "Gaming", id: "industry_gaming" },
  { name: "Media & Entertainment", id: "industry_media" },
  { name: "Transportation", id: "industry_transport" },
  { name: "Real Estate", id: "industry_realestate" },
  { name: "Non-profit", id: "industry_nonprofit" },
  { name: "Government", id: "industry_government" },
  { name: "Consulting", id: "industry_consulting" },
];

// Simple seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  choices<T>(array: T[], count: number): T[] {
    const result: T[] = [];
    const used = new Set<number>();

    while (result.length < count && used.size < array.length) {
      const index = this.nextInt(0, array.length - 1);
      if (!used.has(index)) {
        used.add(index);
        result.push(array[index]);
      }
    }

    return result;
  }
}

export function mockGetMembers(
  count: number = 50,
  seed: number = 12345,
): MemberPublic[] {
  const rng = new SeededRandom(seed);
  const members: MemberPublic[] = [];

  const companySizes = Object.values(CompanySizeEnum);
  const yearsExperience = Object.values(YearsOfExperienceEnum);

  for (let i = 0; i < count; i++) {
    const firstName = rng.choice(MOCK_FIRST_NAMES);
    const lastName = rng.choice(MOCK_LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const location = rng.choice(MOCK_LOCATIONS);

    // Generate email abbreviation based on name
    const firstInitial = firstName.charAt(0).toLowerCase();
    const lastInitial = lastName.charAt(0).toLowerCase();
    const emailAbbr = `${firstInitial}...${lastInitial}@hawaiiansintech.org`;

    // Generate LinkedIn URL
    const linkedinHandle = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    const link = `https://linkedin.com/in/${linkedinHandle}`;

    // Select 1-3 focus areas
    const focusCount = rng.nextInt(1, 3);
    const focus = rng.choices(MOCK_FOCUSES, focusCount);

    // Select 1-2 industries
    const industryCount = rng.nextInt(1, 2);
    const industry = rng.choices(MOCK_INDUSTRIES, industryCount);

    // Select region based on location
    let region: string;
    if (
      location.includes("Honolulu") ||
      location.includes("Hilo") ||
      location.includes("Kailua-Kona") ||
      location.includes("Kahului") ||
      location.includes("Lihue") ||
      location.includes("Pearl City") ||
      location.includes("Kailua") ||
      location.includes("Kaneohe") ||
      location.includes("Waipahu") ||
      location.includes("Mililani") ||
      location.includes("Aiea") ||
      location.includes("Kihei")
    ) {
      region = rng.choice(["Hawaiʻi", "Oʻahu", "Maui", "Kauaʻi"]);
    } else if (
      location.includes("California") ||
      location.includes("San Francisco") ||
      location.includes("Los Angeles") ||
      location.includes("San Diego") ||
      location.includes("Sacramento")
    ) {
      region = "California";
    } else {
      region = rng.choice(MOCK_REGIONS);
    }

    const member: MemberPublic = {
      id: `mock_member_${String(i + 1).padStart(3, "0")}`,
      name,
      location,
      region, // Keep the singular region for backward compatibility
      regions: [
        {
          name: region,
          id: `region_${region.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        },
      ],
      emailAbbr,
      title: rng.choice(MOCK_TITLES),
      link,
      focus,
      industry,
      experience: [
        {
          name: rng.choice(yearsExperience),
          id: `experience_${rng
            .choice(yearsExperience)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")}`,
        },
      ],
      companySize: rng.choice(companySizes),
      yearsExperience: rng.choice(yearsExperience),
      status: StatusEnum.APPROVED,
      unsubscribed: false,
    };

    members.push(member);
  }

  // Sort by name to match real getMembers behavior
  return members.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

/**
 * Stubbed function to fetch filters without connecting to firebase.
 * Generates dynamic filter data that corresponds to the mock members.
 *
 * @param filterType - Type of filter (focus, industry, region, experience)
 * @param limitByMembers - Whether to limit filters to those with members
 * @param approvedMemberIds - Array of approved member IDs
 * @returns Generated filter data
 */
export function getFilters(
  filterType: string,
  limitByMembers?: boolean,
  approvedMemberIds?: string[],
): Filter[] {
  // Generate mock members to calculate filter counts
  const mockMembers = mockGetMembers(50);
  const filters: Filter[] = [];

  switch (filterType.toLowerCase()) {
    case "focus":
    case "focuses":
      MOCK_FOCUSES.forEach((focus) => {
        const memberIds = mockMembers
          .filter(
            (member) =>
              Array.isArray(member.focus) &&
              member.focus.some(
                (f) => typeof f === "object" && f.id === focus.id,
              ),
          )
          .map((member) => member.id!)
          .filter(Boolean);

        if (!limitByMembers || memberIds.length > 0) {
          filters.push({
            id: focus.id,
            name: focus.name,
            filterType: "focus",
            members: memberIds,
            count: memberIds.length,
            hasApprovedMembers: memberIds.length > 0,
          });
        }
      });
      break;

    case "industry":
    case "industries":
      MOCK_INDUSTRIES.forEach((industry) => {
        const memberIds = mockMembers
          .filter(
            (member) =>
              Array.isArray(member.industry) &&
              member.industry.some(
                (i) => typeof i === "object" && i.id === industry.id,
              ),
          )
          .map((member) => member.id!)
          .filter(Boolean);

        if (!limitByMembers || memberIds.length > 0) {
          filters.push({
            id: industry.id,
            name: industry.name,
            filterType: "industry",
            members: memberIds,
            count: memberIds.length,
            hasApprovedMembers: memberIds.length > 0,
          });
        }
      });
      break;

    case "region":
    case "regions":
      const uniqueRegions = Array.from(
        new Set(mockMembers.map((m) => m.region).filter(Boolean)),
      );
      uniqueRegions.forEach((regionName, index) => {
        const memberIds = mockMembers
          .filter((member) => member.region === regionName)
          .map((member) => member.id!)
          .filter(Boolean);

        if (!limitByMembers || memberIds.length > 0) {
          filters.push({
            id: `region_${regionName?.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
            name: regionName!,
            filterType: "region",
            members: memberIds,
            count: memberIds.length,
            hasApprovedMembers: memberIds.length > 0,
          });
        }
      });
      break;

    case "experience":
      const uniqueExperience = Array.from(
        new Set(mockMembers.map((m) => m.yearsExperience).filter(Boolean)),
      );
      uniqueExperience.forEach((experienceName, index) => {
        const memberIds = mockMembers
          .filter((member) => member.yearsExperience === experienceName)
          .map((member) => member.id!)
          .filter(Boolean);

        if (!limitByMembers || memberIds.length > 0) {
          filters.push({
            id: `experience_${experienceName?.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
            name: experienceName!,
            filterType: "experience",
            members: memberIds,
            count: memberIds.length,
            hasApprovedMembers: memberIds.length > 0,
          });
        }
      });
      break;

    default:
      // Return all filters if no specific type requested
      return [
        ...getFilters("focus", limitByMembers, approvedMemberIds),
        ...getFilters("industry", limitByMembers, approvedMemberIds),
        ...getFilters("region", limitByMembers, approvedMemberIds),
        ...getFilters("experience", limitByMembers, approvedMemberIds),
      ];
  }

  // Sort by count descending, then by name
  return filters.sort((a, b) => {
    if (b.count !== a.count) {
      return (b.count || 0) - (a.count || 0);
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Helper function to get mock filter data for a specific filter table
 * that corresponds to the generated mock members.
 *
 * @param filterTable - The filter table type (focuses, industries, regions, experience)
 * @param memberCount - Number of mock members to base filters on (default: 50)
 * @param seed - Seed for consistent randomization (default: 12345)
 * @returns Object with members and filter data
 */
export function getMockDataWithFilters(
  filterTable?: string,
  memberCount: number = 50,
  seed: number = 12345,
) {
  const members = mockGetMembers(memberCount, seed);

  if (!filterTable) {
    return {
      members,
      focuses: getFilters("focus"),
      industries: getFilters("industry"),
      regions: getFilters("region"),
      experience: getFilters("experience"),
    };
  }

  const filters = getFilters(filterTable);

  return {
    members,
    [filterTable]: filters,
  };
}

/**
 * Example usage function showing how to use the mock data
 * in a way that matches the real getMembers API response structure.
 *
 * @param options - Options similar to real getMembers function
 * @returns Mock response matching real API structure
 */
export function mockGetMembersWithFilters(
  options: {
    limit?: number;
    includeFilters?: boolean;
    regions?: any[];
    industries?: any[];
    focuses?: any[];
    experience?: any[];
  } = {},
) {
  const {
    limit = 25,
    includeFilters = true,
    regions,
    industries,
    focuses,
    experience,
  } = options;

  const allMembers = mockGetMembers(100); // Generate larger pool
  const members = allMembers.slice(0, limit); // Apply limit

  const result: any = {
    members,
    cursor: members.length > 0 ? members[members.length - 1].id : null, // Mock cursor for pagination
    hasMore: limit < allMembers.length, // Mock hasMore flag
  };

  if (includeFilters) {
    result.focuses = focuses || getFilters("focus");
    result.industries = industries || getFilters("industry");
    result.regions = regions || getFilters("region");
    result.experience = experience || getFilters("experience");
  }

  return result;
}
