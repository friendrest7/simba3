import { DashboardShell } from "@/components/dashboard-shell";
import { DriverConsoleWrapper } from "@/components/driver-console";

export default function DriverDashboard() {
  return <DashboardShell role="driver"><DriverConsoleWrapper /></DashboardShell>;
}
