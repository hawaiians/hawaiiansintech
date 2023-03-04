import { useState } from "react";
import theme from "styles/theme";
import { toKebab } from "../../helpers";

interface CheckBoxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  description?: React.ReactNode;
  id?: string;
  label?: string;
  onClick?: () => void;
  small?: string;
  big?: boolean;
  children?: React.ReactNode;
  fadeOnCheck?: boolean;
  fullHeight?: string;
  marginBottom?: string;
}

export default function CheckBox(props: CheckBoxProps) {
  const [checked, setChecked] = useState<boolean>(false);
  const labelKebab = props.label ? toKebab(props.label) : null;
  return (
    <div
      className="check-box"
      style={{ height: props.fullHeight && "100%" }}
      onClick={props.onClick ? props.onClick : () => setChecked(!checked)}
    >
      <input
        id={props.id || labelKebab}
        value={props.id || labelKebab}
        type="checkbox"
        name={props.id || labelKebab}
        checked={props.checked ? props.checked : checked}
        defaultChecked={props.defaultChecked}
        readOnly
      />
      {props.children ? (
        <label className="children"> {props.children} </label>
      ) : (
        <label htmlFor={labelKebab}>
          <h3>{props.label}</h3>
        </label>
      )}
      <style jsx>{`
        .check-box {
          position: relative;
          margin-bottom: ${props.marginBottom ? props.marginBottom : null};
        }
        .children {
          opacity: ${props.fadeOnCheck && !props.checked && checked ? 0.5 : 1};
          -webkit-transition: opacity 0.7s;
          transition: "opacity" 0.7s;
        }
        input {
          position: absolute;
          left: -9999px;
        }
        label {
          display: flex;
          align-items: center;
          position: relative;
          margin: 0;
          padding: 0.25rem;
          cursor: pointer;
          transition: all 150ms ease-out;
          user-select: none;
        }
        label:before {
          content: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTMuNjI3IDEwLjM4MSAxLjQ0OC0xLjQ0NyAyLjg5NSAyLjg5NS0xLjQ0OCAxLjQ0Ny0yLjg5NS0yLjg5NVoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJtNi41MjIgMTMuMjc3IDguMDMtOC4wM0wxNiA2LjY5M2wtOC4wMyA4LjAzLTEuNDQ4LTEuNDQ3WiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==");
          transform: ${props.big ? "scale(2)" : "none"};
          display: inline-flex;
          background: ${theme.color.brand.alt};
          border-radius: ${theme.borderRadius.xs};
          margin-right: ${props.big ? "1.75rem" : "0.75rem"};
        }
        input:not(:checked) + label:before {
          content: "";
          height: 1.5rem;
          min-width: 1.25rem;
          background: none;
          border: 0.2rem solid ${theme.color.border.base};
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
          font-size: ${props.big ? "2rem" : "1rem"};
          font-weight: 600;
          line-height: 120%;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
