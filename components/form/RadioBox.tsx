import theme from "styles/theme";
import { cn, toKebab } from "../../helpers";

interface RadioBoxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  description?: React.ReactNode;
  id?: string;
  label: string;
  onChange?: () => void;
  seriesOf?: string;
  small?: string;
  fullHeight?: string;
}

export default function RadioBox(props: RadioBoxProps) {
  const labelKebab = toKebab(props.label);
  return (
    <div className={cn(`relative`, props.fullHeight && "h-full")}>
      <input
        id={props.id || labelKebab}
        value={props.id || labelKebab}
        type="radio"
        name={props.seriesOf}
        onChange={props.onChange}
        checked={props.checked}
        defaultChecked={props.defaultChecked}
        className="pointer-events-none invisible absolute opacity-0"
      />
      <label
        className={cn(
          `
          before
          relative
          flex
          cursor-pointer
          items-center
          gap-2
          rounded-lg
          border-4
          border-transparent
          bg-tan-300
          px-2
          py-1
          font-semibold
          leading-tight
          before:inline-block
          before:h-4
          before:w-4
          before:rounded-full
          before:border-4
          before:border-tan-400
          before:content-[""]
          hover:border-tan-400
          hover:transition-all
          hover:before:border-tan-600/50
          hover:before:transition-all
          `,
          props.checked &&
            `
            border-brown-700/50
            bg-brown-600
            text-white
            before:border-[6px]
            before:border-brown-700
            before:bg-white
            hover:border-brown-700
            hover:before:border-brown-800
            `
          // props.fullHeight && "h-full"
        )}
        htmlFor={props.id || labelKebab}
      >
        <h3>{props.label}</h3>
      </label>
      <style jsx>{`
        /* input:not(:checked) + label:before {
          background: transparent;
          border: 0.2rem solid ${theme.color.border.alt};
        }
        input:not(:checked) + label:after {
          border-color: transparent;
        }
        label:hover {
          border-color: ${theme.color.brand.alt};
        }
        input:not(:checked) + label:hover {
          border-color: ${theme.color.border.alt};
        }
        input:focus + label {
          border-color: ${theme.color.brand.alt};
          box-shadow: ${theme.elevation.one.brand};
        }
        input:not(:checked) + label:focus {
          border-color: ${theme.color.border.alt};
        }
        label:focus:hover {
          border-color: ${theme.color.brand.alt};
        }
        input:not(:checked) + label:focus:hover {
          border-color: ${theme.color.border.alt};
        }
        h3 {
          font-size: 1rem;
          font-weight: 600;
          line-height: 120%;
          margin: 0;
        } */
      `}</style>
    </div>
  );
}
