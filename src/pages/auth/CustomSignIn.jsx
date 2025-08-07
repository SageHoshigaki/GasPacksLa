// src/pages/auth/CustomSignIn.jsx
import React, { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import AuthLayout from "./AuthLayout";

function WalletButtons({ signIn }) {
  const [busy, setBusy] = useState(false);

  const withGuard = (fn) => async () => {
    if (!signIn) return;
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      alert(
        e?.errors?.[0]?.message ||
          "Wallet sign-in is not enabled on this project yet. Please enable Web3 auth in Clerk or wire SIWE."
      );
    } finally {
      setBusy(false);
    }
  };

  // Google OAuth (works out of the box if enabled in Clerk dashboard)
  const loginGoogle = withGuard(async () => {
    if (!signIn.authenticateWithRedirect) {
      throw new Error("OAuth redirect is unavailable in this environment.");
    }
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  });

  // MetaMask (will only work if your Clerk instance exposes this method)
  const loginMetamask = withGuard(async () => {
    if (typeof signIn.authenticateWithMetamask !== "function") {
      throw new Error("MetaMask auth is not available in this Clerk setup.");
    }
    const res = await signIn.authenticateWithMetamask({
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
    return res;
  });

  // Coinbase Wallet (will only work if your Clerk instance exposes this method)
  const loginCoinbase = withGuard(async () => {
    if (typeof signIn.authenticateWithCoinbaseWallet !== "function") {
      throw new Error("Coinbase Wallet auth is not available in this Clerk setup.");
    }
    const res = await signIn.authenticateWithCoinbaseWallet({
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
    return res;
  });

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={loginGoogle}
        disabled={busy}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
      >
        {/* simple G icon */}
        <span className="mr-2 inline-block align-middle">🟦</span>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={loginMetamask}
        disabled={busy}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        title="Sign in with MetaMask"
      >
        <span className="mr-2 inline-block align-middle">🦊</span>
        Continue with MetaMask
      </button>

      <button
        type="button"
        onClick={loginCoinbase}
        disabled={busy}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        title="Sign in with Coinbase Wallet"
      >
        <span className="mr-2 inline-block align-middle">💙</span>
        Continue with Coinbase Wallet
      </button>
    </div>
  );
}

export default function CustomSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setErr("");
    setLoading(true);
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        window.location.assign("/");
      } else {
        setErr("Additional steps required.");
      }
    } catch (error) {
      console.error(error);
      setErr(error?.errors?.[0]?.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      overline="gaspacks"
      title="Welcome back"
      subtitle={
        <span>
          Don’t have an account?{" "}
          <a className="text-orange-600 font-medium hover:underline" href="/sign-up">
            Create an account
          </a>
        </span>
      }
      videoSrc="/videos/hand.mp4"
    >
      {/* Email/Password */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            placeholder="you@email.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {err ? <p className="text-sm text-red-600">{err}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-neutral-900 py-3 text-white hover:bg-black disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="mt-2 text-sm">
          <a className="text-neutral-600 hover:underline" href="/forgot-password">
            Forgot your login details? Reset password
          </a>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4 text-xs text-neutral-500">
          <div className="h-px flex-1 bg-neutral-200" />
          or
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {/* Wallet & OAuth */}
        <WalletButtons signIn={signIn} />
      </form>
    </AuthLayout>
  );
}