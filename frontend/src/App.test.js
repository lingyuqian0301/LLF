import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard text', () => {
  render(<App />);
  const dashboardElement = screen.getByText(/Dashboard/i);
  expect(dashboardElement).toBeInTheDocument();
});

test('shows analytics notifications', async () => {
  render(<App />);
  
  // Wait for notifications to appear
  const salesNotification = await screen.findByText(/Sales Performance/i);
  expect(salesNotification).toBeInTheDocument();
  
  const engagementNotification = await screen.findByText(/Customer Engagement/i);
  expect(engagementNotification).toBeInTheDocument();
  
  const campaignNotification = await screen.findByText(/Campaign Success/i);
  expect(campaignNotification).toBeInTheDocument();
});
