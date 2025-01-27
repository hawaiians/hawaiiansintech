import FilterPicker, { PickerFilter } from "@/components/filters/FilterPicker";
import MemberDirectory, { DirectoryMember } from "@/components/MemberDirectory";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { Title } from "@/components/Title";
import { FirebaseTablesEnum } from "@/lib/enums";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { getMembers, getNumberOfMembers } from "@/lib/firebase-helpers/members";
import { getFilters, getFiltersBasic } from "@/lib/firebase-helpers/filters";
import { filterLookup } from "@/lib/firebase-helpers/general";

export async function getStaticProps() {
  const { members, focuses, industries, regions, cursor } = await getMembers({
    paginated: true,
  });

  return {
    props: {
      fetchedMembers: members,
      fetchedMembersCursor: cursor,
      fetchedFocuses: await getFilters(
        FirebaseTablesEnum.FOCUSES,
        false,
        members.map((member) => member.id),
        focuses,
      ),
      fetchedIndustries: await getFilters(
        FirebaseTablesEnum.INDUSTRIES,
        false,
        members.map((member) => member.id),
        industries,
      ),
      fetchedExperiences: await getFiltersBasic(members, "experience"),
      fetchedRegions: await getFiltersBasic(
        members,
        FirebaseTablesEnum.REGIONS,
        regions,
      ),
      fetchedTotalMemberCount: await getNumberOfMembers(),
      pageTitle: "Hawaiians in Tech",
    },
    revalidate: 60,
  };
}

const transformMemberData = (member: any) => ({
  ...member,
  focus: member.focus
    ? member.focus.map((item) => ({ ...item, active: false }))
    : [],
  industry: member.industry
    ? member.industry.map((item) => ({ ...item, active: false }))
    : [],
  experienceFilter: [],
  regionFilter: [],
});

export default function HomePage({
  fetchedMembers,
  fetchedMembersCursor,
  fetchedFocuses,
  fetchedIndustries,
  fetchedExperiences,
  fetchedRegions,
  fetchedTotalMemberCount,
  pageTitle,
}) {
  const [members, setMembers] = useState<DirectoryMember[]>(
    fetchedMembers.map(transformMemberData),
  );
  const [membersIdSet, setMembersIdSet] = useState<Set<string>>(
    new Set(members.map((member) => member.id)),
  );
  const [membersCursor, setMembersCursor] =
    useState<string>(fetchedMembersCursor);
  const [activeFilters, setActiveFilters] = useState<PickerFilter[]>([]);
  const [filtersList, setFiltersList] = useState<PickerFilter[]>(
    fetchedFocuses.slice(0, 6),
  );
  const [focuses, setFocuses] = useState<PickerFilter[]>(fetchedFocuses);
  const [industries, setIndustries] =
    useState<PickerFilter[]>(fetchedIndustries);
  const [experiences, setExperiences] =
    useState<PickerFilter[]>(fetchedExperiences);
  const [regions, setRegions] = useState<PickerFilter[]>(fetchedRegions);
  const [membersCount, setMembersCount] = useState<number>(members.length);
  const [viewAll, setViewAll] = useState<boolean>(true);
  const [loadingMoreMembers, setLoadingMoreMembers] = useState(false);
  const [loadingFilteredMembers, setLoadingFilteredMembers] = useState(false);

  // TODO: Refactor filter logic to allow for all filters to be selected
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

  const handleFetchedMembers = async (members) => {
    let newMembers = {};
    for (const member of members) {
      const memberData = {
        ...member,
        focus: filterLookup(focuses, member.focus),
        industry: filterLookup(industries, member.industry),
        experience: member.experience[0] ? member.region[0] : null,
        // TODO: Receive ID list instead and filter lookup
        // experience: filterLookup(experiences, member.yearsExperience),
        region: member.region[0] ? member.region[0] : null,
        // TODO: Receive ID list instead and filter lookup
        // region: filterLookup(regions, member.region),
      };
      newMembers[member.id] = memberData;
    }
    return Object.values(newMembers).map(transformMemberData);
  };

  const handleFilter = async (id?: string) => {
    let filter = filtersList.filter((foc) => id === foc?.id)[0];
    const membersToLoad = filter.members.filter(
      (memberId) => !membersIdSet.has(memberId),
    );
    if (membersToLoad.length > 0) {
      setLoadingFilteredMembers(true);
      const batchSize = 10;
      let allTransformedMembers = [];
      for (let i = 0; i < membersToLoad.length; i += batchSize) {
        const batch = membersToLoad.slice(i, i + batchSize);
        const response = await fetch(
          `/api/members?memberIds=${batch.join(",")}&withoutFilters=true`,
        );
        const data = await response.json();
        const transformedMembers = await handleFetchedMembers(data.members);
        allTransformedMembers = [
          ...allTransformedMembers,
          ...transformedMembers,
        ];
      }
      setMembers((prevMembers) => [...prevMembers, ...allTransformedMembers]);
      setMembersIdSet((prevMembersIdSet) => {
        const newMembersIdSet = new Set(prevMembersIdSet);
        membersToLoad.forEach((memberId) => newMembersIdSet.add(memberId));
        return newMembersIdSet;
      });
      setLoadingFilteredMembers(false);
    }
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

  const loadMoreMembers = async () => {
    setLoadingMoreMembers(true);
    try {
      // TODO: handle the case where there are no more members to load
      const response = await fetch(
        `/api/members?cursor=${membersCursor}&withoutFilters=true`,
      );

      const data = await response.json();
      console.log("data", data);
      // TODO: handle the case where there are no new members from the cursor
      const membersNotInList = data.members.filter(
        (member) => !membersIdSet.has(member.id),
      );
      const transformedMembers = await handleFetchedMembers(membersNotInList);
      // const transformedMembers = membersNotInList.map(transformMemberData);
      setMembers((prevMembers) => [...prevMembers, ...transformedMembers]);
      setMembersCursor(data.cursor);
      setMembersIdSet((prevMembersIdSet) => {
        const newMembersIdSet = new Set(prevMembersIdSet);
        membersNotInList.forEach((member) => newMembersIdSet.add(member.id));
        return newMembersIdSet;
      });
    } catch (error) {
      console.error("Error loading more members:", error);
    } finally {
      setLoadingMoreMembers(false);
    }
  };

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav />
      <div
        className={`
          px-4
          pt-[26vh]
          lg:px-8
        `}
      >
        <Title text="Hawaiians*in&nbsp;Technology" />
        {focuses && (
          <FilterPicker
            filtersList={filtersList}
            activeFilters={activeFilters}
            onFilterClick={handleFilter}
            onFilterSelect={filterSelect}
            totalMemberCount={fetchedTotalMemberCount}
            onViewAll={() => {
              setFiltersList(focuses);
              setViewAll(false);
            }}
            selectedMemberCount={membersCount}
            viewAll={viewAll}
          />
        )}
      </div>
      {members && (
        <MemberDirectory
          members={members}
          loadMoreMembers={loadMoreMembers}
          isLoadingMoreMembers={loadingMoreMembers}
          isLoadingFilteredMembers={loadingFilteredMembers}
        />
      )}
    </>
  );
}
