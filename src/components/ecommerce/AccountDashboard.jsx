// src/components/ecommerce/AccountDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabaseClient";

/* ── tiny UI helpers ───────────────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>{children}</div>
);

const Btn = ({ children, variant = "primary", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none";
  const v = {
    primary: `${base} bg-white text-black hover:bg-zinc-200`,
    ghost: `${base} border border-white/10 text-white hover:bg-white/5`,
    danger: `${base} bg-red-600 text-white hover:bg-red-500`,
  };
  return <button className={`${v[variant]} ${className}`} {...props}>{children}</button>;
};

const Field = ({ label, value, onChange, disabled, placeholder, type = "text" }) => (
  <label className="block">
    <span className="block text-xs font-semibold uppercase tracking-widest text-white/30 mb-1">{label}</span>
    <input
      type={type}
      className={`w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-white/20 text-sm ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
    />
  </label>
);

const Badge = ({ children, color = "default" }) => {
  const c = {
    default: "bg-white/10 text-zinc-300",
    green: "bg-emerald-500/15 text-emerald-300",
    yellow: "bg-yellow-500/15 text-yellow-300",
    red: "bg-red-500/15 text-red-300",
    blue: "bg-blue-500/15 text-blue-300",
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${c[color]}`}>{children}</span>;
};

const statusColor = (s) =>
  ({ pending_payment: "yellow", awaiting_payment: "blue", paid: "green", processing: "blue", shipped: "blue", complete: "green", cancelled: "red" }[s] || "default");

/* ── main component ────────────────────────────────────────────── */
export default function AccountDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  /* profile state */
  const [editing, setEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [emailNotif, setEmailNotif] = useState(false);
  const [smsNotif, setSmsNotif] = useState(false);

  /* orders state */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /* addresses state */
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [addrForm, setAddrForm] = useState({
    label: "", name: "", line1: "", line2: "", city: "", state: "", zip: "", country: "United States", is_default: false,
  });

  const displayName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Guest";
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";
  const initials = displayName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  /* ── load profile extras from Supabase ─────────────────────── */
  useEffect(() => {
    if (!isLoaded || !user) return;
    (async () => {
      const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setPhone(data.phone || "");
        setBirthday(data.birthday || "");
        setEmailNotif(data.email_notifications ?? false);
        setSmsNotif(data.sms_notifications ?? false);
      }
    })();
  }, [user, isLoaded]);

  /* ── load orders (by user_id OR email fallback for claimed guests) */
  const loadOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);

    // Primary: orders tied to this user_id
    const { data: byId } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fallback: any unclaimed orders with matching email (claim may not have run yet)
    let byEmail = [];
    if (email) {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("email", email)
        .is("user_id", null)
        .order("created_at", { ascending: false });
      byEmail = data || [];
    }

    // Merge & dedupe by order_id
    const seen = new Set();
    const all = [...(byId || []), ...byEmail].filter((o) => {
      if (seen.has(o.order_id)) return false;
      seen.add(o.order_id);
      return true;
    });

    setOrders(all);
    setOrdersLoading(false);
  }, [user, email]);

  useEffect(() => {
    if (activeTab === "orders") loadOrders();
  }, [activeTab, loadOrders]);

  /* ── load addresses ─────────────────────────────────────────── */
  const loadAddresses = useCallback(async () => {
    if (!user) return;
    setAddrLoading(true);
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    setAddresses(data || []);
    setAddrLoading(false);
  }, [user]);

  useEffect(() => {
    if (activeTab === "addresses") loadAddresses();
  }, [activeTab, loadAddresses]);

  /* ── save profile ───────────────────────────────────────────── */
  const saveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileMsg("");
    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        email,
        phone,
        birthday: birthday || null,
        email_notifications: emailNotif,
        sms_notifications: smsNotif,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setProfileSaving(false);
    setProfileMsg(error ? "Failed to save. Try again." : "Profile saved.");
    if (!error) {
      setEditing(false);
      setTimeout(() => setProfileMsg(""), 3000);
    }
  };

  /* ── address CRUD ───────────────────────────────────────────── */
  const openAddrForm = (addr = null) => {
    setEditingAddr(addr);
    setAddrForm(
      addr
        ? { label: addr.label || "", name: addr.name || "", line1: addr.line1 || "", line2: addr.line2 || "", city: addr.city || "", state: addr.state || "", zip: addr.zip || "", country: addr.country || "United States", is_default: addr.is_default || false }
        : { label: "", name: "", line1: "", line2: "", city: "", state: "", zip: "", country: "United States", is_default: false }
    );
    setShowAddrForm(true);
  };

  const saveAddress = async () => {
    if (!addrForm.line1 || !addrForm.city || !addrForm.state || !addrForm.zip) {
      alert("Please fill in address, city, state, and ZIP.");
      return;
    }
    setAddrSaving(true);

    if (addrForm.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    }

    if (editingAddr) {
      await supabase.from("addresses").update({ ...addrForm, updated_at: new Date().toISOString() }).eq("id", editingAddr.id);
    } else {
      await supabase.from("addresses").insert([{ ...addrForm, user_id: user.id, created_at: new Date().toISOString() }]);
    }

    setAddrSaving(false);
    setShowAddrForm(false);
    loadAddresses();
  };

  const deleteAddress = async (id) => {
    if (!confirm("Remove this address?")) return;
    await supabase.from("addresses").delete().eq("id", id);
    loadAddresses();
  };

  const setDefault = async (addr) => {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", addr.id);
    loadAddresses();
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: "Orders" },
    { id: "addresses", label: "Addresses" },
  ];

  if (!isLoaded) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 pt-28 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{displayName}</h1>
              <p className="text-white/40 text-sm truncate">{email}</p>
            </div>
            <Btn variant="ghost" onClick={() => signOut(() => navigate("/"))}>Sign out</Btn>
          </div>

          {/* Tabs */}
          <div className="mt-8 overflow-x-auto">
            <div className="inline-flex gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 text-sm rounded-lg transition whitespace-nowrap ${
                    activeTab === t.id ? "bg-white text-black font-medium" : "text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* ── PROFILE TAB ─────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold">Your Details</h2>
                  {!editing ? (
                    <Btn variant="ghost" onClick={() => setEditing(true)}>Edit</Btn>
                  ) : (
                    <div className="flex gap-2">
                      <Btn variant="ghost" onClick={() => { setEditing(false); setProfileMsg(""); }}>Cancel</Btn>
                      <Btn onClick={saveProfile} disabled={profileSaving}>{profileSaving ? "Saving…" : "Save"}</Btn>
                    </div>
                  )}
                </div>
                {profileMsg && (
                  <p className={`text-sm mb-4 ${profileMsg.includes("Failed") ? "text-red-400" : "text-emerald-400"}`}>{profileMsg}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name" value={displayName} disabled placeholder="Your name" onChange={() => {}} />
                  <Field label="Email" value={email} disabled placeholder="Email" onChange={() => {}} />
                  <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} placeholder="Add phone number" />
                  <Field label="Birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} disabled={!editing} type="date" />
                </div>
                <p className="text-xs text-white/25 mt-4">Name and email are managed by your Clerk account.</p>
              </Card>

              <Card>
                <h2 className="text-base font-semibold mb-5">Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: "Email notifications", sub: "Receive updates about orders, drops, and promotions.", val: emailNotif, set: setEmailNotif },
                    { label: "SMS updates", sub: "Delivery and order status to your phone.", val: smsNotif, set: setSmsNotif },
                  ].map(({ label, sub, val, set }) => (
                    <label key={label} className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => { set(e.target.checked); setEditing(true); }}
                        className="mt-1 h-4 w-4 rounded accent-white"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-xs text-white/40 mt-0.5">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {editing && (
                  <div className="mt-5">
                    <Btn onClick={saveProfile} disabled={profileSaving}>{profileSaving ? "Saving…" : "Save preferences"}</Btn>
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <h2 className="text-base font-semibold mb-4">Quick links</h2>
                <div className="space-y-3 text-sm">
                  <button onClick={() => setActiveTab("orders")} className="w-full text-left flex justify-between text-white/60 hover:text-white transition">Order history <span>→</span></button>
                  <button onClick={() => setActiveTab("addresses")} className="w-full text-left flex justify-between text-white/60 hover:text-white transition">Saved addresses <span>→</span></button>
                  <Link to="/shop" className="w-full text-left flex justify-between text-white/60 hover:text-white transition">Shop <span>→</span></Link>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ──────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Order History</h2>
              <Btn variant="ghost" onClick={loadOrders}>Refresh</Btn>
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
              </div>
            ) : orders.length === 0 ? (
              <Card className="text-center py-16">
                <p className="text-white/50 text-sm">No orders yet.</p>
                <Link to="/shop"><Btn className="mt-4">Start Shopping</Btn></Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const date = new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                  const items = order.items || [];
                  const isGuest = !order.user_id;
                  return (
                    <Card key={order.order_id} className="hover:border-white/20 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <p className="text-sm font-semibold font-mono text-white/70">{order.order_id}</p>
                            <Badge color={statusColor(order.status)}>{order.status?.replace(/_/g, " ")}</Badge>
                            {isGuest && <Badge color="yellow">guest order</Badge>}
                          </div>
                          <p className="text-xs text-white/35">
                            {date} · {order.fulfillment_type === "pickup" ? `Pickup @ ${order.pickup_location}` : "Shipped"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {items.slice(0, 3).map((item, i) => (
                              <span key={i} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/50">
                                {item.name} ×{item.qty}
                              </span>
                            ))}
                            {items.length > 3 && <span className="text-xs text-white/30">+{items.length - 3} more</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-semibold">${Number(order.total || 0).toFixed(2)}</p>
                          {order.invoice_url && (
                            <a href={order.invoice_url} target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white underline underline-offset-2 mt-1 block">
                              View invoice
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ADDRESSES TAB ───────────────────────────────────────── */}
        {activeTab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Saved Addresses</h2>
              <Btn onClick={() => openAddrForm()}>+ Add Address</Btn>
            </div>

            {/* Address form */}
            {showAddrForm && (
              <Card className="border-white/20">
                <h3 className="text-sm font-semibold mb-4">{editingAddr ? "Edit Address" : "New Address"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Label (e.g. Home)" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} placeholder="Home" />
                  <Field label="Full name" value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} placeholder="John Doe" />
                  <Field label="Address line 1" value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} placeholder="123 Main St" />
                  <Field label="Line 2 (optional)" value={addrForm.line2} onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} placeholder="Apt 4B" />
                  <Field label="City" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="Los Angeles" />
                  <Field label="State" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} placeholder="CA" />
                  <Field label="ZIP" value={addrForm.zip} onChange={(e) => setAddrForm({ ...addrForm, zip: e.target.value })} placeholder="90001" />
                  <Field label="Country" value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} placeholder="United States" />
                </div>
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input type="checkbox" checked={addrForm.is_default} onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })} className="h-4 w-4 accent-white" />
                  <span className="text-sm text-white/60">Set as default shipping address</span>
                </label>
                <div className="flex gap-3 mt-5">
                  <Btn onClick={saveAddress} disabled={addrSaving}>{addrSaving ? "Saving…" : "Save Address"}</Btn>
                  <Btn variant="ghost" onClick={() => setShowAddrForm(false)}>Cancel</Btn>
                </div>
              </Card>
            )}

            {addrLoading ? (
              <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}</div>
            ) : addresses.length === 0 && !showAddrForm ? (
              <Card className="text-center py-16">
                <p className="text-white/50 text-sm">No addresses saved.</p>
                <Btn className="mt-4" onClick={() => openAddrForm()}>Add your first address</Btn>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <Card key={addr.id} className={`relative ${addr.is_default ? "border-white/25" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/30">{addr.label || "Address"}</p>
                      {addr.is_default && <Badge color="green">Default</Badge>}
                    </div>
                    <p className="text-sm font-medium text-white">{addr.name}</p>
                    <p className="text-sm text-white/50 mt-1">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                      {addr.city}, {addr.state} {addr.zip}<br />
                      {addr.country}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <Btn variant="ghost" className="text-xs px-3 py-1.5" onClick={() => openAddrForm(addr)}>Edit</Btn>
                      {!addr.is_default && (
                        <Btn variant="ghost" className="text-xs px-3 py-1.5" onClick={() => setDefault(addr)}>Set default</Btn>
                      )}
                      <Btn variant="danger" className="text-xs px-3 py-1.5 ml-auto" onClick={() => deleteAddress(addr.id)}>Remove</Btn>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
