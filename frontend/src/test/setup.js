import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/* ---------------- jsdom gaps ---------------- */

// framer-motion and Recharts both measure elements; jsdom has neither API.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

window.scrollTo = window.scrollTo || (() => {});

// Notifications: default to "granted" so notify() paths are exercised, but
// keep the constructor a spy so tests can assert on what was sent.
class MockNotification {
  static permission = "granted";
  static requestPermission = vi.fn(async () => "granted");
  constructor(title, options) {
    this.title = title;
    this.options = options;
    MockNotification.instances.push(this);
  }
  close() {}
}
MockNotification.instances = [];
window.Notification = MockNotification;

// The synthesised chime — silence it, and let tests assert it was attempted.
window.AudioContext = class {
  constructor() {
    this.state = "running";
    this.currentTime = 0;
    this.destination = {};
  }
  createOscillator() {
    return { type: "", frequency: { value: 0 }, connect: () => ({ connect: () => {} }), start() {}, stop() {} };
  }
  createGain() {
    return {
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect: () => ({ connect: () => {} }),
    };
  }
  resume() {}
};
