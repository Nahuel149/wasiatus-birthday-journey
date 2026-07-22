import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppTestProviders } from "../test/providers";
import { MusicPage } from "./MusicPage";
import { VideoGalleryPage } from "./VideoGalleryPage";
import type { GeneratedVideo } from "../data";

const filmFixture = Array.from({ length: 27 }, (_, index): GeneratedVideo => ({
  slug: `film-${index}`,
  title: index === 0 ? "A Wish by Candlelight" : `Film ${index + 1}`,
  description: "A curated family film.",
  width: 810,
  height: 1440,
  durationSeconds: 18,
  capturedAt: "2024-01-01",
}));

describe("media empty states", () => {
  it("shows the birthday opener and seven personal soundtrack selections", () => {
    render(<MusicPage />, { wrapper: AppTestProviders });

    expect(screen.getByRole("heading", { name: "Our soundtrack" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Play /i })).toHaveLength(8);
    expect(screen.getByRole("heading", { name: "Selamat Ulang Tahun" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Suki Dakara" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Boom!" })).toBeInTheDocument();
  });

  it("shows the curated family films", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => filmFixture } as Response);
    render(<VideoGalleryPage />, { wrapper: AppTestProviders });

    expect(screen.getByRole("heading", { name: "Our home movies" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "A Wish by Candlelight" })).toBeInTheDocument();
    await waitFor(() => expect(document.querySelectorAll("video")).toHaveLength(27));
    vi.restoreAllMocks();
  });
});
