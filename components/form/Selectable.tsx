import { cn, toKebab } from "../../helpers";

export enum SelectableVariant {
  Checkbox = "checkbox",
  Blank = "blank",
}

interface SelectableProps {
  border?: boolean;
  centered?: boolean;
  disabled?: boolean;
  gridSpan?: number;
  fullWidth?: boolean;
  headline: string;
  onClear?: (e: React.MouseEvent) => any;
  onClick?: (e: React.MouseEvent) => any;
  round?: boolean;
  selected?: boolean;
  value?: string;
  variant?: SelectableVariant;
}

export default function Selectable({
  centered,
  disabled,
  gridSpan,
  headline,
  onClick,
  onClear,
  fullWidth,
  round,
  selected,
  value,
  variant = SelectableVariant.Checkbox,
}: SelectableProps) {
  const headlineKebab = value ? toKebab(headline) : undefined;
  return (
    <button
      id={value || headlineKebab}
      value={value || headlineKebab}
      onClick={onClick}
      tabIndex={disabled ? -1 : undefined}
      type="button"
      className={cn(
        `
        relative
        flex
        h-full
        items-end
        break-words
        rounded-lg
        border-4
        border-tan-300
        bg-tan-300
        px-2
        py-1
        text-left
        leading-tight
        transition-all
        after:ml-2
        after:block
        after:h-4
        after:w-4
        after:shrink-0
        after:self-end
        after:rounded
        after:border-4
        after:border-tan-400
        after:transition-all
        after:content-['']
        hover:border-tan-400
        hover:after:border-tan-500/50
      `,
        selected &&
          `border-brown-700/50
          bg-brown-600
          after:border-[6px]
          after:border-brown-700
          after:bg-white
          hover:border-brown-700
          hover:after:border-brown-800
          `,
        centered && "items-center text-center",
        fullWidth && "w-full",
        round && "rounded-xl py-2 pl-4 pr-3",
        disabled &&
          "cursor-not-allowed opacity-50 ring-0 hover:border-transparent",
        variant === SelectableVariant.Blank && "before:hidden after:hidden"
      )}
      style={gridSpan ? { gridColumn: `span ${gridSpan}` } : {}}
      disabled={disabled}
    >
      <h4
        className={cn(
          `m-0
          grow
          font-semibold
          transition-all`,
          selected && "text-white"
        )}
      >
        {headline}
      </h4>
      {onClear ? (
        <span
          className={`
            absolute
            right-0
            top-0
            flex
            h-5
            w-5
            -translate-y-1/2
            translate-x-1/2
            items-center
            justify-center
            rounded-full
            bg-brown-800
            text-white
            before:absolute
            before:block
            before:h-3
            before:w-0.5
            before:rotate-45
            before:rounded
            before:bg-white
            before:content-[""]
            after:absolute
            after:block
            after:h-3
            after:w-0.5
            after:-rotate-45
            after:rounded
            after:bg-white
            after:content-[""]
            hover:bg-brown-900
          `}
          onClick={onClear}
        />
      ) : null}
    </button>
  );
}

interface SelectableGridProps {
  children?: React.ReactNode;
  columns?: number;
}

export function SelectableGrid({ children, columns = 3 }: SelectableGridProps) {
  return (
    <div className="rounded-xl bg-tan-400 p-2">
      <div
        className="grid auto-rows-fr gap-2"
        style={{ gridTemplateColumns: `${"1fr ".repeat(columns)}` }}
      >
        {children}
      </div>
    </div>
  );
}
