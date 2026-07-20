import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppTestProviders } from "../test/providers";
import { MusicPage } from "./MusicPage";
import { VideoGalleryPage } from "./VideoGalleryPage";

describe("media empty states", () => {
  it("keeps song stories visible while audio is pending", () => {
    render(<MusicPage />, { wrapper: AppTestProviders });

    expect(screen.getByRole("heading", { name: "Our soundtrack" })).toBeInTheDocument();
    expect(screen.getAllByText(/audio pending/i)).toHaveLength(3);
  });

  it("explains how to add the first family film", () => {
    render(<VideoGalleryPage />, { wrapper: AppTestProviders });

    expect(screen.getByRole("heading", { name: "Add the first family film" })).toBeInTheDocument();
    expect(screen.getByText("npm run video:optimize")).toBeInTheDocument();
  });
});
