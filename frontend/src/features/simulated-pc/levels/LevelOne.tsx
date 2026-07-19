import { useState } from 'react';
import { useSimulatedPC } from '../context/SimulatedPCContext';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  author: string;
  author_credentials?: string;
  date: string;
  website: string;
  content: string;
  label: number;
}

function getStatus(isLegit: boolean) {
  return isLegit
    ? { label: 'Trusted', bg: 'bg-green-100', text: 'text-green-800' }
    : { label: 'Warning', bg: 'bg-red-100', text: 'text-red-800' };
}

export function LevelOne() {
  const { completeSession, content } = useSimulatedPC();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { correct: boolean; label: 'real' | 'fake' }>>({});
  const [finished, setFinished] = useState(false);

  const articles = (content?.data?.articles as Article[] | undefined) ?? [];
  const article = articles[current];

  if (articles.length === 0) {
    return (
      <div className="mx-auto max-w-3xl rounded border border-gray-600 bg-gray-800 p-6 text-white">
        <h2 className="text-xl font-bold">No articles available</h2>
      </div>
    );
  }

  const isLegit = article ? article.label === 0 : true;
  const protocol = isLegit ? 'https://' : 'http://';
  const url = article ? `${protocol}news.${article.website}` : 'https://news.example.com';

  const handleAnswer = (answer: 'real' | 'fake') => {
    if (!article) return;
    const isCorrect = (article.label === 0 && answer === 'real') || (article.label === 1 && answer === 'fake');
    const alreadyAnswered = answers[current] !== undefined;
    setAnswers((prev) => ({ ...prev, [current]: { correct: isCorrect, label: answer } }));
    const newlyAnsweredCount = Object.keys(answers).length + (alreadyAnswered ? 0 : 1);
    if (newlyAnsweredCount >= articles.length) {
      setFinished(true);
    } else {
      setCurrent((i) => Math.min(articles.length - 1, i + 1));
    }
  };

  const answered = Object.values(answers);
  const score = Math.round((answered.filter((r) => r.correct).length / Math.max(1, articles.length)) * 100);

  if (finished) {
    return (
      <div className="mx-auto max-w-3xl rounded border border-gray-600 bg-gray-800 p-6 text-white shadow-2xl">
        <h2 className="text-2xl font-bold text-green-400">Level 1 Complete</h2>
        <p className="mt-2 text-lg">
          You scored <span className="font-bold text-green-400">{score}%</span> ({answered.filter((r) => r.correct).length} / {articles.length})
        </p>
        <button
          onClick={() => completeSession(score)}
          className="mt-6 rounded bg-green-500 px-6 py-2 font-bold text-black hover:bg-green-400"
        >
          Finish &amp; Exit
        </button>
      </div>
    );
  }

  const status = getStatus(isLegit);

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded border border-gray-600 bg-white shadow-2xl">
      <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-100 px-4 py-2">
        <button
          onClick={() => setCurrent((i) => Math.max(0, i - 1))}
          disabled={current === 0}
          className="rounded p-1.5 hover:bg-gray-200 disabled:opacity-40"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </button>
        <button
          onClick={() => setCurrent((i) => Math.min(articles.length - 1, i + 1))}
          disabled={current === articles.length - 1}
          className="rounded p-1.5 hover:bg-gray-200 disabled:opacity-40"
          title="Forward"
        >
          <ArrowRight className="h-4 w-4 text-gray-600" />
        </button>
        <button className="rounded p-1.5 hover:bg-gray-200" title="Home">
          <Home className="h-4 w-4 text-gray-600" />
        </button>
        <div className="flex flex-1 items-center rounded border border-gray-300 bg-white px-2 py-1.5">
          {isLegit ? <Lock className="mr-2 h-4 w-4 text-green-600" /> : <Unlock className="mr-2 h-4 w-4 text-red-500" />}
          <span className="text-xs text-gray-500">{protocol}</span>
          <input
            type="text"
            value={url.replace(/^https?:\/\//, '')}
            readOnly
            className="ml-1 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${status.bg} ${status.text}`}>{status.label}</span>
      </div>

      <div className="flex h-[28rem] flex-col md:h-[32rem] md:flex-row">
        <div className="flex-1 overflow-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-semibold">{article.author}</span>{' '}
            {article.author_credentials && <span className="italic">— {article.author_credentials}</span>}
            <span className="ml-2 text-gray-500">{new Date(article.date).toLocaleDateString()}</span>
          </div>
          <p className="mt-4 whitespace-pre-line text-gray-800">{article.content}</p>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => handleAnswer('real')}
              className="inline-flex items-center rounded border-2 border-green-600 bg-green-50 px-6 py-3 font-bold text-green-700 hover:bg-green-100"
            >
              <CheckCircle className="mr-2 h-5 w-5" /> Legitimate News
            </button>
            <button
              onClick={() => handleAnswer('fake')}
              className="inline-flex items-center rounded border-2 border-red-600 bg-red-50 px-6 py-3 font-bold text-red-700 hover:bg-red-100"
            >
              <XCircle className="mr-2 h-5 w-5" /> Fake News
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Article {current + 1} of {articles.length}
          </p>
        </div>

        <div className="w-full overflow-y-auto border-t border-gray-300 bg-gray-50 p-3 text-xs md:w-64 md:border-t-0 md:border-l">
          <h3 className="mb-2 flex items-center font-bold text-gray-700">
            <Shield className="mr-1.5 h-4 w-4" /> Site Security
          </h3>
          <div className="flex items-start gap-1.5 py-1">
            {isLegit ? <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-green-600" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 text-red-500" />}
            <div>
              <span className="font-medium text-gray-700">HTTPS:</span>{' '}
              <span className={isLegit ? 'text-green-700' : 'text-red-700'}>{isLegit ? 'Enabled' : 'Missing / Invalid'}</span>
            </div>
          </div>
          <div className="flex items-start gap-1.5 py-1">
            {isLegit ? <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-green-600" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-red-500" />}
            <div>
              <span className="font-medium text-gray-700">Certificate:</span>{' '}
              <span className={isLegit ? 'text-green-700' : 'text-red-700'}>{isLegit ? 'Valid' : 'Self-signed / Expired'}</span>
            </div>
          </div>
          <div className="my-2 border-t border-gray-300" />
          <p className="mb-1 font-semibold text-gray-700">Indicators</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-gray-600">
            {isLegit ? (
              <>
                <li>Known reputable domain</li>
                <li>Professional byline</li>
                <li>HTTPS enabled</li>
              </>
            ) : (
              <>
                <li>Unverified domain</li>
                <li>Missing HTTPS</li>
                <li>Sensational or misleading claims</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
