import FilterPicker, { PickerFilter } from "@/components/filters/FilterPicker";
import MemberDirectory, { DirectoryMember } from "@/components/MemberDirectory";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { Title } from "@/components/Title";
import { FirebaseTablesEnum } from "@/lib/enums";
import Head from "next/head";
import React, { useEffect, useState, useCallback } from "react";
import { getMembers, getNumberOfMembers } from "@/lib/firebase-helpers/members";
import { getFilters } from "@/lib/firebase-helpers/filters";
import { filterLookup } from "@/lib/firebase-helpers/general";
import { mockGetMembersWithFilters } from "@/lib/firebase-helpers/stubApi";
import { ENV_CONFIG } from "@/lib/config/environment";
import { Input } from "@/components/ui/input";
import { Icon, IconAsset, IconSize } from "@/components/icon/icon";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import debounce from "lodash/debounce";

export async function getStaticProps() {
  const { members, focuses, industries, regions, experience, cursor } =
    ENV_CONFIG.useMockData
      ? mockGetMembersWithFilters({ limit: 25, includeFilters: true })
      : await getMembers({ paginated: true });

  // Use mock filter data if Firebase is not available
  // Otherwise, call the real getFilters functions
  const fetchedFocuses = ENV_CONFIG.useMockData
    ? focuses
    : await getFilters(
        FirebaseTablesEnum.FOCUSES,
        false,
        members.map((member) => member.id),
        focuses,
      );

  const fetchedIndustries = ENV_CONFIG.useMockData
    ? industries
    : await getFilters(
        FirebaseTablesEnum.INDUSTRIES,
        false,
        members.map((member) => member.id),
        industries,
      );

  const fetchedExperiences = ENV_CONFIG.useMockData
    ? experience
    : await getFilters(
        FirebaseTablesEnum.EXPERIENCE,
        false,
        members.map((member) => member.id),
      );

  const fetchedRegions = ENV_CONFIG.useMockData
    ? regions.filter((region) => region.count > 0)
    : (
        await getFilters(
          FirebaseTablesEnum.REGIONS,
          false,
          members.map((member) => member.id),
          regions,
        )
      ).filter((region) => region.count > 0);

  const fetchedTotalMemberCount = ENV_CONFIG.useMockData
    ? members.length
    : await getNumberOfMembers();

  return {
    props: {
      fetchedMembers: members,
      fetchedMembersCursor: cursor || null,
      fetchedFocuses,
      fetchedIndustries,
      fetchedExperiences,
      fetchedRegions,
      fetchedTotalMemberCount,
      pageTitle: "Hawaiians in Tech",
    },
    revalidate: 60,
  };
}

const transformMemberData = (member: DirectoryMember) => ({
  ...member,
  focus: member.focus
    ? member.focus.map((item) => ({ ...item, active: false }))
    : [],
  industry: member.industry
    ? member.industry.map((item) => ({ ...item, active: false }))
    : [],
  experienceFilter: member.experience
    ? member.experience.map((item) => ({ ...item, active: false }))
    : [],
  regionFilter: member.regions
    ? member.regions.map((item) => ({ ...item, active: false }))
    : [],
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
  const [canLoadMoreMembers, setCanLoadMoreMembers] = useState(true);
  const [loadingFilteredMembers, setLoadingFilteredMembers] = useState(false);
  const [nameSearchQuery, setNameSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  useEffect(() => {
    // Skip filter processing when searching
    if (isSearching) {
      return;
    }

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
        experienceFilter: mem.experienceFilter?.map((exp) => ({
          ...exp,
          active: activeFilters.map((item) => item.id).includes(exp.id),
        })),
        regionFilter: mem.regionFilter?.map((reg) => ({
          ...reg,
          active: activeFilters.map((item) => item.id).includes(reg.id),
        })),
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
  }, [focuses, industries, experiences, regions, isSearching]);

  const setListItemActive = (
    list?: PickerFilter[],
    setList?: (list: PickerFilter[]) => void,
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
    const newMembers = {};
    for (const member of members) {
      const memberData = {
        ...member,
        focus: filterLookup(focuses, member.focus),
        industry: filterLookup(industries, member.industry),
        experience: filterLookup(experiences, member.experience),
        regions: filterLookup(regions, member.regions),
      };
      newMembers[member.id] = memberData;
    }
    return Object.values(newMembers).map(transformMemberData);
  };

  const handleClearNameSearch = async () => {
    setNameSearchQuery("");
    setIsSearching(false);
    setCanLoadMoreMembers(true);

    // Reset to initial state
    const initialTransformedMembers = fetchedMembers.map(transformMemberData);
    setMembers(initialTransformedMembers);
    setMembersIdSet(
      new Set(initialTransformedMembers.map((member) => member.id)),
    );
    setMembersCount(initialTransformedMembers.length);
    setMembersCursor(fetchedMembersCursor);
    setFiltersList(focuses.slice(0, 6));
  };

  const debouncedNameSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.trim() === "") {
        // Reset to initial state when query is empty
        setNameSearchQuery("");
        setIsSearching(false);
        setCanLoadMoreMembers(true);
        const initialTransformedMembers =
          fetchedMembers.map(transformMemberData);
        setMembers(initialTransformedMembers);
        setMembersIdSet(
          new Set(initialTransformedMembers.map((member) => member.id)),
        );
        setMembersCount(initialTransformedMembers.length);
        setMembersCursor(fetchedMembersCursor);
        setFiltersList(focuses.slice(0, 6));
        return;
      }

      setIsSearching(true);
      setLoadingFilteredMembers(true);

      // Clear all active filters when searching
      setFocuses((prev) => prev.map((f) => ({ ...f, active: false })));
      setIndustries((prev) => prev.map((f) => ({ ...f, active: false })));
      setExperiences((prev) => prev.map((f) => ({ ...f, active: false })));
      setRegions((prev) => prev.map((f) => ({ ...f, active: false })));
      setActiveFilters([]);
      setFiltersList(focuses.slice(0, 6));

      try {
        let searchResults = [];

        if (ENV_CONFIG.useMockData) {
          const { mockGetMembers } = await import(
            "@/lib/firebase-helpers/stubApi"
          );
          const allMockMembers = mockGetMembers(100);
          const queryLower = query.toLowerCase();
          searchResults = allMockMembers.filter((member) =>
            member.name?.toLowerCase().includes(queryLower),
          );
          searchResults = searchResults.map(transformMemberData);
        } else {
          const response = await fetch(
            `/api/members?nameSearchQuery=${encodeURIComponent(query)}&withoutFilters=true`,
          );
          const data = await response.json();
          // Transform members for search results
          const newMembers = {};
          for (const member of data.members) {
            const memberData = {
              ...member,
              focus: filterLookup(focuses, member.focus),
              industry: filterLookup(industries, member.industry),
              experience: filterLookup(experiences, member.experience),
              regions: filterLookup(regions, member.regions),
            };
            newMembers[member.id] = memberData;
          }
          searchResults = Object.values(newMembers).map(transformMemberData);
        }

        setMembers(searchResults);
        setMembersIdSet(new Set(searchResults.map((member) => member.id)));
        setMembersCount(searchResults.length);
        setCanLoadMoreMembers(false);
      } catch (error) {
        console.error("Error searching members:", error);
      } finally {
        setLoadingFilteredMembers(false);
      }
    }, 400),
    [fetchedMembers, fetchedMembersCursor, focuses],
  );

  const handleNameSearch = (query: string) => {
    debouncedNameSearch(query);
  };

  const handleFilter = async (id?: string) => {
    const filter = filtersList.filter((foc) => id === foc?.id)[0];
    const membersToLoad =
      filter?.members?.filter((memberId) => !membersIdSet.has(memberId)) ?? [];

    if (membersToLoad.length > 0) {
      setLoadingFilteredMembers(true);
      let allTransformedMembers = [];

      if (ENV_CONFIG.useMockData) {
        const { mockGetMembers } = await import(
          "@/lib/firebase-helpers/stubApi"
        );
        const allMockMembers = mockGetMembers(100);
        const requestedMembers = allMockMembers.filter((member) =>
          membersToLoad.includes(member.id),
        );
        allTransformedMembers = requestedMembers.map(transformMemberData);
      } else {
        const batchSize = 25; // TODO: align batchSize with limit var in getMembers
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
    if (!canLoadMoreMembers) return;
    setLoadingMoreMembers(true);
    try {
      let membersNotInList = null;

      if (ENV_CONFIG.useMockData) {
        const { mockGetMembers } = await import(
          "@/lib/firebase-helpers/stubApi"
        );
        const allMockMembers = mockGetMembers(100);

        const currentIndex = membersCursor
          ? allMockMembers.findIndex((m) => m.id === membersCursor)
          : -1;

        const startIndex = currentIndex + 1;
        const endIndex = Math.min(startIndex + 25, allMockMembers.length);
        const nextBatch = allMockMembers.slice(startIndex, endIndex);

        membersNotInList = nextBatch.filter(
          (member) => !membersIdSet.has(member.id),
        );

        const newCursor =
          nextBatch.length > 0 ? nextBatch[nextBatch.length - 1].id : null;
        setMembersCursor(newCursor);
        setCanLoadMoreMembers(endIndex < allMockMembers.length);
      } else {
        while (!membersNotInList) {
          const response = await fetch(
            `/api/members?cursor=${membersCursor}&withoutFilters=true`,
          );
          const data = await response.json();
          if (!data.members || !Array.isArray(data.members)) {
            console.error("Invalid response from API:", data);
            setCanLoadMoreMembers(false);
            return;
          }

          membersNotInList = data.members.filter(
            (member) => !membersIdSet.has(member.id),
          );
          setMembersCursor(data.cursor);
          setCanLoadMoreMembers(data.hasMore);
        }
      }

      let transformedMembers;
      if (ENV_CONFIG.useMockData) {
        transformedMembers = membersNotInList.map(transformMemberData);
      } else {
        transformedMembers = await handleFetchedMembers(membersNotInList);
      }

      setMembers((prevMembers) => [...prevMembers, ...transformedMembers]);
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
      <div className="pt-[26vh]">
        <Title text="Hawaiians*in&nbsp;Technology" className="px-4 lg:px-8" />
        <div className="px-4 lg:px-8">
          <div className="relative mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search by name..."
                value={nameSearchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setNameSearchQuery(value);
                  handleNameSearch(value);
                }}
                className="w-full"
              />
              {nameSearchQuery && (
                <button
                  onClick={handleClearNameSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-tan-300/50"
                  aria-label="Clear search"
                >
                  <Icon asset={IconAsset.Close} size={IconSize.Small} />
                </button>
              )}
            </div>
            {loadingFilteredMembers && isSearching && (
              <LoadingSpinner variant={LoadingSpinnerVariant.Invert} />
            )}
          </div>
        </div>
        {focuses && (
          <FilterPicker
            filtersList={filtersList}
            activeFilters={activeFilters}
            onFilterClick={handleFilter}
            onFilterSelect={filterSelect}
            totalMemberCount={fetchedTotalMemberCount}
            isLoading={loadingFilteredMembers}
            onViewAll={() => {
              setFiltersList(focuses);
              setViewAll(false);
            }}
            selectedMemberCount={isSearching ? membersCount : membersCount}
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
