// src/pages/auth/CustomSignUp.jsx
import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import AuthLayout from "./AuthLayout";

function WalletButtons({ signUp }) {
  const [busy, setBusy] = useState(false);

  const withGuard = (fn) => async () => {
    if (!signUp) return;
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      alert(
        e?.errors?.[0]?.message ||
          "Wallet sign-up is not enabled yet. Enable Web3 auth in Clerk or wire SIWE."
      );
    } finally {
      setBusy(false);
    }
  };

  // Google OAuth (works if enabled in Clerk dashboard)
  const signupGoogle = withGuard(async () => {
    if (!signUp.authenticateWithRedirect) {
      throw new Error("OAuth redirect is unavailable in this environment.");
    }
    await signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  });

  // MetaMask (requires Clerk Web3 helpers to be available)
  const signupMetamask = withGuard(async () => {
    if (typeof signUp.authenticateWithMetamask !== "function") {
      throw new Error("MetaMask auth is not available in this Clerk setup.");
    }
    await signUp.authenticateWithMetamask({
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  });

  // Coinbase Wallet (requires Clerk Web3 helpers to be available)
  const signupCoinbase = withGuard(async () => {
    if (typeof signUp.authenticateWithCoinbaseWallet !== "function") {
      throw new Error("Coinbase Wallet auth is not available in this Clerk setup.");
    }
    await signUp.authenticateWithCoinbaseWallet({
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  });

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signupGoogle}
        disabled={busy}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
      >
        <span className="mr-2 inline-block align-middle">🟦</span>
        Continue with Google
      </button>

      <button
        type="button"
        onClick={signupMetamask}
        disabled={busy}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        title="Sign up with MetaMask"
      >
        <span className="mr-2 inline-block align-middle">🦊</span>
        Continue with MetaMask
      </button>

      <button
        type="button"
        onClick={signupCoinbase}
        disabled={busy}
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        title="Sign up with Coinbase Wallet"
      >
        <span className="mr-2 inline-block align-middle">💙</span>
        Continue with Coinbase Wallet
      </button>
    </div>
  );
}

export default function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [stage, setStage] = useState("collect"); // 'collect' | 'verify'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const startSignUp = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setErr("");
    setLoading(true);
    try {
      // 1) Create the sign up
      await signUp.create({ emailAddress: email, password });
      // 2) Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStage("verify");
    } catch (error) {
      console.error(error);
      setErr(error?.errors?.[0]?.message || "Sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setErr("");
    setLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        window.location.assign("/");
      } else {
        setErr("Additional steps required.");
      }
    } catch (error) {
      console.error(error);
      setErr(error?.errors?.[0]?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      overline="gaspacks"
      title={stage === "collect" ? "Create your account" : "Verify your email"}
      subtitle={
        stage === "collect" ? (
          <span>
            Already a member?{" "}
            <a className="text-orange-600 font-medium hover:underline" href="/sign-in">
              Log in
            </a>
          </span>
        ) : (
          <span>
            We sent a 6-digit code to <span className="font-medium">{email}</span>
          </span>
        )
      }
      videoSrc="/videos/hand.mp4"
    >
      {stage === "collect" ? (
        <form onSubmit={startSignUp} className="space-y-4">
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
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </div>

          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-900 py-3 text-white hover:bg-black disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4 text-xs text-neutral-500">
            <div className="h-px flex-1 bg-neutral-200" />
            or
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          {/* OAuth + Wallet */}
          <WalletButtons signUp={signUp} />
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 tracking-widest text-center outline-none focus:border-neutral-900"
              placeholder="______"
              maxLength={6}
            />
          </div>

          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-900 py-3 text-white hover:bg-black disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
              } catch (error) {
                setErr(error?.errors?.[0]?.message || "Could not resend code.");
              }
            }}
            className="w-full text-sm text-neutral-600 hover:underline mt-2"
          >
            Resend code
          </button>
        </form>
      )}
    </AuthLayout>
  );
}