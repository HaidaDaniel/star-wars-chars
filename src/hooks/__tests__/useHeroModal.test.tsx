import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHeroModal } from "../useHeroModal";
import { useStarWarsStore } from "../../store/starWarsStore";

describe("useHeroModal", () => {
  beforeEach(() => {
    const store = useStarWarsStore.getState();
    store.closeModal();
  });

  it("should return initial modal state", () => {
    const { result } = renderHook(() => useHeroModal());

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.selectedHeroId).toBeNull();
  });

  it("should open modal with hero ID", () => {
    const { result } = renderHook(() => useHeroModal());

    act(() => {
      result.current.handleOpenModal(1);
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.selectedHeroId).toBe(1);
  });

  it("should close modal", () => {
    const { result } = renderHook(() => useHeroModal());

    act(() => {
      result.current.handleOpenModal(5);
    });

    expect(result.current.isModalOpen).toBe(true);
    expect(result.current.selectedHeroId).toBe(5);

    act(() => {
      result.current.handleCloseModal();
    });

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.selectedHeroId).toBeNull();
  });

  it("should update selected hero ID when opening modal with different ID", () => {
    const { result } = renderHook(() => useHeroModal());

    act(() => {
      result.current.handleOpenModal(1);
    });

    expect(result.current.selectedHeroId).toBe(1);

    act(() => {
      result.current.handleOpenModal(2);
    });

    expect(result.current.selectedHeroId).toBe(2);
    expect(result.current.isModalOpen).toBe(true);
  });
});


