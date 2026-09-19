import { ClerkProvider } from '@clerk/react';
import { shadcn } from '@clerk/ui/themes';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY environment variable. Run `clerk env pull` or add it to frontend/.env.local'
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/" appearance={{ theme: shadcn }}>
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);
