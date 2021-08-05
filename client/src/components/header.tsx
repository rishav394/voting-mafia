import { InputHTMLAttributes, useEffect, useState } from "react";
import { Cookies } from "react-cookie";

type Props = {
  name: InputHTMLAttributes<HTMLInputElement>["value"];
  onNameChange: InputHTMLAttributes<HTMLInputElement>["onChange"];
  onClickConnect: () => void;
  cookies: Cookies | undefined;
};

export const TopHeader = (props: Props) => {
  const html = document.querySelector("html");
  const [isDarkMode, setDarkMode] = useState<boolean>(
    props.cookies?.get("dark-mode") === "true"
  );

  useEffect(() => {
    props.cookies?.set("dark-mode", isDarkMode);
    if (html) {
      html.style.filter = `invert(${isDarkMode ? 1 : 0})`;
    }
  }, [isDarkMode]);

  return (
    <div className="d-flex flex-row">
      <input
        className="form-control"
        value={props.name}
        onChange={props.onNameChange}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            if (props.name) {
              props.onClickConnect();
            }
          }
        }}
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (props.name) {
            props.onClickConnect();
          }
        }}
      >
        Connect
      </button>

      <div className="form-check form-switch d-flex px-2 align-middle">
        <div>Dark mode</div>
        <input
          onChange={() => setDarkMode(!isDarkMode)}
          className="form-check-input"
          type="checkbox"
          checked={isDarkMode}
        />
      </div>
    </div>
  );
};
