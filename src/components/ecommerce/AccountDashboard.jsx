// src/pages/AccountPage.jsx
import React, { useState } from "react";
import Navbar from "../ui/Navbar";
import { useUser } from "@clerk/clerk-react";

/**
 * Minimal UI helpers (Tailwind only)
 */
const SectionCard = ({ title, children, right }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white text-lg font-semibold">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const Input = ({ label, placeholder, value, onChange, disabled }) => (
  <label className="block mb-4">
    <span className="block text-sm text-zinc-300 mb-1">{label}</span>
    <input
      className={`w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-white/20 ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  </label>
);

const Button = ({ children, variant = "primary", ...props }) => {
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
      base + " bg-red-600 text-white hover:bg-red-500 focus:ring-2 focus:ring-red-400/40",
  };
  return (
    <button className={styles[variant]} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200">
    {children}
  </span>
);

const Empty = ({ title, desc, cta }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
    <h4 className="text-white text-base font-semibold">{title}</h4>
    <p className="text-zinc-400 text-sm mt-1">{desc}</p>
    {cta}
  </div>
);

export default function AccountPage() {
  const { user } = useUser(); // optional; safe to render without user too
  const [activeTab, setActiveTab] = useState("profile");

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Your Name";

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "you@example.com";

  return (
    <div className="min-h-screen bg-black">
      {/* Global Navbar (your existing component) */}
      <Navbar />

      {/* Header */}
      <header className="border-b border-white/10 bg-gradient-to-b from-black to-zinc-900/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-semibold">
              {displayName
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Account</h1>
              <p className="text-zinc-400 text-sm">Manage your profile, orders, and addresses.</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge>Member</Badge>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 overflow-x-auto">
            <div className="inline-flex gap-2 rounded-xl bg-white/5 p-1 border border-white/10">
              {[
                { id: "profile", label: "Profile" },
                { id: "orders", label: "Orders" },
                { id: "addresses", label: "Addresses" },
                { id: "returns", label: "Returns" },
              ].map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 text-sm rounded-lg transition ${
                      active
                        ? "bg-white text-black"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="Your Details" right={<Button variant="ghost">Edit</Button>}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full name" value={displayName} disabled />
                  <Input label="Email" value={email} disabled />
                  <Input label="Phone" placeholder="Add a phone number" disabled />
                  <Input label="Birthday" placeholder="Add your birthday" disabled />
                </div>
              </SectionCard>

              <SectionCard title="Preferences">
                <div className="flex items-start gap-4">
                  <input type="checkbox" disabled className="mt-1.5 h-4 w-4 rounded border-white/20 bg-white/5" />
                  <div>
                    <p className="text-white text-sm font-medium">Email notifications</p>
                    <p className="text-zinc-400 text-sm">Receive updates about orders, drops and promotions.</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-4">
                  <input type="checkbox" disabled className="mt-1.5 h-4 w-4 rounded border-white/20 bg-white/5" />
                  <div>
                    <p className="text-white text-sm font-medium">SMS updates</p>
                    <p className="text-zinc-400 text-sm">Delivery and order status to your phone.</p>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Right: Security */}
            <div className="space-y-6">
              <SectionCard title="Security">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Password</p>
                      <p className="text-zinc-400 text-sm">Last updated — add later</p>
                    </div>
                    <Button variant="ghost">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Two-factor auth</p>
                      <p className="text-zinc-400 text-sm">Add extra protection to your account.</p>
                    </div>
                    <Button variant="ghost">Set up</Button>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <SectionCard
              title="Order History"
              right={<Button variant="ghost">Filter</Button>}
            >
              <Empty
                title="No orders yet"
                desc="When you place an order, it will show up here."
                cta={<Button className="mt-4">Start Shopping</Button>}
              />
            </SectionCard>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-6">
            <SectionCard
              title="Saved Addresses"
              right={<Button variant="primary">Add Address</Button>}
            >
              <Empty
                title="No addresses saved"
                desc="Add your shipping address to speed up checkout."
                cta={<Button className="mt-4" variant="ghost">Add Address</Button>}
              />
            </SectionCard>
          </div>
        )}

        {activeTab === "returns" && (
          <div className="space-y-6">
            <SectionCard title="Returns & Exchanges">
              <Empty
                title="No returns"
                desc="You haven’t requested any returns yet."
                cta={<Button className="mt-4" variant="ghost">Return an Item</Button>}
              />
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
}