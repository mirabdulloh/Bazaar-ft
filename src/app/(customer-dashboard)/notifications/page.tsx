import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications - Seoulé",
  description: "View your notifications",
};

export default function NotificationsPage() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        padding: 32,
      }}
    >
      Notifications coming soon.
    </div>
  );
}
