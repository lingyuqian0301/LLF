import { render, screen, fireEvent } from "@testing-library/react";
import { Dashboard } from "./dashboard";
import React from "react";
import '@testing-library/jest-dom';

describe("Dashboard Notifications", () => {
  test("renders notifications when triggered", () => {
    render(<Dashboard />);

    // Simulate adding a notification
    const notificationButton = screen.getByText("Dashboard");
    fireEvent.click(notificationButton);

    // Check if the notification appears
    const notification = screen.getByText(/Today's Sales/i);
    expect(notification).toBeInTheDocument();
  });

  test("removes notification after timeout", async () => {
    jest.useFakeTimers();
    render(<Dashboard />);

    // Simulate adding a notification
    const notificationButton = screen.getByText("Dashboard");
    fireEvent.click(notificationButton);

    // Check if the notification appears
    const notification = screen.getByText(/Today's Sales/i);
    expect(notification).toBeInTheDocument();

    // Fast-forward time to simulate timeout
    jest.runAllTimers();

    // Check if the notification is removed
    expect(notification).not.toBeInTheDocument();
  });
});