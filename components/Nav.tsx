import HitLogo from "@/components/HitLogo";
import { Icon, IconAsset, IconColor } from "@/components/icon/icon";
import Link from "next/link";
import { cssHelperButtonReset } from "styles/global";
import theme from "styles/theme";

interface NavProps {
  backUrl?: string;
  children?: React.ReactNode;
  primaryNav?: {
    show?: boolean;
  };
  toggle?: {
    byline?: string;
    headline?: string;
    onClick?: (any) => void;
    show?: boolean;
  };
}

export default function Nav({
  backUrl,
  children,
  primaryNav,
  toggle,
}: NavProps) {
  return (
    <header className="nav">
      <nav className="nav__menu">
        <div style={{ display: "flex", alignItems: "center" }}>
          {backUrl ? (
            <Link href={backUrl} shallow={true}>
              <div className="back-link">
                <Icon asset={IconAsset.CaretLeft} color={IconColor.Inherit} />
              </div>
            </Link>
          ) : null}
          {primaryNav?.show ? (
            <div className="nav__links">
              <Link href="/about">
                <div className="nav-link">About</div>
              </Link>
              <Link href="/join/01-you">
                <div className="primary-link">Join the list</div>
              </Link>
              <Link href="/edit">
                <div className="nav-link">Request Changes</div>
              </Link>
              <Link href="/hackathon">
                <div className="hackathon-link">Hackathon</div>
              </Link>
            </div>
          ) : null}
          {toggle?.show && (
            <NavToggle
              byline={toggle?.byline || "On the List?"}
              headline={toggle?.headline || "Request Changes"}
              toggleEdit={toggle?.onClick}
            />
          )}
        </div>
      </nav>
      {children ? <div className="nav__main">{children}</div> : null}
      <div className="nav__logo">
        <HitLogo inline />
      </div>
      <style jsx>{`
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 1rem;
          column-gap: 0.5rem;
        }
        @media screen and (min-width: ${theme.layout.breakPoints.small}) {
          .nav {
            padding-left: 2rem;
          }
        }
        .nav__links {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.25rem 2rem;
          padding: 0 0.5rem;
        }
        @media screen and (min-width: ${theme.layout.breakPoints.small}) {
          .nav__links {
            gap: 0 2rem;
          }
        }
        .nav-link {
          padding: 0.25rem;
          color: ${theme.color.text.base};
        }
        .nav-link:hover {
          color: ${theme.color.brand.base};
        }
        .nav-link span {
          color: ${theme.color.brand.base};
          opacity: 0.5;
          padding: 0 0.125rem;
        }
        .primary-link {
          background: ${theme.color.background.alt};
          color: ${theme.color.text.base};
          padding: 0.5rem 0.75rem;
          border-radius: ${theme.borderRadius.xs};
          border: 0.25rem solid transparent;
          transition: all 70ms ease-out;
        }
        .primary-link:hover,
        .primary-link:active {
          transform: scale(1.05);
          color: ${theme.color.text.overlay.base};
          background: ${theme.color.brand.base};
          border-color: ${theme.color.brand.alt};
        }
        .primary-link:active {
          transform: scale(1);
        }
        .hackathon-link {
          font-family: ${theme.fontFamily.hackathon};
          font-size: 1.5rem;
        }
        .back-link {
          display: block;
          border-radius: ${theme.borderRadius.sm};
          color: ${theme.color.text.alt};
          padding: 0.25rem;
          margin-right: 2rem;
          transition: all 70ms ease-out;
        }
        .back-link:hover,
        .back-link:focus {
          color: ${theme.color.brand.base};
          transform: scale(1.25);
        }
        .back-link:active {
          transform: scale(1);
          color: ${theme.color.brand.alt};
        }
        button {
          ${cssHelperButtonReset}
          background: ${theme.color.background.base};
          border-radius: ${theme.borderRadius.lg};
        }
        span {
          flex-shrink: 0;
        }
      `}</style>
    </header>
  );
}

interface NavToggleProps {
  headline: string;
  byline: string;
  toggleEdit?: (any) => void;
}

export function NavToggle({ byline, headline, toggleEdit }: NavToggleProps) {
  return (
    <button onClick={toggleEdit}>
      <h4>{byline}</h4>
      <h3>{headline}</h3>
      <style jsx>{`
        button {
          ${cssHelperButtonReset}
          display: block;
          text-align: initial;
          background: ${theme.color.background.alt};
          padding: 0.5rem 1rem;
          border-radius: ${theme.borderRadius.sm};
          border: transparent 0.25rem solid;
          transition: all 70ms ease-out;
        }
        button:hover,
        button:active {
          transform: scale(1.05);
          color: ${theme.color.text.overlay};
          background: ${theme.color.brand.base};
          border-color: ${theme.color.brand.alt};
        }
        button:active {
          transform: scale(1);
        }
        h3,
        h4 {
          margin: 0;
          white-space: nowrap;
          transition: color 70ms ease-out;
        }
        h3 {
          font-size: 1rem;
          color: ${theme.color.text.alt};
        }
        h4 {
          font-weight: 500;
          font-size: 0.875rem;
          color: ${theme.color.text.alt3};
        }

        button:hover h3,
        button:active h3 {
          color: ${theme.color.text.overlay.base};
        }
        button:hover h4,
        button:active h4 {
          color: ${theme.color.text.overlay.alt};
        }
      `}</style>
    </button>
  );
}
