import HitLogo from "@/components/HitLogo";
import { Icon, IconAsset, IconColor } from "@/components/icon/icon";
import { SignInTypeImgEnum, SignInTypeNameEnum } from "@/lib/enums";
import { signOut } from "@/lib/firebase";
import Link from "next/link";
import Button, { ButtonSize, ButtonVariant } from "./Button";

export interface SignInProps {
  type_image: SignInTypeImgEnum;
  type_name: SignInTypeNameEnum;
  name: string;
}

interface NavProps {
  backUrl?: string;
  children?: React.ReactNode;
  primaryNav?: {
    show?: boolean;
  };
  signedIn?: SignInProps;
}

export default function Nav({
  backUrl,
  children,
  primaryNav,
  signedIn,
}: NavProps) {
  let logo = <HitLogo inline />;
  if (backUrl) {
    logo = (
      <a
        href={"/"}
        className="transition-transform hover:scale-105 active:scale-95"
      >
        {logo}
      </a>
    );
  }
  return (
    <header className="flex w-full items-center justify-between gap-4 p-4 sm:pl-8">
      <nav className="flex items-center">
        {backUrl ? (
          <Link href={backUrl} shallow={true}>
            <div className="transition-transform hover:scale-105 active:scale-95">
              <Icon asset={IconAsset.CaretLeft} color={IconColor.Inherit} />
            </div>
          </Link>
        ) : null}
        {primaryNav?.show ? (
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-8">
            <Link
              className="text-base font-medium text-stone-700"
              href="/about"
            >
              About
            </Link>
            <Link
              className={`
                  rounded-lg
                  border-4
                  border-tan-300
                  bg-tan-300
                  px-2
                  py-0.5
                  text-base
                  font-medium
                  text-stone-700
                  transition-all
                  hover:scale-105
                  hover:border-brown-700/80
                  hover:bg-brown-600
                  hover:text-white
                  active:scale-95
                  sm:px-4
                  sm:py-2
                `}
              href="/join/01-you"
            >
              Join the list
            </Link>
            <Link className="text-base font-medium text-stone-700" href="/edit">
              Request Changes
            </Link>
            <Link href="/hackathon" className="font-script text-2xl">
              Hackathon
            </Link>
          </div>
        ) : null}
      </nav>
      {signedIn?.name ? (
        <div className="ml-12 flex items-center justify-center text-xs text-green-600">
          Signed in with
          <img
            src={signedIn.type_image}
            alt="sign in type"
            className="ml-1 mr-1 h-4"
          />
          {signedIn.type_name} as {signedIn.name}
          <div className="ml-2">
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.ExtraSmall}
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      ) : null}
      {children ? <div>{children}</div> : null}
      {logo}
    </header>
  );
}
