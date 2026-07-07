import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists updates in localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage("gymapp-test", {
        completed: false
      })
    );

    act(() => {
      result.current[1]({
        completed: true
      });
    });

    expect(result.current[0]).toEqual({
      completed: true
    });
    expect(window.localStorage.getItem("gymapp-test")).toBe('{"completed":true}');
  });
});
