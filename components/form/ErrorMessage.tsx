import theme from "styles/theme";
import ErrorNotifSVG from "../icon/ErrorNotifSVG";

export interface ErrorMessageProps {
  headline: string;
  body: string;
  textColor?: string;
}

export default function ErrorMessage({
  headline,
  body,
  textColor,
}: ErrorMessageProps) {
  return (
    <div className="error-message">
      <aside>
        <ErrorNotifSVG />
      </aside>
      <main>
        <h3>{headline}</h3>
        <h4>{body}</h4>
      </main>
      <style jsx>{`
        .error-message {
          background: ${theme.color.background.error};
          border-radius: 4px;
          padding: 1rem;
          display: flex;
        }
        aside {
          display: inline-flex;
        }
        main {
          margin-left: 1rem;
        }
        h3,
        h4 {
          margin: 0;
          color: ${textColor ? textColor : null};
        }
        h3 {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 120%;
        }
        h4 {
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 150%;
        }
      `}</style>

      <style jsx global>{`
        .error-message svg {
          height: 2rem;
          width: 2rem;
        }
        @media (min-width: 480px) {
          .error-message svg {
            height: 2rem;
            width: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
