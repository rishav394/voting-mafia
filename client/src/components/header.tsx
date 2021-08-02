import { InputHTMLAttributes } from "react";

type Props = {
  name: InputHTMLAttributes<HTMLInputElement>["value"];
  onNameChange: InputHTMLAttributes<HTMLInputElement>["onChange"];
  onClickConnect: () => void;
};

export const TopHeader = (props: Props) => {
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
          onChange={(e) => {
            const html = document.querySelector("html");
            if (html) {
              html.style.filter = `invert(${e.target.checked ? 1 : 0})`;
            }
          }}
          className="form-check-input"
          type="checkbox"
        />
      </div>
    </div>
  );
};
