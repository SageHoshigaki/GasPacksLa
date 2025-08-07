import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';

import { CartProvider } from './context/CartContext';
import { CartUIProvider } from './context/CartUIContext';
import './index.css';               // Tailwind output
import App from './App.jsx';

/* ─── env var (rename from CRA style) ───── */
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey?.startsWith('pk_')) {
  throw new Error('Missing or invalid VITE_CLERK_PUBLISHABLE_KEY');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/account"
      afterSignUpUrl="/account"
    >
      <CartUIProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </CartUIProvider>
    </ClerkProvider>
  </React.StrictMode>
);