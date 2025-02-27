import FilterPicker, { PickerFilter } from "@/components/filters/FilterPicker";
import MemberDirectory, { DirectoryMember } from "@/components/MemberDirectory";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { Title } from "@/components/Title";
import { FirebaseTablesEnum } from "@/lib/enums";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { getMembers } from "@/lib/firebase-helpers/members";
import { getFilters, getFiltersBasic } from "@/lib/firebase-helpers/filters";

export async function getStaticProps() {
  const { members, focuses, industries, regions } = await getMembers();

  return {
    props: {
      fetchedMembers: members,
      fetchedFocuses: await getFilters(
        FirebaseTablesEnum.FOCUSES,
        true,
        members.map((member) => member.id),
        focuses,
      ),
      fetchedIndustries: await getFilters(
        FirebaseTablesEnum.INDUSTRIES,
        true,
        members.map((member) => member.id),
        industries,
      ),
      fetchedExperiences: await getFiltersBasic(members, "experience"),
      fetchedRegions: await getFiltersBasic(
        members,
        FirebaseTablesEnum.REGIONS,
        regions,
      ),
      pageTitle: "Hawaiians in Tech",
    },
    revalidate: 60,
  };
}

export default function HomePage({
  fetchedMembers,
  fetchedFocuses,
  fetchedIndustries,
  fetchedExperiences,
  fetchedRegions,
  pageTitle,
}) {
  const initialState = {
    members: fetchedMembers.map((mem) => ({
      ...mem,
      // mutate & add active prop
      focus: mem.focus
        ? mem.focus.map((foc) => ({ ...foc, active: false }))
        : [],
      industry: mem.industry
        ? mem.industry.map((ind) => ({ ...ind, active: false }))
        : [],
      experienceFilter: [],
      regionFilter: [],
    })),
    focuses: fetchedFocuses.filter((focus) => focus.count > 0),
    industries: fetchedIndustries.filter((industry) => industry.count > 0),
    experiences: fetchedExperiences,
    regions: fetchedRegions.filter((region) => region.count > 0),
  };
  const [members, setMembers] = useState<DirectoryMember[]>(
    initialState.members,
  );

  const [activeFilters, setActiveFilters] = useState<PickerFilter[]>([]);
  const [filtersList, setFiltersList] = useState<PickerFilter[]>(
    initialState.focuses.slice(0, 6),
  );
  const [focuses, setFocuses] = useState<PickerFilter[]>(initialState.focuses);
  const [industries, setIndustries] = useState<PickerFilter[]>(
    initialState.industries,
  );
  const [experiences, setExperiences] = useState<PickerFilter[]>(
    initialState.experiences,
  );
  const [regions, setRegions] = useState<PickerFilter[]>(initialState.regions);
  const [membersCount, setMembersCount] = useState<number>(
    initialState.members.length,
  );
  const [viewAll, setViewAll] = useState<boolean>(true);

  useEffect(() => {
    const activeFilters = focuses
      .concat(industries)
      .concat(experiences)
      .concat(regions)
      .filter((foc) => foc.active);
    const membersWithFilters = members
      .map((mem) => ({
        ...mem,
        focus: mem.focus?.map((foc) => ({
          ...foc,
          // update member focuses if filtered
          active: activeFilters.map((item) => item.id).includes(foc.id),
        })),
        industry: mem.industry?.map((ind) => ({
          ...ind,
          active: activeFilters.map((item) => item.id).includes(ind.id),
        })),
        experienceFilter: mem.yearsExperience
          ? [
              {
                id: experiences.find(
                  (item) => item.name === mem.yearsExperience,
                ).id,
                name: mem.yearsExperience,
                active: activeFilters
                  .map((item) => item.id)
                  .includes(
                    experiences.find(
                      (item) => item.name === mem.yearsExperience,
                    ).id,
                  ),
              },
            ]
          : [],
        regionFilter: mem.region
          ? [
              {
                id: regions.find((item) => item.name === mem.region).id,
                name: mem.region,
                active: activeFilters
                  .map((item) => item.id)
                  .includes(
                    regions.find((item) => item.name === mem.region).id,
                  ),
              },
            ]
          : [],
      }))
      // sort by number of filters set
      .sort((a, b) => {
        if (
          a.focus
            .concat(a.industry)
            .concat(a.experienceFilter)
            .concat(a.regionFilter) === undefined ||
          b.focus
            .concat(b.industry)
            .concat(b.experienceFilter)
            .concat(b.regionFilter) === undefined
        )
          return;
        const firstActive = a.focus
          .concat(a.industry)
          .concat(a.experienceFilter)
          .concat(a.regionFilter)
          .map((fil) => fil?.active)
          .filter((fil) => fil).length;
        const nextActive = b?.focus
          .concat(b?.industry)
          .concat(b?.experienceFilter)
          .concat(b?.regionFilter)
          .map((fil) => fil?.active)
          .filter((fil) => fil).length;
        // if same count, randomize
        if (nextActive === firstActive) return 0.5 - Math.random();
        // or sort by
        return nextActive > firstActive ? 1 : -1;
      });
    const selectedMemberCount = membersWithFilters.filter(
      (mem) =>
        mem.focus.filter((fil) => fil.active).length > 0 ||
        mem.industry.filter((fil) => fil.active).length > 0 ||
        mem.experienceFilter.filter((fil) => fil.active).length > 0 ||
        mem.regionFilter.filter((fil) => fil.active).length > 0,
    ).length;
    setMembersCount(selectedMemberCount ? selectedMemberCount : members.length);
    setMembers(membersWithFilters);
  }, [focuses, industries, experiences, regions]);

  const setListItemActive = (
    list?: PickerFilter[],
    setList?: Function,
    id?: string,
  ) => {
    setList(
      list.map((fil) => ({
        ...fil,
        active: id ? (id === fil.id ? !fil?.active : fil?.active) : false,
      })),
    );
  };

  const handleFilter = (id?: string) => {
    let filter = filtersList.filter((foc) => id === foc?.id)[0];
    setListItemActive(filtersList, setFiltersList, id);
    setListItemActive(focuses, setFocuses, id);
    setListItemActive(industries, setIndustries, id);
    setListItemActive(experiences, setExperiences, id);
    setListItemActive(regions, setRegions, id);
    if (activeFilters.find((item) => item.id === id)) {
      setActiveFilters(activeFilters.filter((item) => item?.id !== id));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const filterSelect = (filterType?: string) => {
    if (viewAll) setViewAll(false);
    const filterMap = {
      focus: focuses,
      industry: industries,
      experience: experiences,
      region: regions,
    };
    setFiltersList(filterMap[filterType]);
  };

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav />
      <div className="pt-[26vh]">
        <Title text="Hawaiians*in&nbsp;Technology" className="px-4 lg:px-8" />
        {focuses && (
          <FilterPicker
            filtersList={filtersList}
            activeFilters={activeFilters}
            onFilterClick={handleFilter}
            onFilterSelect={filterSelect}
            onViewAll={() => {
              setFiltersList(focuses);
              setViewAll(false);
            }}
            selectedMemberCount={membersCount}
            viewAll={viewAll}
          />
        )}
      </div>
      {members && <MemberDirectory members={members} />}
    </>
  );
}
