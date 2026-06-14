// src/pages/OrderCancel.jsx
import { Link } from "react-router-dom";

export default function OrderCancel() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 pt-28">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-full bg-red-500/15 flex items-center justify-center">
          <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold">Payment Cancelled</h1>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
          Your payment was not completed. No charges were made. Your order is still saved — you can return to checkout to try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/checkout"
            className="rounded-full bg-white text-black px-8 py-3 text-sm font-semibold hover:bg-white/90 transition"
          >
            Return to Checkout
          </Link>
          <Link
            to="/shop"
            className="rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-white/60 hover:text-white hover:border-white/30 transition"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
