import { Component, createRef, RefObject } from "react";
import { ReactCookieProps, withCookies } from "react-cookie";
import { TopHeader } from "./components/header";
import { User } from "./components/user";
import { socket } from "./socket";
import { TypeRole, TypeUser } from "./types";

type State = {
  name: string | undefined;
  users: TypeUser[];
  me: TypeUser | undefined;
  showVote: boolean;
  messages: { from: string; message: string; channel: TypeRole }[];
  disableConnection: boolean;
};

class Main extends Component<ReactCookieProps, State> {
  audio: HTMLAudioElement;

  scrollRefs: {
    [role in Extract<
      TypeRole,
      "Mafia" | "Healer" | "Detective"
    >]: RefObject<any>;
  } = {
    Mafia: createRef(),
    Healer: createRef(),
    Detective: createRef(),
  };

  constructor(props: ReactCookieProps) {
    super(props);
    this.audio = new Audio("/that-was-quick.mp3");

    const { cookies } = props;

    this.state = {
      name: cookies?.get("name") || undefined,
      users: [],
      me: undefined,
      showVote: false,
      messages: [],
      disableConnection: false,
    };
  }

  componentDidMount() {
    socket.on("user-update", (data: TypeUser[]) => {
      this.setState({
        users: data,
        me: data.find((x) => x.socketId === socket.id),
      });
    });

    socket.on("voting-start", () => {
      this.setState({
        showVote: false,
      });
    });

    socket.on("voting-end", () => {
      this.setState({
        showVote: true,
      });
    });

    socket.on(
      "message",
      ({
        forSockets,
        message,
        from,
        channel,
      }: {
        forSockets: string[];
        message: string;
        from: string;
        channel: Extract<TypeRole, "Mafia" | "Healer" | "Detective">;
      }) => {
        if (
          this.state.me?.socketId &&
          forSockets.includes(this.state.me.socketId)
        ) {
          this.setState(
            {
              messages: [...this.state.messages, { from, message, channel }],
            },
            () => {
              if (from !== this.state.me?.name) {
                // this.audio.play();
              }
              this.scrollRefs[channel].current.scrollIntoView({
                behavior: "smooth",
              });
            }
          );
        }
      }
    );
  }

  setRole(update: TypeUser[]) {
    socket.emit("user-update", update);
  }

  render() {
    return (
      <div>
        <TopHeader
          cookies={this.props.cookies}
          name={this.state.name}
          onNameChange={(e) => {
            this.setState({
              name: e.target.value.trimStart().replace("  ", " "),
            });
          }}
          onClickConnect={() => {
            if (this.state.disableConnection === false) {
              this.setState(
                {
                  disableConnection: true,
                },
                () => {
                  this.props.cookies?.set("name", this.state.name);
                  socket.disconnect();
                  socket.connect();
                  socket.emit("user-joined", { handle: this.state.name });
                  this.setState({ disableConnection: false });
                }
              );
            }
          }}
        />

        {this.state.me?.role ? (
          <h2>
            You are{" "}
            <span
              style={
                !this.state.me.alive
                  ? {
                      textDecoration: "line-through",
                    }
                  : {}
              }
            >
              {this.state.me.role}
            </span>
            {!this.state.me.alive && (
              <span
                style={{
                  color: "red",
                }}
              >
                {" DEAD..."}
              </span>
            )}
          </h2>
        ) : (
          this.state.me && <h2>Even god doesn't know who you are :sadblob:</h2>
        )}
        {this.state.me?.role === "god" && (
          <>
            <button
              onClick={() => {
                socket.emit("voting-start");
              }}
              className={`btn btn-warning btn-sm m-1`}
            >
              Reset voting
            </button>
            <button
              onClick={() => {
                socket.emit("voting-end");
              }}
              className={`btn btn-danger btn-sm m-1`}
            >
              Force end voting
            </button>
          </>
        )}
        <div className={this.state.me?.alive === false ? "dead" : ""}>
          {this.state.me ? (
            this.state.me.role ? (
              this.state.users
                .sort((a: TypeUser, b: TypeUser) =>
                  a.name.localeCompare(b.name)
                )
                .map((user) => {
                  const votedUsers = this.state.users
                    .filter((allUser) => allUser.voted === user.socketId)
                    .map((allUser) => allUser.name);
                  return (
                    <>
                      <User
                        me={this.state.me!}
                        key={"user+" + user.socketId}
                        user={user}
                        god={this.state.me!.role?.trim() === "god"}
                        setRole={this.setRole}
                        showVote={this.state.showVote}
                      />
                      {this.state.showVote && user.role !== "god" && (
                        <p
                          key={"voted-" + user.socketId}
                          style={{
                            margin: "0.5rem",
                            fontSize: 15,
                            color: "gray",
                            marginLeft: "20%",
                          }}
                        >
                          {votedUsers.length +
                            "/" +
                            this.state.users.filter(
                              (u) => u.alive !== false && u.role !== "god"
                            ).length +
                            "  " +
                            votedUsers.join(" , ")}
                        </p>
                      )}
                    </>
                  );
                })
            ) : null
          ) : (
            <h2>Please connect to play!</h2>
          )}
        </div>

        <div
          className="row"
          style={{
            marginTop: "2rem",
          }}
        >
          {(
            ["Mafia", "Healer", "Detective"] as Extract<
              TypeRole,
              "Mafia" | "Healer" | "Detective"
            >[]
          ).map((toRole) => {
            const spectating =
              this.state.me?.role === "god" || this.state.me?.alive === false;
            if (this.state.me?.role === toRole || spectating) {
              return (
                <div
                  className={`chat-window ${spectating ? "col-4" : "col-sm-9"}`}
                  key={toRole}
                >
                  <h4>{toRole}</h4>
                  <div className="chat-box">
                    {this.state.messages.map(
                      ({ from, message, channel }, index) => {
                        if (channel === toRole) {
                          return (
                            <p key={index} style={{ margin: 0 }}>
                              <span
                                style={{
                                  // @ts-ignore
                                  fontWeight: "800",
                                }}
                              >
                                {from + ": "}
                              </span>
                              <span
                                style={{
                                  // @ts-ignore
                                  fontWeight: "100",
                                }}
                              >
                                {message}
                              </span>
                            </p>
                          );
                        } else {
                          return null;
                        }
                      }
                    )}
                    <div ref={this.scrollRefs[toRole]} />
                    <input
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                      }}
                      className="form-control"
                      type="text"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const msg = (e.target as any).value;
                          if (msg) {
                            socket.emit("message", {
                              message: msg,
                              toRole: toRole,
                            });
                            (e.target as any).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
    );
  }
}

export default withCookies(Main);
