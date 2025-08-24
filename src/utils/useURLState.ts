import { useState, useEffect, useCallback } from "react";

type SetStateAction<S> = S | ((prevState: S) => S);

interface UseURLStateOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  replace?: boolean;
  allowNullish?: boolean;
}

/**
 * A hook that syncs state with URL search parameters
 * @param key - The URL parameter key
 * @param defaultValue - Default value when parameter doesn't exist
 * @param options - Configuration options
 * @returns [state, setState] tuple like useState
 */
export const useURLState = <T>(
  key: string,
  defaultValue: T,
  options: UseURLStateOptions<T> = {}
): [T, (value: SetStateAction<T>) => void] => {
  const {
    serialize = (value: T): string => {
      if (value === null || value === undefined) return "";
      if (typeof value === "string") return value as string;
      return JSON.stringify(value);
    },
    deserialize = (value: string): T => {
      if (!value) return defaultValue;
      try {
        // Try to parse as JSON first
        return JSON.parse(value) as T;
      } catch {
        // If JSON parse fails, return as string (if T extends string)
        return value as T;
      }
    },
    replace = false,
    allowNullish = false,
  } = options;

  // Get initial value from URL or use default
  const getInitialValue = useCallback((): T => {
    if (typeof window === "undefined") return defaultValue;

    const urlParams = new URLSearchParams(window.location.search);
    const paramValue = urlParams.get(key);

    return paramValue !== null ? deserialize(paramValue) : defaultValue;
  }, [key, defaultValue, deserialize]);

  const [state, setState] = useState<T>(getInitialValue);

  // Update URL when state changes
  const updateUrl = useCallback(
    (newValue: T): void => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      const serializedValue = serialize(newValue);

      if (
        serializedValue === "" ||
        serializedValue === serialize(defaultValue)
      ) {
        // Remove parameter if it's empty or equals default value
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, serializedValue);
      }

      const method = replace ? "replaceState" : "pushState";
      window.history[method]({}, "", url.toString());
    },
    [key, serialize, defaultValue, replace]
  );

  // Custom setState that updates both state and URL
  const setURLState = useCallback(
    (newValue: SetStateAction<T>): void => {
      const value =
        typeof newValue === "function"
          ? (newValue as (prevState: T) => T)(state)
          : newValue;

      // If allowNullish is true and value is null/undefined, use default instead
      const finalValue =
        !allowNullish &&
        (value === null || value === undefined || Number.isNaN(value))
          ? defaultValue
          : value;

      setState(finalValue);
      updateUrl(finalValue);
    },
    [state, updateUrl, defaultValue]
  );

  // Listen for browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = (): void => {
      const newValue = getInitialValue();
      setState(newValue);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getInitialValue]);

  // Sync state with URL on mount and key changes
  useEffect(() => {
    const urlValue = getInitialValue();
    if (JSON.stringify(urlValue) !== JSON.stringify(state)) {
      setState(urlValue);
    }
  }, [key, getInitialValue, state]);

  return [state, setURLState];
};
