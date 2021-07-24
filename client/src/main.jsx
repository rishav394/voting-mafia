import { Component } from "react";
import { withCookies } from "react-cookie";
import { socket } from "./socket";
import { User } from "./User";

class Main extends Component {
  constructor(props) {
    super(props);

    const { cookies } = props;
    this.state = {
      name: cookies.get("name") || undefined,
      users: [],
      me: undefined,
      showVote: false,
      messages: [],
    };
  }

  componentDidMount() {
    socket.on("user-update", (data) => {
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

    socket.on("message", ({ forSockets, message, from, channel }) => {
      if (
        this.state.me?.socketId &&
        forSockets.includes(this.state.me.socketId)
      ) {
        this.setState({
          messages: [...this.state.messages, { from, message, channel }],
        });
      }
    });
  }

  setRole(update) {
    socket.emit("user-update", update);
  }

  render() {
    return (
      <div>
        <div className="d-flex flex-row">
          <input
            className="form-control"
            value={this.state.name}
            onChange={(e) => {
              this.setState({
                name: e.target.value,
              });
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                if (this.state.name) {
                  this.props.cookies.set("name", this.state.name);
                  socket.disconnect();
                  socket.connect();
                  socket.emit("user-joined", { handle: this.state.name });
                }
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (this.state.name) {
                this.props.cookies.set("name", this.state.name);
                socket.disconnect();
                socket.connect();
                socket.emit("user-joined", { handle: this.state.name });
              }
            }}
          >
            Connect
          </button>
        </div>

        {this.state.name && <h1>Hello {this.state.name}!</h1>}
        {this.state.me?.role && (
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
        )}
        {this.state.me?.role === "god" && (
          <>
            <button
              onClick={() => {
                socket.emit("voting-start");
              }}
              className={`btn btn-warning btn-sm m-1`}
            >
              Start/Reset voting
            </button>
            <button
              onClick={() => {
                socket.emit("voting-end");
              }}
              className={`btn btn-danger btn-sm m-1`}
            >
              End voting
            </button>
          </>
        )}
        {this.state.me ? (
          this.state.users
            .sort((a, b) => a > b)
            .map((user) => {
              const votedUsers = this.state.users
                .filter((allUser) => allUser.voted === user.socketId)
                .map((allUser) => allUser.name);
              return (
                <>
                  <User
                    me={this.state.me}
                    key={"user+" + user.socketId}
                    user={user}
                    god={this.state.me.role?.trim().toUpperCase() === "GOD"}
                    setRole={this.setRole}
                  />
                  {this.state.showVote && (
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
                        this.state.users.length +
                        "  " +
                        votedUsers.join(" , ")}
                    </p>
                  )}
                </>
              );
            })
        ) : (
          <h2>Awaiting connection</h2>
        )}

        <div
          className="row"
          style={{
            marginTop: "2rem",
          }}
        >
          {["Mafia", "Healer", "Detective"].map((toRole) => {
            if (
              this.state.me?.role === toRole ||
              this.state.me?.role === "god"
            ) {
              return (
                <div
                  className={`chat-window ${
                    this.state.me?.role === "god" ? "col-4" : "col-sm-9"
                  }`}
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
                                  fontWeight: "800",
                                }}
                              >
                                {from + ": "}
                              </span>
                              <span
                                style={{
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
                          const msg = e.target.value;
                          socket.emit("message", {
                            message: msg,
                            toRole: toRole,
                          });
                          e.target.value = "";
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
