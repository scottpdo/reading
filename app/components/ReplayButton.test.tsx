import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReplayButton } from "./ReplayButton";

describe("ReplayButton", () => {
  it("should render with audio speaker emoji", () => {
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={false} />);

    expect(screen.getByRole("button", { name: "Replay word audio" })).toBeInTheDocument();
    expect(screen.getByText("🔊")).toBeInTheDocument();
  });

  it("should call onClick when clicked and not disabled", async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("should have enabled styles when not disabled", () => {
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
    expect(button).not.toHaveClass("cursor-not-allowed");
    expect(button).not.toHaveClass("opacity-50");
  });

  it("should have disabled styles when disabled", () => {
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-700");
    expect(button).toHaveClass("cursor-not-allowed");
    expect(button).toHaveClass("opacity-50");
  });

  it("should have circular shape with equal width and height", () => {
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-16");
    expect(button).toHaveClass("h-16");
    expect(button).toHaveClass("rounded-full");
  });

  it("should have proper flex centering for content", () => {
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("flex");
    expect(button).toHaveClass("items-center");
    expect(button).toHaveClass("justify-center");
  });

  it("should be disabled attribute when disabled prop is true", () => {
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should not be disabled attribute when disabled prop is false", () => {
    const mockOnClick = vi.fn();
    render(<ReplayButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });
});
