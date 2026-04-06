/**
 * Loading Spinner Component
 */
import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-full border-4 border-white/10 border-t-[var(--color-primary)]`}
      />
      {text && (
        <p className="text-[var(--color-text-muted)] text-sm animate-pulse-slow">{text}</p>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="card">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-full" />
        <div className="flex justify-between items-center">
          <div className="h-7 skeleton w-20" />
          <div className="h-10 w-10 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}
