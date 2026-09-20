import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useData } from '../hooks/useData';
import { FadeIn } from '../components/Animated';
import { Shimmer } from '@shimmer-from-structure/react';
import { SimulatedPC } from '../features/simulated-pc';
import { PROOF_LEVEL } from '../features/simulated-pc/lib/proofLevel';
import type { LevelData } from '../features/simulated-pc';

export default function Level() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const isPreview = levelId === 'preview';
  const id = Number(levelId);
  const level = useData<LevelData | null>(async () => {
    if (isPreview) return PROOF_LEVEL;
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
    if (!level.data || isPreview) return;
    api
      .post('/sessions/start', {
        session_name: level.data.name,
        level_id: level.data.id,
      })
      .then((res) => setSessionId(res.data.session?.id?.toString() ?? null))
      .catch(() => setSessionId(null));
  }, [level.data, isPreview]);

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

  if (Number.isNaN(id) && !isPreview) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-stock px-5 transition-colors duration-300">
        <FadeIn className="plate w-full max-w-md p-8 text-center">
          <span className="register">Plate Error — Invalid Route</span>
          <h1 className="mt-3 text-2xl font-bold text-strike">Mission Error</h1>
          <p className="mt-2 text-ink-soft">Invalid level ID</p>
          <button
            onClick={() => navigate('/levels')}
            className="mt-6 inline-flex min-h-[44px] items-center bg-ink px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-stock transition-colors hover:bg-seal-ink"
          >
            Back to Levels
          </button>
        </FadeIn>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-stock text-ink">
      {level.data ? (
        <SimulatedPC
          level={level.data}
          sessionId={sessionId}
          onComplete={handleComplete}
        />
      ) : (
        <Shimmer loading={true} shimmerColor="rgba(155, 156, 151, 0.35)" backgroundColor="rgba(155, 156, 151, 0.15)">
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
            <div className="h-10 w-64 bg-hairline-soft" />
            <div className="h-6 w-96 bg-hairline-soft" />
            <div className="mt-8 h-64 w-full max-w-4xl border border-hairline bg-hairline-soft" />
          </div>
        </Shimmer>
      )}
    </div>
  );
}
