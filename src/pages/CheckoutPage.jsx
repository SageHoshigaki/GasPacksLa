import { useMemo, useState } from "react";
import Navbar from "../components/ui/Navbar";
import { useCart } from "../context/CartContext";

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

export default function CheckoutPage() {
  const { cart = [], subtotal } = useCart();

  // Contact
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(false);

  // Fulfillment: "ship" | "pickup"
  const [fulfillment, setFulfillment] = useState("ship");

  // Shipping address fields
  const [name, setName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");

  // Pickup location
  const [pickupLocation, setPickupLocation] = useState("Los Angeles – Fairfax");

  // Discount
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = 0; // compute later if needed
  const rawTotal = subtotal + shipping;
  const orderTotal = Math.max(rawTotal - discount, 0);
  const totalLabel = useMemo(() => money(orderTotal), [orderTotal]);

  const [payCurrency, setPayCurrency] = useState("usdt"); // "usdt" | "btc" | "eth"
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const applyCoupon = () => {
    if (!coupon) {
      setCouponMsg("Enter a code.");
      return;
    }
    if (coupon.trim().toUpperCase() === "GAS10") {
      const d = rawTotal * 0.1;
      setDiscount(d);
      setCouponMsg(`Coupon applied: -${money(d)}`);
    } else {
      setDiscount(0);
      setCouponMsg("Invalid code.");
    }
  };

  const handlePay = async () => {
    try {
      setLoading(true);
      setErr("");

      const orderDescription =
        cart.length === 0
          ? "No items"
          : cart
              .map((i) => `${i.name} x${i.qty} ($${(i.price * i.qty).toFixed(2)})`)
              .join(", ");

      const addressSummary =
        fulfillment === "pickup"
          ? `Pickup @ ${pickupLocation}`
          : `${name || ""} | ${address1}${
              address2 ? ", " + address2 : ""
            }, ${city}, ${state} ${zip}, ${country}`;

      const res = await fetch("/.netlify/functions/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_amount: Number(orderTotal.toFixed(2)),
          price_currency: "usd",
          pay_currency: payCurrency,
          order_id: `order_${Date.now()}`,
          order_description: `${orderDescription} | Fulfillment: ${fulfillment.toUpperCase()} | ${addressSummary}`,
          customer_email: email || undefined,
          customer_name: name || undefined,
          metadata: {
            items: cart,
            newsletter_opt_in: subscribe,
            fulfillment,
            address:
              fulfillment === "ship"
                ? { name, address1, address2, city, state, zip, country }
                : null,
            pickup_location: fulfillment === "pickup" ? pickupLocation : null,
            coupon: coupon || null,
            discount: Number(discount.toFixed(2)),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create invoice");
      if (!data.invoice_url) throw new Error("Invoice URL missing");

      window.location.href = data.invoice_url;
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
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
            {/* Banner */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Crypto accepted via NOWPayments</p>
                  <p className="text-xs text-neutral-400">
                    Pay securely with USDT, BTC, or ETH at checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* Express (currency chips) */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-sm text-neutral-300 mb-3">Express checkout</p>
              <div className="grid grid-cols-3 gap-3">
                {["usdt", "btc", "eth"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPayCurrency(c)}
                    className={`h-12 rounded-full border px-4 text-sm capitalize transition
                      ${
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
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-neutral-900 px-3 text-xs text-neutral-500">
                  OR
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                You’ll be redirected to a secure NOWPayments invoice to complete payment.
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-base font-semibold mb-4">Contact</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="flex items-start gap-3 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    className="mt-1 accent-white"
                    checked={subscribe}
                    onChange={(e) => setSubscribe(e.target.checked)}
                  />
                  <span>
                    Tick here to receive emails about our products, apps, sales, exclusive
                    content and more.
                  </span>
                </label>
              </div>
            </div>

            {/* Fulfillment selector */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-base font-semibold mb-4">Fulfillment</h2>
              <div className="inline-flex rounded-full bg-black border border-neutral-700 p-1">
                <button
                  className={`px-4 py-2 text-sm rounded-full transition ${
                    fulfillment === "ship"
                      ? "bg-white text-black"
                      : "text-neutral-300 hover:text-white"
                  }`}
                  onClick={() => setFulfillment("ship")}
                >
                  Ship
                </button>
                <button
                  className={`px-4 py-2 text-sm rounded-full transition ${
                    fulfillment === "pickup"
                      ? "bg-white text-black"
                      : "text-neutral-300 hover:text-white"
                  }`}
                  onClick={() => setFulfillment("pickup")}
                >
                  Pickup
                </button>
              </div>
            </div>

            {/* Shipping address (only when Ship) */}
            {fulfillment === "ship" ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-base font-semibold mb-4">Shipping address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    className="col-span-1 md:col-span-2 rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    className="col-span-1 md:col-span-2 rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    className="col-span-1 md:col-span-2 rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="City"
                    className="rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    className="rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    className="rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    className="rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              // Pickup selector
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-base font-semibold mb-4">Pickup location</h2>
                <select
                  className="w-full rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                >
                  <option>Los Angeles – Fairfax</option>
                  <option>Los Angeles – DTLA</option>
                  <option>New York – SoHo</option>
                  <option>Miami – Wynwood</option>
                </select>
                <p className="text-xs text-neutral-400 mt-3">
                  You’ll receive a confirmation email with pickup instructions and ID
                  requirements.
                </p>
              </div>
            )}

            {/* Final pay button */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
              <button
                onClick={handlePay}
                disabled={cart.length === 0 || loading}
                className="w-full rounded-xl bg-white text-black font-semibold py-3 disabled:opacity-50"
              >
                {loading ? "Creating invoice…" : `Pay with ${payCurrency.toUpperCase()}`}
              </button>
            </div>
          </section>

          {/* RIGHT: Summary */}
          <aside className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 h-fit">
            {/* Discount */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Gift Card, Redemption or Discount code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 rounded-lg bg-black border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-lg bg-neutral-200 text-black px-4 text-sm font-medium"
              >
                APPLY
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs mb-4 ${discount ? "text-green-400" : "text-red-400"}`}>
                {couponMsg}
              </p>
            )}

            {/* Items */}
            <div className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-neutral-400">Your bag is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-neutral-800">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.name}</p>
                      <p className="text-xs text-neutral-400">Qty {item.qty}</p>
                    </div>
                    <div className="text-sm">{money(item.price * item.qty)}</div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-300">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{money(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-300">
                <span>Shipping</span>
                <span>
                  {fulfillment === "pickup" ? "Not applicable (pickup)" : "Calculated at next step"}
                </span>
              </div>
              <div className="border-t border-neutral-800 my-3" />
              <div className="flex justify-between text-base">
                <span className="font-medium">Total</span>
                <span className="font-semibold">{totalLabel}</span>
              </div>
              <p className="text-xs text-neutral-500">Including taxes if applicable.</p>
              {discount > 0 && (
                <div className="flex items-center gap-2 text-sm text-neutral-300 mt-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-white" />
                  <span>
                    TOTAL SAVINGS <b>{money(discount)}</b>
                  </span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}