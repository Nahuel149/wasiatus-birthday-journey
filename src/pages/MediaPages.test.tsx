import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppTestProviders } from "../test/providers";
import { MusicPage } from "./MusicPage";
import { VideoGalleryPage } from "./VideoGalleryPage";

describe("media empty states", () => {
  it("shows the birthday opener and seven personal soundtrack selections", () => {
    render(<MusicPage />, { wrapper: AppTestProviders });

    expect(screen.getByRole("heading", { name: "Our soundtrack" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Play /i })).toHaveLength(8);
    expect(screen.getByRole("heading", { name: "Selamat Ulang Tahun" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Suki Dakara" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Boom!" })).toBeInTheDocument();
  });

  it("explains how to add the first family film", () => {
    render(<VideoGalleryPage />, { wrapper: AppTestProviders });

    expect(screen.getByRole("heading", { name: "Add the first family film" })).toBeInTheDocument();
    expect(screen.getByText("npm run video:optimize")).toBeInTheDocument();
  });
});
