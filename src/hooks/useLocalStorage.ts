import { useCallback, useEffect, useState } from "react";

type Updater<T> = T | ((currentValue: T) => T);

type LocalStorageOptions<T> = {
  deserialize?: (value: string) => T;
  serialize?: (value: T) => string;
};

const resolveInitialValue = <T,>(initialValue: T | (() => T)) =>
  initialValue instanceof Function ? initialValue() : initialValue;

export const useLocalStorage = <T,>(
  key: string,
  initialValue: T | (() => T),
  options: LocalStorageOptions<T> = {}
) => {
  const deserialize =
    options.deserialize ?? ((value: string) => JSON.parse(value) as T);
  const serialize = options.serialize ?? JSON.stringify;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return resolveInitialValue(initialValue);
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : resolveInitialValue(initialValue);
    } catch {
      return resolveInitialValue(initialValue);
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(storedValue));
    } catch {
      // Ignore write failures to keep the UI responsive.
    }
  }, [key, serialize, storedValue]);

  const setValue = useCallback((value: Updater<T>) => {
    setStoredValue((currentValue) =>
      value instanceof Function ? value(currentValue) : value
    );
  }, []);

  return [storedValue, setValue] as const;
};
