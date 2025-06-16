import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "./app/page";

describe("Home", () => {
  it("renders without crashing", () => {
    render(<Home />);
  });

  it("renders the form fields", () => {
    render(<Home />);
    expect(screen.getByLabelText(/Planned Yearly Spend Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Cards to Open in a Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Include Business Cards/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reward Preference/i)).toBeInTheDocument();
  });

  it("allows changing the spend amount", () => {
    render(<Home />);
    const input = screen.getByLabelText(/Planned Yearly Spend Amount/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "5000" } });
    expect(input.value).toBe("5000");
  });

  it("allows toggling business cards checkbox", () => {
    render(<Home />);
    const checkbox = screen.getByLabelText(/Include Business Cards/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("allows selecting reward preference", () => {
    render(<Home />);
    const select = screen.getByLabelText(/Reward Preference/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "cashback" } });
    expect(select.value).toBe("cashback");
  });

  it('shows recommended cards after submitting the form', async () => {
    render(<Home />);
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Planned Yearly Spend Amount/i), { target: { value: "10000" } });
    fireEvent.change(screen.getByLabelText(/Max Cards to Open in a Year/i), { target: { value: "2" } });
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /get recommendation/i }));
    // Wait for recommended cards section to appear
    const recommended = await screen.findByText(/Recommended Cards/i, {}, { timeout: 2000 });
    expect(recommended).toBeInTheDocument();
  });
});