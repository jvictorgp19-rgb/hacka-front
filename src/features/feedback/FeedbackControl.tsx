'use client';
import { useEffect, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { Feedback } from '@/contracts/models';
import { useWorkspace } from '@/features/workspace/context';
export default function FeedbackControl({ targetId }: { targetId: string }) {
  const { gateway, context } = useWorkspace();
  const [saved, setSaved] = useState<Feedback | null>(null);
  const [review, setReview] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    gateway
      ?.feedback(context.persona, controller.signal)
      .then((list) => {
        if (!controller.signal.aborted) {
          const current = list.find((f) => f.targetId === targetId) || null;
          setSaved(current);
          setReason(current?.reason || '');
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setMessage(e instanceof Error ? e.message : 'Avaliação indisponível.');
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [gateway, context.persona, targetId]);
  async function submit(useful: boolean) {
    if (!gateway || busy || (!useful && !reason.trim())) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await gateway.saveFeedback({
        id: crypto.randomUUID(),
        targetId,
        persona: context.persona,
        useful,
        reason: useful ? '' : reason.trim(),
      });
      setSaved(result);
      setReview(false);
      setMessage('Avaliação confirmada pela API.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'A avaliação não foi enviada.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="answer-feedback">
      <div>
        <button
          className="icon-button"
          aria-label="Marcar resposta como útil"
          aria-pressed={saved?.useful === true}
          disabled={loading || busy}
          onClick={() => void submit(true)}
        >
          <ThumbsUp size={15} />
        </button>
        <button
          className="icon-button"
          aria-label="Sinalizar revisão da resposta"
          aria-pressed={saved?.useful === false}
          disabled={loading || busy}
          onClick={() => setReview(!review)}
        >
          <ThumbsDown size={15} />
        </button>
        <span className="muted">
          {saved
            ? saved.useful
              ? 'Resposta útil'
              : 'Revisão sinalizada'
            : 'Esta resposta ajudou?'}
        </span>
      </div>
      {review && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(false);
          }}
        >
          <label>
            O que precisa ser revisto?
            <textarea
              aria-label="Motivo da revisão"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button className="secondary-button" disabled={!reason.trim() || busy}>
            Salvar avaliação
          </button>
        </form>
      )}
      {message && (
        <p role="status" className="muted">
          {message}
        </p>
      )}
    </div>
  );
}
