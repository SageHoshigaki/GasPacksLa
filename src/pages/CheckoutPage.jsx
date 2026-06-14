// src/pages/CheckoutPage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabaseClient";

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

const TAX_RATE = 0.08875;
const FN_BASE = "https://gas-packs.com/.netlify/functions";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart = [], subtotal = 0, clearCart } = useCart();
  const { user } = useUser();

  // Contact
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || ""
  );
  const [subscribe, setSubscribe] = useState(false);

  // Fulfillment
  const [fulfillment, setFulfillment] = useState("ship");

  // Shipping
  const [name, setName] = useState(user?.fullName || "");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");

  // Pickup
  const [pickupLocation, setPickupLocation] = useState("Los Angeles – Fairfax");

  // Discount
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [discount, setDiscount] = useState(0);

  // Validation
  const [errors, setErrors] = useState({});

  // Totals
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const rawTotal = subtotal + tax;
  const orderTotal = useMemo(() => Math.max(rawTotal - discount, 0), [rawTotal, discount]);
  const totalLabel = useMemo(() => money(orderTotal), [orderTotal]);

  const [payCurrency, setPayCurrency] = useState("usdt");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Empty cart redirect
  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 pt-28">
        <p className="text-lg text-white/60">Your bag is empty.</p>
        <button
          onClick={() => navigate("/shop")}
          className="rounded-full bg-white text-black px-8 py-3 text-sm font-semibold"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const applyCoupon = () => {
    if (!coupon) { setCouponMsg("Enter a code."); return; }
    if (coupon.trim().toUpperCase() === "GAS10") {
      const d = rawTotal * 0.1;
      setDiscount(d);
      setCouponMsg(`Coupon applied: -${money(d)}`);
    } else {
      setDiscount(0);
      setCouponMsg("Invalid code.");
    }
  };

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (fulfillment === "ship") {
      if (!name.trim()) e.name = "Full name is required";
      if (!address1.trim()) e.address1 = "Address is required";
      if (!city.trim()) e.city = "City is required";
      if (!state.trim()) e.state = "State is required";
      if (!zip.trim()) e.zip = "ZIP is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setErr("");

      const orderDescription = cart
        .map((i) => `${i.name || i.strain_name} x${i.qty} ($${(i.price * i.qty).toFixed(2)})`)
        .join(", ");

      const addressSummary =
        fulfillment === "pickup"
          ? `Pickup @ ${pickupLocation}`
          : `${name} | ${address1}${address2 ? ", " + address2 : ""}, ${city}, ${state} ${zip}, ${country}`;

      const orderId = `order_${Date.now()}`;

      // ── 1. Save order to Supabase ──────────────────────────────
      const orderRow = {
        order_id: orderId,
        user_id: user?.id || null,
        email: email || null,
        status: "pending_payment",
        fulfillment_type: fulfillment,
        pickup_location: fulfillment === "pickup" ? pickupLocation : null,
        shipping_name: fulfillment === "ship" ? name : null,
        shipping_address:
          fulfillment === "ship"
            ? `${address1}${address2 ? ", " + address2 : ""}, ${city}, ${state} ${zip}, ${country}`
            : null,
        items: cart.map((i) => ({
          id: i.id,
          name: i.name || i.strain_name,
          price: i.price,
          qty: i.qty,
          grams: i.grams,
          image_url: i.image_url,
        })),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(orderTotal.toFixed(2)),
        pay_currency: payCurrency,
        subscribed_email: subscribe,
        created_at: new Date().toISOString(),
      };

      const { error: dbError } = await supabase.from("orders").insert([orderRow]);
      if (dbError) console.error("Order save error:", dbError);

      // ── 2. Create NOWPayments invoice ──────────────────────────
      const res = await fetch(`${FN_BASE}/create-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_amount: Number(orderTotal.toFixed(2)),
          price_currency: "usd",
          order_id: orderId,
          order_description: `${orderDescription} | ${fulfillment.toUpperCase()} | ${addressSummary}`.slice(0, 500),
          customer_email: email || undefined,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg =
          typeof payload === "string"
            ? payload
            : payload?.message || payload?.error || "Failed to create invoice";
        throw new Error(msg);
      }

      let invoiceUrl = null;
      if (typeof payload === "string") {
        try { invoiceUrl = JSON.parse(payload)?.invoice_url || null; } catch {}
      } else {
        invoiceUrl = payload?.invoice_url || null;
      }
      if (!invoiceUrl) throw new Error("Invoice URL missing: " + JSON.stringify(payload));

      // ── 3. Update order with payment link ─────────────────────
      await supabase
        .from("orders")
        .update({ invoice_url: invoiceUrl, status: "awaiting_payment" })
        .eq("order_id", orderId);

      // ── 4. Send order confirmation email ──────────────────────
      fetch(`${FN_BASE}/send-order-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          type: "order_placed",
          order_id: orderId,
          total: orderTotal.toFixed(2),
          items: orderRow.items,
          fulfillment: fulfillment === "pickup" ? `Pickup @ ${pickupLocation}` : "Shipping",
        }),
      }).catch(() => {}); // fire-and-forget

      // ── 5. Clear cart and redirect ────────────────────────────
      clearCart();
      window.location.href = invoiceUrl;
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label, value, setter, key, type = "text", extraCls = "") => (
    <div className={extraCls}>
      <input
        type={type}
        placeholder={label}
        className={`w-full rounded-lg bg-black border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 ${
          errors[key] ? "border-red-500" : "border-neutral-700"
        }`}
        value={value}
        onChange={(e) => setter(e.target.value)}
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pt-28">
        {/* Breadcrumb */}
        <div className="text-sm text-neutral-400 mb-6">
          <span className="text-white">Information</span>
          <span className="mx-2">›</span>
          <span>Shipping</span>
          <span className="mx-2">›</span>
          <span>Payment</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* LEFT */}
          <section className="space-y-6">
            {/* Payment banner */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Crypto accepted via NOWPayments</p>
                  <p className="text-xs text-neutral-400">Pay securely with USDT, BTC, or ETH at checkout.</p>
                </div>
              </div>
            </div>

            {/* Currency chips */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-sm text-neutral-300 mb-3">Express checkout</p>
              <div className="grid grid-cols-3 gap-3">
                {["usdt", "btc", "eth"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPayCurrency(c)}
                    className={`h-12 rounded-full border px-4 text-sm capitalize transition ${
                      payCurrency === c
                        ? "bg-white text-black border-white"
                        : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {c === "usdt" ? "USDT (Tether)" : c.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="relative my-5">
                <div className="h-px bg-neutral-800" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-neutral-900 px-3 text-xs text-neutral-500">OR</span>
              </div>
              <p className="text-xs text-neutral-500">You'll be redirected to a secure NOWPayments invoice to complete payment.</p>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-base font-semibold mb-4">Contact</h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className={`w-full rounded-lg bg-black border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 ${
                      errors.email ? "border-red-500" : "border-neutral-700"
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <label className="flex items-start gap-3 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    className="mt-1 accent-white"
                    checked={subscribe}
                    onChange={(e) => setSubscribe(e.target.checked)}
                  />
                  <span>Tick here to receive emails about our products, apps, sales, exclusive content and more.</span>
                </label>
              </div>
            </div>

            {/* Fulfillment */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-base font-semibold mb-4">Fulfillment</h2>
              <div className="inline-flex rounded-full bg-black border border-neutral-700 p-1">
                {["ship", "pickup"].map((f) => (
                  <button
                    key={f}
                    className={`px-4 py-2 text-sm rounded-full capitalize transition ${
                      fulfillment === f
                        ? "bg-white text-black"
                        : "text-neutral-300 hover:text-white"
                    }`}
                    onClick={() => setFulfillment(f)}
                  >
                    {f === "ship" ? "Ship" : "Pickup"}
                  </button>
                ))}
              </div>
            </div>

            {/* Address or pickup */}
            {fulfillment === "ship" ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-base font-semibold mb-4">Shipping address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {field("Full name", name, setName, "name", "text", "col-span-1 md:col-span-2")}
                  {field("Address", address1, setAddress1, "address1", "text", "col-span-1 md:col-span-2")}
                  <input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    className="col-span-1 md:col-span-2 rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                  />
                  {field("City", city, setCity, "city")}
                  {field("State", state, setState, "state")}
                  {field("ZIP", zip, setZip, "zip")}
                  <input
                    type="text"
                    placeholder="Country"
                    className="rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-base font-semibold mb-4">Pickup location</h2>
                <select
                  className="w-full rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                >
                  <option>Los Angeles – Fairfax</option>
                  <option>Los Angeles – DTLA</option>
                  <option>New York – SoHo</option>
                  <option>Miami – Wynwood</option>
                </select>
                <p className="text-xs text-neutral-400 mt-3">You'll receive a confirmation email with pickup instructions and ID requirements.</p>
              </div>
            )}

            {/* Pay */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full rounded-xl bg-white text-black font-semibold py-3 disabled:opacity-50 transition hover:bg-white/90"
              >
                {loading ? "Creating invoice…" : `Pay ${totalLabel} with ${payCurrency.toUpperCase()}`}
              </button>
            </div>
          </section>

          {/* RIGHT: Summary */}
          <aside className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 h-fit sticky top-28">
            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Gift Card, Redemption or Discount code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none"
              />
              <button type="button" onClick={applyCoupon} className="rounded-lg bg-neutral-200 text-black px-4 text-sm font-medium">
                APPLY
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs mb-4 ${discount ? "text-green-400" : "text-red-400"}`}>{couponMsg}</p>
            )}

            {/* Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${item.grams}`} className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                    <img src={item.image_url} alt={item.name || item.strain_name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.name || item.strain_name}</p>
                    <p className="text-xs text-neutral-400">{item.grams ? `${item.grams}g · ` : ""}Qty {item.qty}</p>
                  </div>
                  <div className="text-sm shrink-0">{money(item.price * item.qty)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-300">
                <span>Subtotal</span><span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Tax (8.875%)</span><span>{money(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span><span>-{money(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-300">
                <span>Shipping</span>
                <span>{fulfillment === "pickup" ? "N/A (pickup)" : "Calculated at payment"}</span>
              </div>
              <div className="border-t border-neutral-800 my-3" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span><span>{totalLabel}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-2 text-sm text-neutral-300 mt-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-white" />
                  <span>TOTAL SAVINGS <b>{money(discount)}</b></span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
