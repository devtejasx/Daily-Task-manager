import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthGateProvider, useAuthGate } from "./AuthGate";

/* The login modal pulls in the whole Firebase auth stack; this suite is about
   the GATE's behaviour, so it stands in for the modal with a minimal double
   that exposes the same open/close/success contract. */
vi.mock("./LoginModal", () => ({
  default: ({ open, onClose, onSuccess }) =>
    open ? (
      <div role="dialog" aria-label="Sign in">
        <button onClick={onSuccess}>mock-sign-in</button>
        <button onClick={onClose}>mock-cancel</button>
      </div>
    ) : null,
}));

/** A protected button plus a readout of the gate's state. */
function Consumer({ onAction, intent = "create-mission" }) {
  const { requireAuth, openLogin, isAuthed, pendingIntent, consumeIntent } = useAuthGate();
  return (
    <div>
      <button onClick={() => requireAuth(onAction, intent)}>New Mission</button>
      <button onClick={openLogin}>Sign In</button>
      <button onClick={consumeIntent}>Consume</button>
      <span data-testid="authed">{String(isAuthed)}</span>
      <span data-testid="intent">{String(pendingIntent)}</span>
    </div>
  );
}

const setup = (user, onAction = vi.fn()) => {
  const utils = render(
    <AuthGateProvider user={user}>
      <Consumer onAction={onAction} />
    </AuthGateProvider>
  );
  return { ...utils, onAction, user: userEvent.setup() };
};

describe("useAuthGate", () => {
  it("throws a clear error when used outside the provider", () => {
    // React logs the boundary error; silence it for this assertion only.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer onAction={vi.fn()} />)).toThrow(/within <AuthGateProvider>/);
    spy.mockRestore();
  });
});

describe("guest", () => {
  it("withholds the action and opens the login modal", async () => {
    const { onAction, user } = setup(null);

    await user.click(screen.getByText("New Mission"));

    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Sign in" })).toBeInTheDocument();
  });

  it("remembers the intent so the action can resume after sign-in", async () => {
    const { user } = setup(null);

    await user.click(screen.getByText("New Mission"));
    expect(screen.getByTestId("intent")).toHaveTextContent("create-mission");

    // Signing in closes the modal but KEEPS the intent — the authed app
    // remounts and replays it.
    await user.click(screen.getByText("mock-sign-in"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("intent")).toHaveTextContent("create-mission");
  });

  it("drops the intent when the modal is cancelled", async () => {
    const { user } = setup(null);

    await user.click(screen.getByText("New Mission"));
    await user.click(screen.getByText("mock-cancel"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Otherwise a later, unrelated sign-in would pop the mission form open.
    expect(screen.getByTestId("intent")).toHaveTextContent("null");
  });

  it("opens the modal directly from the Sign In button", async () => {
    const { user } = setup(null);
    await user.click(screen.getByText("Sign In"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("reports the guest as not authenticated", () => {
    setup(null);
    expect(screen.getByTestId("authed")).toHaveTextContent("false");
  });
});

describe("signed-in hunter", () => {
  const hunter = { uid: "u1", email: "hunter@example.com" };

  it("runs the action immediately without a modal", async () => {
    const { onAction, user } = setup(hunter);

    await user.click(screen.getByText("New Mission"));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("records no pending intent for an action that just ran", async () => {
    const { user } = setup(hunter);
    await user.click(screen.getByText("New Mission"));
    expect(screen.getByTestId("intent")).toHaveTextContent("null");
  });

  it("reports the hunter as authenticated", () => {
    setup(hunter);
    expect(screen.getByTestId("authed")).toHaveTextContent("true");
  });
});

describe("intent lifecycle", () => {
  it("can be consumed once the authed app has replayed it", async () => {
    const { user } = setup(null);

    await user.click(screen.getByText("New Mission"));
    expect(screen.getByTestId("intent")).toHaveTextContent("create-mission");

    await user.click(screen.getByText("Consume"));
    expect(screen.getByTestId("intent")).toHaveTextContent("null");
  });

  it("records nothing when the caller passes no intent", async () => {
    render(
      <AuthGateProvider user={null}>
        <Consumer onAction={vi.fn()} intent={null} />
      </AuthGateProvider>
    );
    await userEvent.setup().click(screen.getByText("New Mission"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("intent")).toHaveTextContent("null");
  });
});
