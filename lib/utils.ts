import { useStorage } from "@/lib/hooks";
import { type ClassValue, clsx } from "clsx";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FORM_LINKS = [`01-you`, `02-work`, `03-company`, `04-contact`];

const ALL_STORED_FIELDS = [
  "Name",
  "Location",
  "Website",
  "Focuses",
  "FocusSuggested",
  "Title",
  "DeferTitle",
  "YearsExperience",
  "Industries",
  "DeferIndustry",
  "IndustrySuggested",
  "CompanySize",
  "EmailAbbr",
  "Id",
];

export const useClearAllStoredFields = (): ClearStoredFieldsFunction => {
  const { removeItem } = useStorage();

  return (prefix: string, fields?: string[]) => {
    const fieldsToClear = fields || ALL_STORED_FIELDS;

    // Validate prefix
    if (!prefix || typeof prefix !== "string") {
      console.warn("useClearAllStoredFields: Invalid prefix provided", prefix);
      return;
    }

    // Clear fields with error handling
    fieldsToClear.forEach((item) => {
      try {
        removeItem(`${prefix}${item}`);
      } catch (error) {
        console.error(`Failed to remove storage item ${prefix}${item}:`, error);
      }
    });
  };
};

interface useInvalidProps {
  currentPage: `01-you` | `02-work` | `03-company` | `04-contact`;
}

export const useInvalid = ({ currentPage }: useInvalidProps) => {
  const { getItem } = useStorage();
  const router = useRouter();

  useEffect(() => {
    // Base validation for all pages
    let invalid =
      !getItem("jfName") || !getItem("jfLocation") || !getItem("jfWebsite");

    // Additional validation based on current page
    switch (currentPage) {
      case "02-work":
        if (invalid) {
          router.push({ pathname: "01-you", query: { r: "02" } });
        }
        break;

      case "03-company":
        invalid =
          invalid ||
          !getItem("jfYearsExperience") ||
          ([...JSON.parse(getItem("jfFocuses") || "[]")].length < 1 &&
            !getItem("jfFocusSuggested")) ||
          (!getItem("jfTitle") && !getItem("jfDeferTitle"));

        if (invalid) {
          router.push({ pathname: "01-you", query: { r: "03" } });
        }
        break;

      case "04-contact":
        invalid =
          invalid ||
          !getItem("jfYearsExperience") ||
          ([...JSON.parse(getItem("jfFocuses") || "[]")].length < 1 &&
            !getItem("jfFocusSuggested")) ||
          (!getItem("jfTitle") && !getItem("jfDeferTitle")) ||
          ([...JSON.parse(getItem("jfIndustries") || "[]")].length < 1 &&
            !getItem("jfDeferIndustry") &&
            !getItem("jfIndustrySuggested")) ||
          (!getItem("jfCompanySize") && getItem("jfCompanySize") !== "N/A");

        if (invalid) {
          router.push({ pathname: "01-you", query: { r: "04" } });
        }
        break;
    }
  }, [currentPage, getItem, router]);
};

export const MAX_FOCUS_COUNT = 3;

// Type for the clear function returned by useClearAllStoredFields
export type ClearStoredFieldsFunction = (
  prefix: string,
  fields?: string[],
) => void;
