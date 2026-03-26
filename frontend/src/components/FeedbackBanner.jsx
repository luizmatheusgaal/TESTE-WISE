import { useEffect } from 'react';

import { useCart } from '../context/useCart';

export function FeedbackBanner() {
  const { feedback, clearFeedback } = useCart();

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(clearFeedback, 3000);
    return () => window.clearTimeout(timer);
  }, [clearFeedback, feedback]);

  const tone =
    feedback?.type === 'error'
      ? 'border-rose-500/40 bg-rose-500/10 text-rose-100'
      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-50';

  return (
    <div className="min-h-[62px]">
      {feedback ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${tone}`} role="status">
          <p>{feedback.message}</p>
          {feedback.details?.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs opacity-90">
              {feedback.details.map((detail) => (
                <li key={`${detail.field}-${detail.message}`}>
                  {detail.field}: {detail.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}