// src/pages/OrderSuccess.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);

  // NOWPayments may append ?NP_id=... on redirect — try to look up order
  useEffect(() => {
    const npId = searchParams.get("NP_id");
    const orderId = searchParams.get("order_id");
    if (!orderId && !npId) return;

    (async () => {
      if (orderId) {
        const { data } = await supabase
          .from("orders")
          .select("order_id, total, email, fulfillment_type, pickup_location, status")
          .eq("order_id", orderId)
          .single();
        if (data) setOrder(data);
      }
    })();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 pt-28">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Checkmark */}
        <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold">Order Confirmed</h1>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
          Your payment has been received. You'll get a confirmation email shortly with your order details
          {order?.fulfillment_type === "pickup" ? " and pickup instructions" : " and tracking information"}.
        </p>

        {order && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-white/40">Order</span>
              <span className="font-mono text-white/70">{order.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Total</span>
              <span className="font-semibold">${Number(order.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Fulfillment</span>
              <span>
                {order.fulfillment_type === "pickup"
                  ? `Pickup @ ${order.pickup_location}`
                  : "Shipping"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Confirmation sent to</span>
              <span className="text-white/70">{order.email}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/shop"
            className="rounded-full bg-white text-black px-8 py-3 text-sm font-semibold hover:bg-white/90 transition"
          >
            Continue Shopping
          </Link>
          <Link
            to="/account"
            className="rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-white/60 hover:text-white hover:border-white/30 transition"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
