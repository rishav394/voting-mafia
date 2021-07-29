import { toTitleCase } from "./util";

export const User = ({ user, god, setRole, me }) => {
  const updateRole = (e) => {
    setRole({
      socketId: user.socketId,
      role: e.target.innerHTML,
    });
  };

  const updateAlive = (alive) => {
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
      <p className="col-md-2" style={{ margin: "0.5rem" }}>{`${toTitleCase(
        user.name
      )}`}</p>
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
              "Save"
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

const roleButtonMapping = {
  Mafia: "danger",
  Healer: "success",
  Detective: "info",
  Citizen: "primary",
};

const KillerButton = (role, onClick, text) => (
  <button
    onClick={onClick}
    className={`btn btn-outline-${roleButtonMapping[role]} btn-sm m-1`}
  >
    {text || role}
  </button>
);

const RoleButton = (role, onClick, user, text) => (
  <button
    onClick={onClick}
    className={`btn btn${user.role === role ? "" : "-outline"}-${
      roleButtonMapping[role]
    } btn-sm m-1`}
  >
    {text || role}
  </button>
);
