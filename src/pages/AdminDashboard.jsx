import React from "react";
import Navbar from "../components/ui/Navbar";

/* ---------- Small UI helpers (Tailwind only) ---------- */
const SectionCard = ({ title, right, children }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="text-white text-lg font-semibold">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles = {
    primary:
      base +
      " bg-white text-black hover:bg-zinc-200 active:bg-zinc-300 focus:ring-2 focus:ring-white/30",
    ghost:
      base +
      " bg-transparent text-white hover:bg-white/5 border border-white/10",
    danger:
      base +
      " bg-red-600 text-white hover:bg-red-500 focus:ring-2 focus:ring-red-400/40",
    success:
      base +
      " bg-emerald-500 text-white hover:bg-emerald-400 focus:ring-2 focus:ring-emerald-400/40",
  };
  return (
    <button className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const StatCard = ({ label, value, delta, deltaType = "up" }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <p className="text-zinc-400 text-sm">{label}</p>
    <div className="mt-2 flex items-end gap-3">
      <span className="text-2xl font-bold text-white">{value}</span>
      {delta != null && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            deltaType === "up" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
          }`}
        >
          {deltaType === "up" ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  </div>
);

const Badge = ({ children, tone = "default" }) => {
  const tones = {
    default: "bg-white/10 text-zinc-200",
    green: "bg-emerald-500/15 text-emerald-300",
    yellow: "bg-yellow-500/15 text-yellow-300",
    red: "bg-red-500/15 text-red-300",
    blue: "bg-blue-500/15 text-blue-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
};

/* ---------- Demo data (replace with Supabase later) ---------- */
const RECENT_ORDERS = [
  { id: "GP-10234", customer: "Jordan B", total: 268.0, status: "Paid", date: "Aug 03" },
  { id: "GP-10233", customer: "Alana M", total: 89.0, status: "Pending", date: "Aug 03" },
  { id: "GP-10232", customer: "Dre C", total: 142.5, status: "Refunded", date: "Aug 02" },
  { id: "GP-10231", customer: "Nina P", total: 59.0, status: "Paid", date: "Aug 02" },
];

const LOW_STOCK = [
  { sku: "E85-3.5", name: "E85 (3.5g)", stock: 12 },
  { sku: "RC-3.5", name: "Rainbow Cookies (3.5g)", stock: 7 },
  { sku: "IC-SUN-7", name: "Ice Cream Sundaes (7g)", stock: 4 },
];

const ACTIVITY = [
  { t: "08:42", msg: "Order GP-10234 marked as Shipped" },
  { t: "08:10", msg: "New product created: Propane (3.5g)" },
  { t: "07:55", msg: "Inventory synced: 28 products updated" },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-black">
      {/* Global Navbar (existing) */}
      <Navbar />

      {/* Header */}
      <header className="border-b border-white/10 bg-gradient-to-b from-black to-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-semibold">
                GP
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-zinc-400 text-sm">Manage orders, inventory, and products.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone="blue">Live</Badge>
              <Button variant="ghost">Settings</Button>
              <Button>New Product</Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button variant="ghost">Sync Products</Button>
            <Button variant="ghost">Create Discount</Button>
            <Button variant="ghost">Export Orders</Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Revenue (7d)" value="$12,430" delta="4.2%" deltaType="up" />
          <StatCard label="Orders (7d)" value="184" delta="2.1%" deltaType="up" />
          <StatCard label="Avg. Order" value="$67.54" />
          <StatCard label="Active Users" value="1,024" delta="1.9%" deltaType="up" />
        </div>

        {/* Orders + Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <SectionCard
              title="Recent Orders"
              right={
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Search…"
                    className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <Button variant="ghost">Filter</Button>
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-400">
                      <th className="py-2 pr-4">Order</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_ORDERS.map((o) => (
                      <tr key={o.id} className="border-t border-white/10">
                        <td className="py-3 pr-4 text-white">{o.id}</td>
                        <td className="py-3 pr-4 text-zinc-300">{o.customer}</td>
                        <td className="py-3 pr-4 text-zinc-400">{o.date}</td>
                        <td className="py-3 pr-4">
                          {o.status === "Paid" && <Badge tone="green">Paid</Badge>}
                          {o.status === "Pending" && <Badge tone="yellow">Pending</Badge>}
                          {o.status === "Refunded" && <Badge tone="red">Refunded</Badge>}
                        </td>
                        <td className="py-3 pl-4 text-right text-white">${o.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          {/* Low Stock */}
          <div className="space-y-6">
            <SectionCard title="Low Inventory" right={<Button variant="ghost">View All</Button>}>
              <ul className="divide-y divide-white/10">
                {LOW_STOCK.map((p) => (
                  <li key={p.sku} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{p.name}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">SKU: {p.sku}</p>
                    </div>
                    <Badge tone={p.stock < 6 ? "red" : "yellow"}>{p.stock} left</Badge>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="ghost">Restock</Button>
                <Button variant="success">Create PO</Button>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Activity feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard title="Admin Activity">
              <ul className="space-y-3">
                {ACTIVITY.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-zinc-500 text-xs mt-0.5 w-12">{a.t}</span>
                    <p className="text-zinc-200 text-sm">{a.msg}</p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          <div>
            <SectionCard
              title="Quick Actions"
              right={<Badge>Shortcuts</Badge>}
            >
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" className="justify-start">New Product</Button>
                <Button variant="ghost" className="justify-start">New Category</Button>
                <Button variant="ghost" className="justify-start">Invite Admin</Button>
                <Button variant="ghost" className="justify-start">Open Logs</Button>
                <Button variant="ghost" className="justify-start">Tax Settings</Button>
                <Button variant="ghost" className="justify-start">Payments</Button>
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  );
}