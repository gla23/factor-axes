import { useState, useEffect, useCallback, useRef } from "react";

type SetStateAction<S> = S | ((prevState: S) => S);

interface UseURLStateOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  replace?: boolean;
  preventNull?: boolean;
}

// Global state manager to coordinate multiple hook instances
class URLStateManager {
  private listeners = new Map<string, Set<(value: any) => void>>();
  private isListening = false;
  private lastURL = "";
  private checkInterval: number | null = null;

  subscribe<T>(key: string, callback: (value: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);
    this.startListening();

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(callback);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
      if (this.listeners.size === 0) {
        this.stopListening();
      }
    };
  }

  private startListening(): void {
    if (this.isListening) return;
    this.isListening = true;
    this.lastURL = window.location.href;

    // Listen to popstate (back/forward buttons)
    window.addEventListener("popstate", this.handleURLChange);

    // Patch history methods to detect programmatic changes
    this.patchHistoryMethod("pushState");
    this.patchHistoryMethod("replaceState");

    // Polling fallback for other URL changes (like direct URL bar edits)
    this.checkInterval = window.setInterval(this.checkURLChange, 100);
  }

  private stopListening(): void {
    if (!this.isListening) return;
    this.isListening = false;

    window.removeEventListener("popstate", this.handleURLChange);
    this.unpatchHistoryMethods();

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private originalPushState = window.history.pushState.bind(window.history);
  private originalReplaceState = window.history.replaceState.bind(
    window.history,
  );

  private patchHistoryMethod(method: "pushState" | "replaceState"): void {
    const original =
      method === "pushState"
        ? this.originalPushState
        : this.originalReplaceState;

    window.history[method] = (
      state: any,
      title: string,
      url?: string | URL | null,
    ) => {
      original(state, title, url);
      // Use setTimeout to ensure URL has been updated
      setTimeout(() => this.handleURLChange(), 0);
    };
  }

  private unpatchHistoryMethods(): void {
    window.history.pushState = this.originalPushState;
    window.history.replaceState = this.originalReplaceState;
  }

  private checkURLChange = (): void => {
    if (window.location.href !== this.lastURL) {
      this.handleURLChange();
    }
  };

  private handleURLChange = (): void => {
    const currentURL = window.location.href;
    if (currentURL === this.lastURL) return;

    this.lastURL = currentURL;
    const urlParams = new URLSearchParams(window.location.search);

    // Notify listeners for all keys
    for (const [key, callbacks] of this.listeners) {
      const value = urlParams.get(key);
      callbacks.forEach((callback) => callback(value));
    }
  };

  updateURL(key: string, value: string, replace: boolean = false): void {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);

    if (value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }

    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", url.toString());

    // Notify all listeners for this key about the change
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((callback) => callback(value === "" ? null : value));
    }
  }

  getCurrentValue(key: string): string | null {
    if (typeof window === "undefined") return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  }
}

// Global singleton instance
const urlStateManager = new URLStateManager();

export type NumberObject = { [number: number]: number } | null;
export const numberObject = {
  serialize: (value: NumberObject) =>
    value
      ? Object.entries(value)
          .map(([number, size]) => `${number}→${size}`)
          .join("_")
      : "",
  deserialize: (string: string) =>
    Object.fromEntries(
      string
        .split("_")
        .map((pair) => pair.split("→").map((num) => parseFloat(num))),
    ),
};

/**
 * A hook that syncs state with URL search parameters
 * Safe for use across multiple components
 * @param key - The URL parameter key
 * @param defaultValue - Default value when parameter doesn't exist
 * @param options - Configuration options
 * @returns [state, setState] tuple like useState
 */
export const useURLState = <T>(
  key: string,
  defaultValue: T,
  options: UseURLStateOptions<T> = {},
): [T, (value: SetStateAction<T>) => void] => {
  const {
    serialize = (value: T): string => {
      if (value === null || value === undefined) return "";
      if (typeof value === "string") return value as string;
      const json = JSON.stringify(value);
      return json.replaceAll(" ", "");
    },
    deserialize = (value: string): T => {
      if (!value) return defaultValue;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    },
    replace = false,
    preventNull = false,
  } = options;

  // Store options in ref to avoid unnecessary re-renders
  const optionsRef = useRef({
    serialize,
    deserialize,
    defaultValue,
    preventNull,
  });
  optionsRef.current = { serialize, deserialize, defaultValue, preventNull };

  // Get initial value from URL
  const getValueFromURL = useCallback((): T => {
    const urlValue = urlStateManager.getCurrentValue(key);
    return urlValue !== null ? deserialize(urlValue) : defaultValue;
  }, [key, deserialize, defaultValue]);

  const [state, setState] = useState<T>(getValueFromURL);

  // Subscribe to URL changes for this specific key
  useEffect(() => {
    const unsubscribe = urlStateManager.subscribe<string | null>(
      key,
      (urlValue) => {
        const {
          deserialize: currentDeserialize,
          defaultValue: currentDefault,
        } = optionsRef.current;
        const newValue =
          urlValue !== null ? currentDeserialize(urlValue) : currentDefault;
        setState(newValue);
      },
    );

    return unsubscribe;
  }, [key]);

  // Update URL and state
  const setURLState = useCallback(
    (newValue: SetStateAction<T>): void => {
      const {
        serialize: currentSerialize,
        defaultValue: currentDefault,
        preventNull: currentPreventNull,
      } = optionsRef.current;

      const value =
        typeof newValue === "function"
          ? (newValue as (prevState: T) => T)(state)
          : newValue;

      // Handle preventNull option
      const finalValue =
        currentPreventNull && (value === null || value === undefined)
          ? currentDefault
          : value;

      setState(finalValue);

      // Update URL
      const serializedValue = currentSerialize(finalValue);
      const shouldRemove =
        serializedValue === "" ||
        serializedValue === currentSerialize(currentDefault);

      urlStateManager.updateURL(
        key,
        shouldRemove ? "" : serializedValue,
        replace,
      );
    },
    [key, state, replace],
  );

  return [state, setURLState];
};
