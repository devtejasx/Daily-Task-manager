import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

/* The Firebase SDK is mocked at the module boundary: these tests are about
   OUR contract (loading states, the shape of each action, error mapping),
   not about Firebase's. */
const mocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(async () => ({ user: { uid: "u1" } })),
  createUserWithEmailAndPassword: vi.fn(async () => ({ user: { uid: "u1" } })),
  signInWithPopup: vi.fn(async () => ({ user: { uid: "u1" } })),
  signOut: vi.fn(async () => {}),
  updateProfile: vi.fn(async () => {}),
}));

vi.mock("firebase/auth", () => ({
  ...mocks,
  getAuth: () => ({}),
  GoogleAuthProvider: class {},
}));

vi.mock("../services/firebase", async () => {
  const actual = await vi.importActual("../services/firebase.js").catch(() => ({}));
  return {
    auth: {},
    googleProvider: {},
    authErrorMessage: actual.authErrorMessage,
  };
});

import { useAuth } from "./useAuth";
import { authErrorMessage } from "../services/firebase";

/** Capture the auth listener so a test can drive the state machine. */
let emit;
beforeEach(() => {
  emit = null;
  mocks.onAuthStateChanged.mockImplementation((_auth, cb) => {
    emit = cb;
    return () => {};
  });
});

describe("useAuth state machine", () => {
  it("starts in a loading state before Firebase has answered", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeUndefined();
  });

  it("resolves to signed-out when Firebase reports no user", async () => {
    const { result } = renderHook(() => useAuth());
    act(() => emit(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("resolves to the signed-in hunter", async () => {
    const { result } = renderHook(() => useAuth());
    act(() => emit({ uid: "u1", email: "hunter@example.com" }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toMatchObject({ uid: "u1" });
  });

  it("unsubscribes from the listener on unmount", () => {
    const unsubscribe = vi.fn();
    mocks.onAuthStateChanged.mockImplementation(() => unsubscribe);

    renderHook(() => useAuth()).unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe("useAuth actions", () => {
  it("signs in with email and password", async () => {
    const { result } = renderHook(() => useAuth());
    await act(() => result.current.login("hunter@example.com", "hunter123"));

    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "hunter@example.com",
      "hunter123"
    );
  });

  it("registers and sets the display name when one was given", async () => {
    const { result } = renderHook(() => useAuth());
    await act(() => result.current.register("Sung", "hunter@example.com", "hunter123"));

    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(mocks.updateProfile).toHaveBeenCalledWith(expect.anything(), { displayName: "Sung" });
  });

  it("skips the profile update when no name was given", async () => {
    const { result } = renderHook(() => useAuth());
    await act(() => result.current.register("", "hunter@example.com", "hunter123"));

    expect(mocks.updateProfile).not.toHaveBeenCalled();
  });

  it("signs in with Google and signs out", async () => {
    const { result } = renderHook(() => useAuth());

    await act(() => result.current.loginWithGoogle());
    expect(mocks.signInWithPopup).toHaveBeenCalled();

    await act(() => result.current.logout());
    expect(mocks.signOut).toHaveBeenCalled();
  });

  it("propagates a failure so the form can show it", async () => {
    mocks.signInWithEmailAndPassword.mockRejectedValueOnce({ code: "auth/invalid-credential" });
    const { result } = renderHook(() => useAuth());

    await expect(result.current.login("a@b.c", "wrong")).rejects.toMatchObject({
      code: "auth/invalid-credential",
    });
  });
});

describe("authErrorMessage", () => {
  it("translates the codes a hunter can actually hit", () => {
    expect(authErrorMessage({ code: "auth/invalid-credential" })).toBe("Invalid email or password");
    expect(authErrorMessage({ code: "auth/wrong-password" })).toBe("Invalid email or password");
    expect(authErrorMessage({ code: "auth/email-already-in-use" })).toMatch(/already exists/i);
    expect(authErrorMessage({ code: "auth/weak-password" })).toMatch(/at least 6/i);
    expect(authErrorMessage({ code: "auth/network-request-failed" })).toMatch(/connection/i);
  });

  it("never leaks a raw Firebase code to the hunter", () => {
    const message = authErrorMessage({ code: "auth/internal-error-42" });
    expect(message).not.toMatch(/auth\//);
    expect(message).toBe("Something went wrong. Please try again.");
  });

  it("handles a thrown value that isn't a Firebase error", () => {
    expect(authErrorMessage(undefined)).toBe("Something went wrong. Please try again.");
    expect(authErrorMessage(new Error("boom"))).toBe("Something went wrong. Please try again.");
  });
});
