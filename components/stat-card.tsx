import { LucideIcon } from "lucide-react";

export function StatCard({ icon: Icon, label, value, trend }: { icon: LucideIcon; label: string; value: string; trend: string }) {
  return <div className="dashboard-card"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-md bg-brand/10 text-brand"><Icon className="h-5 w-5" /></span><span className="text-xs font-bold text-green-600">{trend}</span></div><p className="mt-5 text-2xl font-black">{value}</p><p className="mt-2 text-xs text-gray-500">{label}</p></div>;
}
