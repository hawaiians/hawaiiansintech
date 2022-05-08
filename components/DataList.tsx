import theme from "styles/theme";

interface DataListProps {
  children: React.ReactNode;
  mainEventLogistics?: boolean;
  gap: string;
}

export function DataList({ children, mainEventLogistics, gap }: DataListProps) {
  return (
    <div className="data-list">
      {children}
      <style jsx>{`
        .data-list {
          display: flex;
          flex-wrap: wrap;
          grid-auto-flow: column;
          grid-auto-rows: 1fr;
          gap: ${gap};
          margin: ${mainEventLogistics ? "3rem auto 0" : "1.5rem auto 0"};
          padding: 0 1rem;
        }
        @media screen and (min-width: ${theme.layout.breakPoints.small}) {
          .data-list {
            padding: 0 2rem;
            margin: ${mainEventLogistics ? "3rem auto 0" : "0rem auto 0"};
          }
        }
      `}</style>
    </div>
  );
}

interface DataListItemProps {
  heading?: string;
  mainEventLogistics?: boolean;
  subHeading?: string;
  subHeadingLight?: boolean;
  children?: React.ReactNode;
  translation?: string;
}

export function DataListItem({
  heading,
  mainEventLogistics,
  children,
  subHeading,
  subHeadingLight,
  translation,
}: DataListItemProps) {
  return (
    <div className="data-list-item">
      <h3>{heading}</h3>
      <h4>{translation}</h4>
      <h5>{subHeading}</h5>
      <p>{children}</p>
      <style jsx>{`
        .data-list-item {
          max-width: ${mainEventLogistics ? "20rem" : "25rem"};
        }
        h3,
        h4,
        h5,
        p {
          margin: 0;
        }
        h3 {
          font-weight: 600;
          font-size: 1.25rem;
        }
        h4 {
          font-size: 1rem;
          font-style: italic;
          font-weight: 400;
          color: ${theme.color.brand.faded};
          margin-bottom: 0.25rem;
        }
        h5 {
          font-size: 0.8rem;
          color: ${theme.color.text.alt2};
          font-weight: ${subHeadingLight ? "400" : "600"};
        }
        p {
          color: ${mainEventLogistics
            ? theme.color.brand.base
            : theme.color.text.alt2};
          font-weight: 500;
          font-size: ${mainEventLogistics ? "1.25rem" : "1rem"};
        }
        @media screen and (min-width: ${theme.layout.breakPoints.small}) {
          .data-list-item {
            max-width: ${mainEventLogistics ? "20rem" : "16rem"};
          }
          h3 {
            font-size: ${mainEventLogistics ? "1.5rem" : "1.25rem"};
          }
          h4 {
            font-size: 1.125rem;
          }
          h5 {
            font-size: 1rem;
          }
          p {
            ${mainEventLogistics ? "2rem" : "1.25rem"}
          }
        }
      `}</style>
    </div>
  );
}
