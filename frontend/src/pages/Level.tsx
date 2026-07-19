import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useData } from '../hooks/useData';
import { FadeIn } from '../components/Animated';
import { Shimmer } from '@shimmer-from-structure/react';
import { SimulatedPC } from '../features/simulated-pc';
import type { LevelData } from '../features/simulated-pc';

export default function Level() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const id = Number(levelId);
  const level = useData<LevelData | null>(async () => {
    if (Number.isNaN(id)) throw new Error('Invalid level ID');
    const [meta, content] = await Promise.all([
      api.get(`/levels/${id}`),
      api.get(`/levels/${id}/content`).catch(() => ({ data: undefined })),
    ]);
    return {
      id: meta.data.level_id,
      name: meta.data.name,
      description: meta.data.description,
      category: meta.data.category,
      difficulty: meta.data.difficulty,
      xp_reward: meta.data.xp_reward,
      content: content.data,
    };
  }, [levelId], { initial: null });

  useEffect(() => {
    if (!level.data) return;
    api
      .post('/sessions/start', {
        session_name: level.data.name,
        level_id: level.data.id,
      })
      .then((res) => setSessionId(res.data.session?.id?.toString() ?? null))
      .catch(() => setSessionId(null));
  }, [level.data]);

  const handleComplete = async (payload: { score: number; timeSpent: number }) => {
    if (sessionId) {
      try {
        await api.post(`/sessions/${sessionId}/end`, { score: payload.score });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to end session:', err);
      }
    }
    navigate('/levels');
  };

  if (Number.isNaN(id)) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <FadeIn className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-red-600">Mission Error</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Invalid level ID</p>
          <button
            onClick={() => navigate('/levels')}
            className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700"
          >
            Back to Levels
          </button>
        </FadeIn>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {level.data ? (
        <SimulatedPC
          level={level.data}
          sessionId={sessionId}
          onComplete={handleComplete}
        />
      ) : (
        <Shimmer loading={true} shimmerColor="rgba(255,255,255,0.15)" backgroundColor="rgba(255,255,255,0.08)">
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
            <div className="h-10 w-64 rounded-lg bg-slate-700" />
            <div className="h-6 w-96 rounded bg-slate-700" />
            <div className="mt-8 h-64 w-full max-w-4xl rounded-xl bg-slate-700" />
          </div>
        </Shimmer>
      )}
    </div>
  );
}
