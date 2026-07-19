import { useRef, useState } from 'react';
import {
  ArrowLeft,
  Home,
  Lock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
} from 'lucide-react';

type SecurityLevel = 'safe' | 'secure' | 'neutral' | 'dangerous';

interface SimPage {
  url: string;
  title: string;
  isHttps: boolean;
  certValid: boolean;
  certIssuer: string;
  certExpiry: string;
  securityLevel: SecurityLevel;
  threat?: string;
  threatLevel?: string;
  riskFactors: string[];
  features: string[];
  content: React.ReactNode;
}

const pages: Record<string, SimPage> = {
  'https://news-site.com': {
    url: 'https://news-site.com',
    title: 'Tech News Daily',
    isHttps: true,
    certValid: true,
    certIssuer: 'CloudFlare Inc ECC CA-3',
    certExpiry: 'Dec 2026',
    securityLevel: 'secure',
    riskFactors: [],
    features: [
      'Modern ECC encryption',
      'CloudFlare security protection',
      'Content delivery network',
      'DDoS protection',
    ],
    content: <NewsSiteHome />,
  },
  'https://phalanx-cyber-academy.vercel.app': {
    url: 'https://phalanx-cyber-academy.vercel.app',
    title: 'Phalanx Cyber Academy Training',
    isHttps: true,
    certValid: true,
    certIssuer: "Let's Encrypt Authority X3",
    certExpiry: 'Nov 2026',
    securityLevel: 'safe',
    riskFactors: [],
    features: ['Valid SSL/TLS certificate', 'Strong encryption', 'Regular security updates', 'Trusted certificate authority'],
    content: <CyberQuestHome />,
  },
  'https://securebank.com': {
    url: 'https://securebank.com',
    title: 'SecureBank Online',
    isHttps: true,
    certValid: true,
    certIssuer: 'DigiCert SHA2 Extended Validation Server CA',
    certExpiry: 'Jan 2027',
    securityLevel: 'secure',
    riskFactors: [],
    features: [
      'Extended Validation certificate',
      'Organization identity verified',
      'Strong 4096-bit encryption',
      'Premium security standards',
      'Regular security audits',
    ],
    content: <SecureBankHome />,
  },
  'https://secure-verify-support.com': {
    url: 'https://secure-verify-support.com',
    title: 'Secure Banking - Login',
    isHttps: true,
    certValid: false,
    certIssuer: 'Fake Certificate Authority Ltd',
    certExpiry: 'Expired',
    securityLevel: 'dangerous',
    threat: 'Fake banking website designed to steal credentials and personal information',
    threatLevel: 'critical',
    riskFactors: ['Credential theft', 'Identity theft', 'Financial fraud', 'Account takeover', 'Personal data harvesting'],
    features: [],
    content: <PhishingBankHome />,
  },
  'https://suspicious-site.com': {
    url: 'https://suspicious-site.com',
    title: 'WIN BIG NOW!',
    isHttps: true,
    certValid: false,
    certIssuer: 'Self-signed Certificate Authority',
    certExpiry: 'Expired',
    securityLevel: 'dangerous',
    threat: 'Known scam website attempting to steal personal information',
    threatLevel: 'high',
    riskFactors: ['Fraudulent prize claims', 'Identity theft attempts', 'Credit card fraud', 'Personal data harvesting'],
    features: [],
    content: <SuspiciousHome />,
  },
};

const homeUrl = 'https://phalanx-cyber-academy.vercel.app';

export function BrowserApp() {
  const [url, setUrl] = useState(homeUrl);
  const history = useRef<string[]>([homeUrl]);
  const page = pages[url] ?? pages[homeUrl];

  const navigate = (next: string) => {
    const normalized = next.trim();
    const resolved = normalized.startsWith('https://') ? normalized : `https://${normalized}`;
    setUrl(resolved);
    history.current.push(resolved);
  };

  const goBack = () => {
    if (history.current.length <= 1) return;
    history.current.pop();
    setUrl(history.current[history.current.length - 1] ?? homeUrl);
  };

  const status = getStatus(page.securityLevel);

  return (
    <div className="flex h-full flex-col bg-white text-gray-900">
      <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-100 p-2">
        <button onClick={goBack} className="rounded p-1.5 hover:bg-gray-200" title="Back">
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </button>
        <button onClick={() => navigate(homeUrl)} className="rounded p-1.5 hover:bg-gray-200" title="Home">
          <Home className="h-4 w-4 text-gray-600" />
        </button>
        <div className="flex flex-1 items-center rounded border border-gray-300 bg-white px-2 py-1.5">
          {page.isHttps && page.certValid ? (
            <Lock className="mr-2 h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span className="text-xs text-gray-500">{page.isHttps ? 'https://' : 'http://'}</span>
          <input
            type="text"
            value={url.replace(/^https?:\/\//, '')}
            onChange={(e) => setUrl((e.target.value.startsWith('http') ? '' : 'https://') + e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(url);
            }}
            className="ml-1 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${status.bg} ${status.text}`}>{status.label}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">{page.content}</div>
        <div className="w-64 overflow-y-auto border-l border-gray-300 bg-gray-50 p-3 text-xs">
          <h3 className="mb-2 flex items-center font-bold text-gray-700">
            <Shield className="mr-1.5 h-4 w-4" /> Site Security
          </h3>
          <SecurityRow label="HTTPS" value={page.isHttps ? 'Yes' : 'No'} ok={page.isHttps} />
          <SecurityRow label="Certificate" value={page.certValid ? 'Valid' : page.certIssuer} ok={page.certValid} />
          <SecurityRow label="Expires" value={page.certExpiry} ok={page.certValid} />
          {page.threat && (
            <>
              <div className="my-2 border-t border-gray-300" />
              <p className="mb-1 font-semibold text-red-700">Threat</p>
              <p className="mb-2 text-gray-600">{page.threat}</p>
              <p className="font-semibold text-red-700">Risk factors</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-600">
                {page.riskFactors.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </>
          )}
          {page.features.length > 0 && (
            <>
              <div className="my-2 border-t border-gray-300" />
              <p className="mb-1 font-semibold text-green-700">Security features</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-600">
                {page.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </>
          )}

          <div className="my-3 border-t border-gray-300" />
          <p className="mb-1 font-semibold text-gray-700">Training bookmarks</p>
          <div className="space-y-1">
            {Object.values(pages).map((p) => (
              <button
                key={p.url}
                onClick={() => navigate(p.url)}
                className="block w-full text-left text-blue-600 hover:underline"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  const Icon = ok ? CheckCircle : XCircle;
  return (
    <div className="flex items-start gap-1.5 py-1">
      <Icon className={`mt-0.5 h-3.5 w-3.5 ${ok ? 'text-green-600' : 'text-red-500'}`} />
      <div>
        <span className="font-medium text-gray-700">{label}:</span>{' '}
        <span className={ok ? 'text-green-700' : 'text-red-700'}>{value}</span>
      </div>
    </div>
  );
}

function getStatus(level: SecurityLevel) {
  switch (level) {
    case 'safe':
      return { label: 'Safe', bg: 'bg-green-100', text: 'text-green-800' };
    case 'secure':
      return { label: 'Secure', bg: 'bg-green-100', text: 'text-green-800' };
    case 'dangerous':
      return { label: 'Dangerous', bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { label: 'Unknown', bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

function NewsSiteHome() {
  const articles = [
    { title: 'Cybersecurity Threats on the Rise', time: '2 hours ago', excerpt: 'Security experts warn of increasing phishing attempts targeting remote workers...' },
    { title: 'New Browser Security Features', time: '5 hours ago', excerpt: 'Major browsers implement enhanced protection against malicious websites...' },
    { title: 'Best Practices for Online Safety', time: '1 day ago', excerpt: 'Learn essential tips to protect yourself from online threats...' },
  ];
  return (
    <div className="p-6 text-gray-800">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Tech News Daily</h1>
        <p className="text-gray-600">Latest in Technology and Cybersecurity</p>
      </header>
      <main className="space-y-6">
        {articles.map((a, i) => (
          <article key={i} className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold">{a.title}</h2>
            <p className="mb-3 text-sm text-gray-600">Published {a.time}</p>
            <p className="text-gray-700">{a.excerpt}</p>
            <span className="mt-2 inline-block text-sm text-blue-600 hover:underline">Read more</span>
          </article>
        ))}
      </main>
    </div>
  );
}

function CyberQuestHome() {
  return (
    <div className="p-6 text-gray-800">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phalanx Cyber Academy</h1>
            <p className="text-gray-600">Professional Cybersecurity Education</p>
          </div>
        </div>
      </header>
      <section className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <h2 className="mb-2 text-lg font-semibold text-green-800">Secure Connection</h2>
        <p className="text-green-700">This is a legitimate educational website with proper security measures.</p>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Training Modules</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded border border-gray-200 p-4">
            <h3 className="font-semibold">Email Security</h3>
            <p className="text-sm text-gray-600">Learn to identify phishing attempts</p>
          </div>
          <div className="rounded border border-gray-200 p-4">
            <h3 className="font-semibold">Web Security</h3>
            <p className="text-sm text-gray-600">Recognize malicious websites</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SecureBankHome() {
  return (
    <div className="bg-blue-50 p-6 text-gray-800">
      <header className="mb-6 border-b border-blue-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-600 text-white">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">SecureBank Online</h1>
              <p className="text-blue-700">Secure Online Banking</p>
            </div>
          </div>
          <div className="flex items-center text-green-600">
            <CheckCircle className="mr-1 h-4 w-4" />
            <span className="text-sm">Extended Validation</span>
          </div>
        </div>
      </header>
      <section className="mb-6 rounded-lg border border-blue-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-blue-900">Account Login</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input type="text" className="w-full rounded border border-gray-300 px-3 py-2" placeholder="Enter your username" readOnly />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="w-full rounded border border-gray-300 px-3 py-2" placeholder="Enter your password" readOnly />
          </div>
          <button className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Sign In</button>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border border-blue-200 bg-white p-4">
          <h3 className="font-semibold text-blue-900">Security Notice</h3>
          <p className="mt-2 text-sm text-gray-600">We will never ask for your login credentials via email or phone.</p>
        </div>
        <div className="rounded border border-blue-200 bg-white p-4">
          <h3 className="font-semibold text-blue-900">Contact Us</h3>
          <p className="mt-2 text-sm text-gray-600">Call 1-800-BANK-123 for assistance.</p>
        </div>
        <div className="rounded border border-blue-200 bg-white p-4">
          <h3 className="font-semibold text-blue-900">Hours</h3>
          <p className="mt-2 text-sm text-gray-600">Available 24/7 for online banking.</p>
        </div>
      </section>
    </div>
  );
}

function PhishingBankHome() {
  return (
    <div className="bg-blue-50 p-6 text-gray-800">
      <header className="mb-6 border-b border-blue-200 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-600 text-white">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Secure Banking - Login</h1>
            <p className="text-blue-700">Your Trusted Banking Partner</p>
          </div>
        </div>
      </header>
      <div className="mb-6 rounded border border-red-300 bg-red-100 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <div>
            <strong className="text-red-800">URGENT SECURITY ALERT!</strong>
            <p className="text-sm text-red-700">Your account will be suspended in 24 hours due to suspicious activity. Please verify your credentials immediately!</p>
          </div>
        </div>
      </div>
      <section className="mb-6 rounded-lg border border-red-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold text-red-900">Emergency Account Verification Required</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input type="text" className="rounded border border-gray-300 px-3 py-2" placeholder="Full Name" readOnly />
          <input type="text" className="rounded border border-gray-300 px-3 py-2" placeholder="Account Number" readOnly />
          <input type="text" className="rounded border border-gray-300 px-3 py-2" placeholder="SSN" readOnly />
          <input type="password" className="rounded border border-gray-300 px-3 py-2" placeholder="Password" readOnly />
          <input type="text" className="rounded border border-gray-300 px-3 py-2" placeholder="Mother's Maiden Name" readOnly />
        </div>
        <button className="mt-4 w-full rounded bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700">⚠ VERIFY ACCOUNT NOW</button>
      </section>
      <div className="rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
        <strong>Training Alert:</strong> This is a classic phishing attempt! Real banks never ask for sensitive information via web forms like this.
      </div>
    </div>
  );
}

function SuspiciousHome() {
  return (
    <div className="bg-gradient-to-br from-red-100 to-orange-100 p-6 text-center text-black">
      <div className="mb-4 animate-pulse">
        <h1 className="mb-2 text-4xl font-bold text-red-600">CONGRATULATIONS! YOU'VE WON!</h1>
        <div className="text-2xl font-bold text-yellow-600">$1,000,000 CASH PRIZE!</div>
      </div>
      <div className="mb-6 rounded border-2 border-yellow-400 bg-yellow-200 p-4">
        <p className="mb-2 text-lg font-semibold">LIMITED TIME OFFER!</p>
        <p className="mb-4">You are visitor #999,999 and have been selected to receive this exclusive prize!</p>
        <p className="font-bold text-red-600">CLAIM NOW OR LOSE FOREVER!</p>
      </div>
      <button className="mb-6 rounded bg-gradient-to-r from-red-500 to-orange-500 px-8 py-4 text-xl font-bold text-white shadow-lg animate-bounce">
        💰 CLAIM YOUR PRIZE NOW! 💰
      </button>
      <div className="space-y-2 text-sm text-gray-600">
        <p>* No catch, totally legitimate *</p>
        <p>* 100% Real, Not a Scam *</p>
        <p className="text-xs">By clicking above, you agree to provide your bank details and social security number</p>
      </div>
      <div className="mt-6 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700">
        <strong>Training Alert:</strong> This is clearly a scam website. Never provide personal information to sites like this!
      </div>
    </div>
  );
}
