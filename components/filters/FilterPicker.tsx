import { Filter } from "@/lib/firebase-helpers/interfaces";
import { cn } from "@/lib/utils";
import { useState } from "react";
import BigPill from "../BigPill";
import Selectable, { SelectableSize } from "../form/Selectable";
import Tabs, { TabsSize } from "../Tabs";

export interface PickerFilter extends Filter {
  active?: boolean;
}

interface FilterPickerProps {
  filtersList: PickerFilter[];
  activeFilters: PickerFilter[];
  onFilterClick: (id?: string, filterType?: string) => any;
  onViewAll: () => any;
  onFilterSelect: (filterSelect?: string, enable?: boolean) => any;
  selectedMemberCount?: number;
  viewAll?: boolean;
}

export default function FilterPicker({
  filtersList,
  activeFilters,
  onFilterClick,
  onFilterSelect,
  selectedMemberCount,
  onViewAll,
  viewAll,
}: FilterPickerProps) {
  const [focusActive, setFocusActive] = useState<boolean>(true);
  const [industryActive, setIndustryActive] = useState<boolean>();
  const [regionActive, setRegionActive] = useState<boolean>();
  const [experienceActive, setExperienceActive] = useState<boolean>();
  const filterIsSelected = activeFilters.length !== 0;

  function activateFilter(setFilter: Function, filtertype: string) {
    const filterSetList = [
      setFocusActive,
      setIndustryActive,
      setRegionActive,
      setExperienceActive,
    ];
    for (const filterSet of filterSetList) {
      if (filterSet !== setFilter) filterSet(false);
    }
    setFilter(true);
    onFilterSelect(filtertype);
  }

  return (
    <>
      <div className="relative mt-16 grid w-full">
        <ul className="mb-4 flex min-h-[44px] w-full flex-wrap gap-2 px-4 lg:px-8">
          {activeFilters.map((focus, i) => (
            <li key={`focus-filter-${i}`}>
              <BigPill onClick={() => onFilterClick(focus.id)}>
                {focus.name}
              </BigPill>
            </li>
          ))}
        </ul>
        <div
          className={cn(
            "relative w-full overflow-scroll",
            "after:fixed after:inset-y-0 after:right-0 after:z-10 after:w-4 after:bg-gradient-to-l after:from-background after:to-transparent",
          )}
        >
          <div className="flex items-center gap-4 px-4 py-4 lg:px-8">
            <Tabs
              className="shrink-0"
              size={TabsSize.Large}
              items={[
                {
                  label: "Focus",
                  selected: focusActive,
                  onClick: () => activateFilter(setFocusActive, "focus"),
                },
                {
                  label: "Industry",
                  selected: industryActive,
                  onClick: () => activateFilter(setIndustryActive, "industry"),
                },
                {
                  label: "Experience",
                  selected: experienceActive,
                  onClick: () =>
                    activateFilter(setExperienceActive, "experience"),
                },
                {
                  label: "Location",
                  selected: regionActive,
                  onClick: () => activateFilter(setRegionActive, "region"),
                },
              ]}
            />
            <h4
              className={cn(
                `shrink-0 grow text-right text-sm text-stone-600 sm:text-lg`,
                filterIsSelected && "text-brown-600",
              )}
            >{`${
              filterIsSelected
                ? `Selected (${selectedMemberCount})`
                : `All (${selectedMemberCount})`
            }`}</h4>
          </div>
        </div>

        <ul className="flex flex-wrap gap-2 px-4 lg:px-8">
          {filtersList
            .sort((a, b) => b.count - a.count)
            .map((filter, i) => (
              <li key={`focus-filter-${filter.id}`}>
                <Selectable
                  headline={filter.name}
                  onClick={() => onFilterClick(filter.id)}
                  // TODO: fix inaccurate count
                  //       - thinking it has something to do with non-approved
                  // count={filter.count}
                  selected={filter.active}
                  disabled={filter.count === 0}
                  centered
                  size={SelectableSize.Large}
                />
              </li>
            ))}
          {viewAll && (
            <li>
              <button
                className={`
                  h-full
                  rounded-lg
                  border-4
                  border-transparent
                  bg-tan-300
                  px-2
                  py-1
                  hover:border-tan-500/50
                  hover:transition-all
                `}
                onClick={onViewAll}
              >
                ...
              </button>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
