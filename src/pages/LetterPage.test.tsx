import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProgressProvider } from "../progress";
import { LetterPage } from "./LetterPage";

describe("printable letter studio", () => {
  it("changes the preview and opens the print dialog", async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<LetterPage />, { wrapper: ProgressProvider });

    await user.click(screen.getByRole("radio", { name: /Sakura Blush/i }));
    await user.click(screen.getByRole("radio", { name: /Floral Flourish/i }));
    await user.click(screen.getByRole("radio", { name: /US Letter/i }));

    expect(screen.getByText(/Previewing Sakura Blush, Floral Flourish, US Letter/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Print or Save as PDF" }));
    expect(print).toHaveBeenCalledOnce();
  });

  it("shows writing guidance only when requested", async () => {
    const user = userEvent.setup();
    render(<LetterPage />, { wrapper: ProgressProvider });

    expect(screen.queryByText(/Write about the moment life changed/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Show draft-writing guidance" }));
    expect(screen.getByText(/Write about the moment life changed/i)).toBeInTheDocument();
  });
});
