import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminFilter from "@/components/admin/FilterEditor";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import { DocumentData, MemberEmail, MemberPublic } from "@/lib/api";
import {
  CompanySizeEnum,
  FirebaseTablesEnum,
  StatusEnum,
  YearsOfExperienceEnum,
} from "@/lib/enums";
import { User } from "firebase/auth";
import { convertStringSnake, useEmailCloaker } from "helpers";
import { ExternalLink, Trash } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";

export const MemberEdit: FC<{
  member: MemberPublic;
  regions?: DocumentData[];
  onClose?: () => void;
  onDelete?: () => void;
  user?: User;
}> = ({ member, regions, onClose, onDelete, user }) => {
  const [email, setEmail] = useState<MemberEmail>(null);
  const [loadingEmail, setLoadingEmail] = useState<boolean>(null);
  const [originalEmail, setOriginalEmail] = useState<string>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [name, setName] = useState<string>(member.name);
  const [title, setTitle] = useState<string>(member.title);
  const [link, setLink] = useState<string>(member.link);
  const [location, setLocation] = useState<string>(member.location);
  const [region, setRegion] = useState<string>(member.region);
  const [companySize, setCompanySize] = useState<string>(member.companySize);
  const [yearsOfExperience, setYearsOfExperience] = useState<string>(
    member.yearsExperience,
  );
  const [status, setStatus] = useState<StatusEnum>(member.status);
  const [unsubscribed, setUnsubscribed] = useState<boolean>(
    member.unsubscribed,
  );
  const [focuses, setFocuses] = useState<
    { name: string; id: string }[] | string[]
  >(member.focus);
  const [suggestedFocus, setSuggestedFocus] = useState<string>(null);
  const [industries, setIndustries] = useState<
    { name: string; id: string }[] | string[]
  >(member.industry);
  const [suggestedIndustry, setSuggestedIndustry] = useState<string>(null);
  const getRegionIdFromName = (name: string): string => {
    const region = regions.find((r) => r.fields.name === name);
    if (!region) {
      return null;
    }
    return region.id;
  };

  const fetchEmailById = async () => {
    const response = await fetch(`/api/get-email-by-id?id=${member.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
    });
    const data = await response.json();
    return data.email;
  };

  const handleManageEmail = async () => {
    if (email === null) {
      setLoadingEmail(true);
      await fetchEmailById().then((email) => {
        if (!email) {
          // TODO: handle error
          // this seems to fire occasionally when the email is not found
          setLoadingEmail(false);
          return;
        }
        setOriginalEmail(email.email);
        setEmail(email);
        setLoadingEmail(false);
      });
    } else {
      setEmail(null);
    }
  };

  const updateMember = async (memberPublic: MemberPublic) => {
    const response = await fetch("/api/update-member", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify({
        memberPublic: memberPublic,
        currentUser: user.displayName || user.uid,
      }),
    });
    if (!response.ok) {
      return response.json().then((err) => {
        throw new Error(
          `Error updating ${memberPublic.name} in firebase: err.message`,
        );
      });
    }
    console.log(`✅ updated ${memberPublic.name} in firebase`);
    return response;
  };

  const updateSecureEmail = async (uid: string, email: string) => {
    const response = await fetch("/api/update-secure-email-by-id", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify({
        uid: uid,
        email: email,
        currentUser: user.displayName || user.uid,
      }),
    });
    if (response.status !== 200) {
      throw new Error(`Error updating email for ${uid}`);
    }
    console.log(`✅ updated email in firebase for ${uid}`);
    return response;
  };

  const saveChanges = async () => {
    const emailChanged: boolean = email?.email && email.email !== originalEmail;
    const updatedMember: MemberPublic = {
      ...member,
      companySize: companySize,
      emailAbbr: emailChanged ? useEmailCloaker(email.email) : member.emailAbbr,
      focus: focuses,
      focusSuggested: suggestedFocus,
      industry: industries,
      industrySuggested: suggestedIndustry,
      link: link,
      location: location,
      name: name,
      region: !regions.find((r) => r.id === region)
        ? getRegionIdFromName(region)
        : region,
      status: status,
      title: title,
      unsubscribed: unsubscribed,
      yearsExperience: yearsOfExperience,
    };
    await updateMember(updatedMember);
    emailChanged && (await updateSecureEmail(member.id, email.email));
    window.location.reload();
  };

  const mapTabsTriggerToVariant = (
    status: StatusEnum,
  ): "alert" | "success" | "nearSuccess" | "warn" => {
    switch (status) {
      case StatusEnum.APPROVED:
        return "success";
      case StatusEnum.IN_PROGRESS:
        return "nearSuccess";
      case StatusEnum.PENDING:
        return "warn";
      case StatusEnum.DECLINED:
        return "alert";
      default:
        return;
    }
  };

  return (
    <div>
      {isDeleting ? (
        <>
          <h2 className="text-2xl font-semibold">Delete Member</h2>
          <p className="text-xl font-light text-secondary-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-stone-700">{member.name}</span>{" "}
            and all data associated with them?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
              }}
            >
              Remove Permanently
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleting(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Tabs
            defaultValue={member.status}
            onValueChange={(value) => {
              setStatus(value as StatusEnum);
            }}
            // value={tabVisible}
            className="col-span-2"
          >
            <TabsList loop className="w-full">
              {Object.values(StatusEnum)
                .filter((status) => status !== StatusEnum.DECLINED)
                .map((status, i) => (
                  <TabsTrigger
                    value={status}
                    key={`directory-status-${i}`}
                    variant={mapTabsTriggerToVariant(status)}
                    // size="sm"
                  >
                    {convertStringSnake(status)}
                  </TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
          <div className="col-span-2 flex flex-col items-start gap-1">
            <h2
              className={`text-sm font-semibold ${
                name !== member.name && "text-brown-600"
              }`}
            >
              Name
            </h2>
            <Input
              name={"usernamef"}
              value={name}
              className={name !== member.name && "text-brown-600"}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          <div className="col-span-2 flex flex-col items-start gap-1">
            <h2
              className={`text-sm font-semibold ${
                title !== member.title && "text-brown-600"
              }`}
            >
              Title
            </h2>
            <Input
              name={"title"}
              value={title}
              className={title !== member.title && "text-brown-600"}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </div>
          <div className="col-span-2 flex flex-col items-start gap-1">
            <div className="flex w-full items-center">
              <h2
                className={`grow text-sm font-semibold ${
                  link !== member.link && "text-brown-600"
                }`}
              >
                Website / Link
              </h2>
              <Link href={link} target="_blank" referrerPolicy="no-referrer">
                <ExternalLink className="h-4 w-4 text-primary" />
              </Link>
            </div>
            <Input
              name={"link"}
              value={link}
              className={link !== member.link && "text-brown-600"}
              onChange={(e) => {
                setLink(e.target.value);
              }}
            />
          </div>
          <div className="relative col-span-2 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="grow text-sm font-semibold">Email</h2>
              {loadingEmail && (
                <LoadingSpinner
                  variant={LoadingSpinnerVariant.Invert}
                  className="h-4 w-4 border-2"
                />
              )}
              {!email && (
                <button
                  className="text-xs font-medium text-primary"
                  onClick={handleManageEmail}
                >
                  Update
                </button>
              )}
            </div>
            <div className="relative flex flex-col gap-2">
              <Input
                name="email"
                className={
                  email && email.email !== originalEmail && "text-brown-600"
                }
                disabled={email === null}
                value={email?.email || member.emailAbbr}
                onChange={(e) => {
                  let newEmail = { ...email };
                  newEmail.email = e.target.value;
                  setEmail(newEmail);
                }}
              />
              {email ? (
                <>
                  <section className="flex items-start gap-2">
                    <Checkbox
                      id="subscribed"
                      checked={!unsubscribed}
                      onCheckedChange={(e) => {
                        setUnsubscribed(!e);
                      }}
                      defaultChecked
                    />
                    <div className="text-xs leading-relaxed">
                      <label
                        htmlFor="subscribed"
                        className="font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Subscribed
                      </label>
                      <p className="leading-relaxed text-secondary-foreground">
                        Members opt out of emails during sign-up and/or using
                        unsubscribe links.
                      </p>
                    </div>
                  </section>
                  <section className="flex items-start gap-2">
                    <Checkbox disabled id="verified" />
                    <div className="text-xs leading-relaxed">
                      <label
                        htmlFor="verified"
                        className="font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70 opacity-40"
                      >
                        Verified (to be implemented)
                      </label>
                      <p className="leading-relaxed text-secondary-foreground opacity-50">
                        Members verify their email address by replying or
                        authenticating.
                      </p>
                    </div>
                  </section>
                </>
              ) : (
                <div className="absolute right-0 top-1/2 flex grow -translate-y-1/2 gap-0.5 pr-2 opacity-80">
                  <Badge variant="secondary">Verified</Badge>
                  {member.unsubscribed ? (
                    <Badge variant="destructive">Unsubscribed</Badge>
                  ) : (
                    <Badge variant="secondary">Subscribed</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* <div className="flex items-start gap-x-2">
            <Checkbox id="verified" checked={true} />
            <div className="flex gap-1 leading-none">
              <label
                htmlFor="verified"
                className="flex flex-col text-xs font-semibold leading-none text-secondary-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Verified
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-secondary-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Confirmed ownership of email (through reply or
                      authentication)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex items-start gap-x-2">
            <Checkbox id="subscribed" checked={member.unsubscribed} />
            <div className="flex gap-1 leading-none">
              <label
                htmlFor="subscribed"
                className="flex flex-col text-xs font-semibold leading-none text-secondary-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Unsubscribed
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-secondary-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Opted-out during sign-up or requested directly</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div> */}

          <div className="flex flex-col items-start gap-1">
            <h2
              className={`text-sm font-semibold ${
                location !== member.location && "text-brown-600"
              }`}
            >
              Location
            </h2>
            <Input
              name={"location"}
              value={location}
              className={location !== member.location && "text-brown-600"}
              onChange={(e) => {
                setLocation(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="flex w-full items-center">
              <h2
                className={`grow text-sm font-semibold ${
                  region !== member.region && "text-brown-600"
                }`}
              >
                Region
              </h2>
              <Popover>
                <PopoverTrigger>
                  <h2 className="text-xs font-medium text-primary">Add</h2>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="end"
                  className="flex flex-col gap-1"
                >
                  <Input placeholder="Region" autoFocus />
                  {/* HERE */}
                  <Button size="sm">Add Region</Button>
                </PopoverContent>
              </Popover>
            </div>
            <Select
              defaultValue={getRegionIdFromName(member.region)}
              onValueChange={(e) => {
                setRegion(e);
              }}
            >
              <SelectTrigger
                className={region !== member.region && "text-brown-600"}
              >
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {regions?.map((region) => (
                  <SelectItem value={region.id} key={region.fields.id}>
                    {region.fields.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h2
              className={`text-sm font-semibold ${
                yearsOfExperience !== member.yearsExperience && "text-brown-600"
              }`}
            >
              Years of Experience
            </h2>
            <Select
              defaultValue={member.yearsExperience}
              onValueChange={(e) => {
                setYearsOfExperience(e);
              }}
            >
              <SelectTrigger
                className={
                  yearsOfExperience !== member.yearsExperience &&
                  "text-brown-600"
                }
              >
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {Object.values(YearsOfExperienceEnum).map((year, i) => (
                  <SelectItem value={year} key={`years-exerience-${year}`}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-start gap-1">
            <h2
              className={`text-sm font-semibold ${
                companySize !== member.companySize && "text-brown-600"
              }`}
            >
              Company Size
            </h2>
            <Select
              defaultValue={member.companySize}
              onValueChange={(e) => {
                setCompanySize(e);
              }}
            >
              <SelectTrigger
                className={
                  companySize !== member.companySize && "text-brown-600"
                }
              >
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {Object.values(CompanySizeEnum).map((size, i) => (
                  <SelectItem value={size} key={`company-size-${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AdminFilter
            labels={{ singular: "Focus", plural: "Focuses" }}
            filterTable={FirebaseTablesEnum.FOCUSES}
            memberId={member.id}
            filters={focuses as { name: string; id: string; status: string }[]}
            setFilters={setFocuses}
            suggestedFilter={suggestedFocus}
            setSuggestedFilter={setSuggestedFocus}
          />
          <AdminFilter
            labels={{ singular: "Industry", plural: "Industries" }}
            filterTable={FirebaseTablesEnum.INDUSTRIES}
            memberId={member.id}
            filters={
              industries as { name: string; id: string; status: string }[]
            }
            setFilters={setIndustries}
            suggestedFilter={suggestedIndustry}
            setSuggestedFilter={setSuggestedIndustry}
          />

          <section>
            <h4 className="text-sm font-semibold">ID</h4>
            <p className="font-light text-secondary-foreground">{member.id}</p>
          </section>
          {member.lastModified && (
            <section>
              <h4 className="text-sm font-semibold">Last Modified</h4>
              <p className="font-light text-secondary-foreground">
                {member.lastModified}
              </p>
            </section>
          )}
          <div className="col-span-2 mt-2 flex flex-col gap-2 sm:flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsDeleting(true);
                    }}
                    size="sm"
                    disabled
                  >
                    <span className="flex items-center gap-2">
                      <Trash className="h-4 w-4" />
                      Archive
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Disabled · Read-only</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex grow justify-end">
              <Button onClick={saveChanges} size="sm">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
