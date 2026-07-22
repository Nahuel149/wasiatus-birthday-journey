import { act, fireEvent, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioProvider, useAudio } from "./audio";
import type { SongStory } from "./types";

const playableTrack: SongStory = {
  id: "test-song",
  order: 1,
  title: "Test Song",
  artist: "Test Artist",
  story: "A test memory.",
  audioPath: "media/audio/test.mp3",
};

describe("AudioProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  });

  it("enables the shuffled soundtrack by default", () => {
    const { result } = renderHook(() => useAudio(), { wrapper: AudioProvider });

    expect(result.current.enabled).toBe(true);
    expect(result.current.currentTrack).toBeNull();
  });

  it("chooses a playable song after the visitor's first interaction", async () => {
    const { result } = renderHook(() => useAudio(), { wrapper: AudioProvider });

    fireEvent.click(document.body);

    await waitFor(() => expect(result.current.currentTrack).not.toBeNull());
    expect(result.current.currentTrack?.shuffle).not.toBe(false);
  });

  it("rejects a story without a playable source", async () => {
    const { result } = renderHook(() => useAudio(), { wrapper: AudioProvider });

    let started = true;
    await act(async () => {
      started = await result.current.playTrack({ ...playableTrack, audioPath: undefined });
    });

    expect(started).toBe(false);
    expect(result.current.currentTrack).toBeNull();
  });

  it("plays a local track and reflects media events", async () => {
    const { result } = renderHook(() => useAudio(), { wrapper: AudioProvider });

    let started = false;
    await act(async () => { started = await result.current.playTrack(playableTrack); });
    fireEvent.play(document.querySelector("audio")!);

    expect(started).toBe(true);
    expect(result.current.currentTrack?.id).toBe(playableTrack.id);
    expect(result.current.playing).toBe(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
  });

  it("clamps and persists volume", () => {
    const { result } = renderHook(() => useAudio(), { wrapper: AudioProvider });

    act(() => result.current.setVolume(1.8));

    expect(result.current.volume).toBe(1);
    expect(localStorage.getItem("birthdayJourney:v1:volume")).toBe("1");
  });
});
