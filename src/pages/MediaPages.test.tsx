import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppTestProviders } from "../test/providers";
import { MusicPage } from "./MusicPage";
import { VideoGalleryPage } from "./VideoGalleryPage";

describe("media empty states", () => {
  it("shows the seven chat-derived YouTube selections", () => {
    render(<MusicPage />, { wrapper: AppTestProviders });

    expect(screen.getByRole("heading", { name: "Our soundtrack" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /on YouTube/i })).toHaveLength(7);
    expect(screen.getByRole("heading", { name: "Suki Dakara" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Boom!" })).toBeInTheDocument();
  });

  it("explains how to add the first family film", () => {
    render(<VideoGalleryPage />, { wrapper: AppTestProviders });

    expect(screen.getByRole("heading", { name: "Add the first family film" })).toBeInTheDocument();
    expect(screen.getByText("npm run video:optimize")).toBeInTheDocument();
  });
});
