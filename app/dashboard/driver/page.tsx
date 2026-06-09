import { DashboardShell } from "@/components/dashboard-shell";
import { DriverConsole } from "@/components/driver-console";

export default function DriverDashboard() {
  return <DashboardShell role="driver"><DriverConsole /></DashboardShell>;
}
