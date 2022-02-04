import { TypeRole, TypeUser } from "../types";
import { toTitleCase } from "../util";

type Props = {
  user: TypeUser;
  god: boolean;
  setRole: any;
  me: TypeUser;
  showVote: boolean;
};

export const User = (props: Props) => {
  const { user, god, setRole, me } = props;

  const updateRole: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setRole({
      socketId: user.socketId,
      // @ts-ignore
      role: e.target.innerHTML,
    });
  };

  const updateAlive = (alive: boolean) => {
    setRole({
      socketId: user.socketId,
      alive,
    });
  };

  return (
    <div
      className={`row line ${user.alive ? "" : "kill"}`}
      style={
        god || user.alive !== false
          ? {}
          : {
              pointerEvents: "none",
            }
      }
    >
      <p className="col-md-2" style={{ margin: "0.5rem" }}>
        {`${toTitleCase(user.name)}`}{" "}
        {user.voted !== undefined && (
          <span
            style={{
              color: "green",
            }}
          >
            Voted
          </span>
        )}
      </p>
      {god && user.role !== "god" && (
        <>
          <div className="col-md-5">
            {RoleButton("Mafia", updateRole, user)}
            {RoleButton("Healer", updateRole, user)}
            {RoleButton("Detective", updateRole, user)}
            {RoleButton("Citizen", updateRole, user)}
          </div>
          <div className="col-md-4">
            {KillerButton(
              "Mafia",
              () => {
                updateAlive(false);
              },
              "Kill"
            )}
            {KillerButton(
              "Healer",
              () => {
                updateAlive(true);
              },
              "Revive"
            )}
          </div>
        </>
      )}
      {!god && user.role !== "god" && me.socketId !== user.socketId && (
        <div className="col-md-5">
          <button
            onClick={() => {
              setRole({
                socketId: me.socketId,
                voted: user.socketId,
              });
            }}
            disabled={props.showVote}
            className={`btn btn${
              me.voted === user.socketId ? "" : "-outline"
            }-danger btn-sm m-1`}
          >
            Vote kill
          </button>
        </div>
      )}
    </div>
  );
};

const roleButtonMapping: { [role in TypeRole]: string } = {
  Mafia: "danger",
  Healer: "success",
  Detective: "info",
  Citizen: "primary",
  god: "warning",
};

const KillerButton = (
  role: TypeRole,
  onClick: React.MouseEventHandler<HTMLButtonElement>,
  text: string
) => (
  <button
    onClick={onClick}
    className={`btn btn-outline-${roleButtonMapping[role]} btn-sm m-1`}
  >
    {text || role}
  </button>
);

const RoleButton = (
  role: TypeRole,
  onClick: React.MouseEventHandler<HTMLButtonElement>,
  user: TypeUser
) => (
  <button
    onClick={onClick}
    className={`btn btn${user.role === role ? "" : "-outline"}-${
      roleButtonMapping[role]
    } btn-sm m-1`}
  >
    {role}
  </button>
);
