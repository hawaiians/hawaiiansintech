import theme from "styles/theme";
import { toKebab } from "../../helpers";
import { cssHelperButtonReset } from "../../styles/global";

export enum SelectableVariant {
  Primary = "primary",
  Alt = "alt",
}

export enum SelectableSize {
  Small = "primary",
  Default = "default",
  Large = "large",
}

interface SelectableProps {
  badgeNumber?: string | number;
  border?: boolean;
  byline?: string;
  centered?: boolean;
  disabled?: boolean;
  gridSpan?: number;
  fullWidth?: boolean;
  headline: string;
  onClear?: (e: React.MouseEvent) => any;
  onClick?: (e: React.MouseEvent) => any;
  selected?: boolean;
  size?: SelectableSize;
  value?: string;
  variant?: SelectableVariant;
}

export default function Selectable({
  badgeNumber,
  byline,
  centered,
  disabled,
  gridSpan,
  headline,
  onClick,
  onClear,
  fullWidth,
  selected,
  size = SelectableSize.Small,
  value,
  variant = SelectableVariant.Primary,
}: SelectableProps) {
  const headlineKebab = value ? toKebab(headline) : undefined;
  return (
    <button
      id={value || headlineKebab}
      value={value || headlineKebab}
      onClick={onClick}
      tabIndex={disabled ? -1 : undefined}
      type="button"
      style={gridSpan ? { gridColumn: `span ${gridSpan}` } : {}}
      disabled={disabled}
    >
      <h4>{headline}</h4>
      {byline ? <h6>{byline}</h6> : null}
      {badgeNumber ? <span>{badgeNumber}</span> : null}
      {onClear ? <span onClick={onClear}>×</span> : null}
      <style jsx>{`
        button {
          ${cssHelperButtonReset}
          display: flex;
          align-items: ${centered ? "center" : "flex-end"};
          position: relative;
          border: 0.25rem solid transparent;
          overflow-wrap: anywhere;
          line-height: 120%;
          margin: 0;
          height: 100%;
          border-radius: ${size === SelectableSize.Small
            ? theme.borderRadius.sm
            : theme.borderRadius.md};
          text-align: ${centered ? "center" : "left"};
          padding: ${size === SelectableSize.Small
            ? "0.25rem 0.5rem"
            : size === SelectableSize.Large
            ? "0.5rem 0.75rem"
            : "0.5rem 0.75rem"};
          transition: background 150ms ease-out;
          background: ${selected
            ? variant === SelectableVariant.Alt
              ? theme.color.border.alt2
              : theme.color.brand.base
            : variant === SelectableVariant.Alt
            ? theme.color.border.alt
            : theme.color.border.base};
          border-color: ${selected
            ? variant === SelectableVariant.Alt
              ? theme.color.border.alt3
              : theme.color.brand.alt
            : "transparent"};
          width: ${fullWidth ? "100%" : "initial"};
          opacity: ${disabled ? "0.5" : "initial"};
          cursor: ${disabled ? "not-allowed" : "pointer"};
        }
        button:after {
          content: "";
          display: ${variant === SelectableVariant.Alt ? "none" : "block"};
          align-self: flex-end;
          width: 1rem;
          height: 1rem;
          margin-left: 0.5rem;
          border-radius: ${theme.borderRadius.xs};
          flex-shrink: 0;
          border-style: ${variant === SelectableVariant.Alt ? "none" : "solid"};
          border-width: ${selected ? "0.35rem" : "0.2rem"};
          border-color: ${selected
            ? theme.color.brand.alt
            : theme.color.border.alt};
          background: ${selected && variant !== SelectableVariant.Alt
            ? "#fff"
            : "transparent"};
        }
        button:hover:not(:disabled) {
          border-color: ${selected
            ? variant === SelectableVariant.Alt
              ? theme.color.border.alt3
              : theme.color.brand.alt
            : variant === SelectableVariant.Alt
            ? theme.color.border.alt2
            : theme.color.border.alt};
        }
        button:focus {
          border-color: ${selected
            ? variant === SelectableVariant.Alt
              ? theme.color.border.alt2
              : theme.color.brand.alt
            : variant === SelectableVariant.Alt
            ? theme.color.border.alt3
            : theme.color.border.alt2};
          box-shadow: ${selected
            ? theme.elevation.two.brand
            : theme.elevation.two.desat};
        }
        h4 {
          flex-grow: 1;
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: ${selected ? theme.color.text.overlay.base : "initial"};
          transition: color 150ms ease-out;
        }
        h6 {
          margin: 0 0 0 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: ${selected
            ? theme.color.text.overlay.alt
            : theme.color.text.alt2};
        }
        span {
          position: absolute;
          top: 0;
          right: 0;
          transform: translate(0.7rem, -0.7rem);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 1.4rem;
          width: 1.4rem;
          border-radius: 0.7rem;
          line-height: 1;
          font-size: 0.8em;
          background: ${selected
            ? variant === SelectableVariant.Alt
              ? theme.color.border.alt3
              : theme.color.brand.alt
            : theme.color.border.alt2};
          color: ${theme.color.text.overlay.base};
        }
      `}</style>
    </button>
  );
}

interface SelectableGridProps {
  children?: React.ReactNode;
  columns?: number;
}

export function SelectableGrid({ children, columns = 3 }: SelectableGridProps) {
  return (
    <div className="selectable-grid">
      <div
        className="selectable-grid__container"
        style={{ gridTemplateColumns: `${"1fr ".repeat(columns)}` }}
      >
        {children}
      </div>
      <style jsx>{`
        .selectable-grid {
          background: ${theme.color.background.alt2};
          border-radius: ${theme.borderRadius.lg};
          padding: 0.5rem;
        }
        .selectable-grid__container {
          display: grid;
          grid-auto-rows: 1fr;
          grid-column-gap: 0.5rem;
          grid-row-gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
