/**
 * ReviewSection Component
 * Shown on ProductDetailPage — displays reviews list,
 * average rating, and a form to write/edit a review.
 *
 * Features:
 *  - Paginated review list with user name + date
 *  - Write review form (login required)
 *  - Edit / delete own review
 *  - Duplicate prevention (shows edit form if user already reviewed)
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChatAlt2,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { reviewAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import StarRating from './StarRating';

// ─── Helper ────────────────────────────────────────────────────────────────── 
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

// ─── Single review card ───────────────────────────────────────────────────────
function ReviewCard({ review, currentUserId, onEdit, onDelete }) {
  const isOwner =
    currentUserId &&
    (review.userId?._id || review.userId) === currentUserId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Avatar + name + date */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {review.userId?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {review.userId?.name || 'Người dùng'}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {formatDate(review.createdAt)}
              {review.updatedAt !== review.createdAt && ' · đã chỉnh sửa'}
            </p>
          </div>
        </div>

        {/* Stars + actions */}
        <div className="flex items-center gap-3 shrink-0">
          <StarRating value={review.rating} size="sm" />
          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(review)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                title="Chỉnh sửa"
              >
                <HiOutlinePencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(review._id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                title="Xoá"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {review.comment}
        </p>
      )}
    </motion.div>
  );
}

// ─── Write / Edit form ────────────────────────────────────────────────────────
function ReviewForm({ productId, existing, initialRating = 0, onSuccess, onCancel }) {
  const [rating, setRating] = useState(existing?.rating || initialRating);
  const [comment, setComment] = useState(existing?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    setSubmitting(true);
    try {
      if (existing) {
        await reviewAPI.updateReview(existing._id, { rating, comment });
        toast.success('Đánh giá đã được cập nhật ✅');
      } else {
        await reviewAPI.createReview({ productId, rating, comment });
        toast.success('Cảm ơn bạn đã đánh giá! 🙏');
      }
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gửi đánh giá';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="glass-strong rounded-2xl p-5 overflow-hidden"
    >
      <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-[var(--color-text-muted)]">
        {existing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
      </h4>

      {/* Star picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Chất lượng sản phẩm</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Xuất sắc'][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Nhận xét <span className="text-[var(--color-text-muted)] font-normal">(tuỳ chọn)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none transition-colors placeholder:text-[var(--color-text-muted)]"
        />
        <p className="text-right text-xs text-[var(--color-text-muted)] mt-1">
          {comment.length}/500
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || !rating}
          className="btn-primary flex items-center gap-2 text-sm !py-2.5 disabled:opacity-50"
          id="review-submit-btn"
        >
          <HiOutlineCheck className="w-4 h-4" />
          {submitting ? 'Đang gửi...' : existing ? 'Lưu thay đổi' : 'Gửi đánh giá'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost flex items-center gap-2 text-sm !py-2.5"
          >
            <HiOutlineX className="w-4 h-4" /> Huỷ
          </button>
        )}
      </div>
    </motion.form>
  );
}

// ─── Main ReviewSection ───────────────────────────────────────────────────────
export default function ReviewSection({ productId }) {
  const { isAuthenticated, user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [initialRating, setInitialRating] = useState(0);

  // Find current user's review in the list
  const myReview = reviews.find(
    (r) => user && (r.userId?._id || r.userId) === user._id
  );

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await reviewAPI.getProductReviews(productId, {
        page,
        limit: 5,
      });
      setReviews(data.data || []);
      setPagination(data.pagination);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xoá đánh giá này?')) return;
    try {
      await reviewAPI.deleteReview(reviewId);
      toast.success('Đã xoá đánh giá');
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingReview(null);
    setInitialRating(0);
    fetchReviews();
  };

  // Average from loaded reviews
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-16" id="reviews">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HiOutlineChatAlt2 className="w-6 h-6 text-[var(--color-primary)]" />
            Đánh giá sản phẩm
          </h2>
          {pagination?.total > 0 && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {pagination.total} đánh giá
            </p>
          )}
        </div>

        {/* Average rating badge */}
        {avgRating > 0 && (
          <div className="glass rounded-2xl px-5 py-3 text-center">
            <p className="text-3xl font-black gradient-text">
              {avgRating.toFixed(1)}
            </p>
            <StarRating value={Math.round(avgRating)} size="sm" />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">/ 5 sao</p>
          </div>
        )}
      </div>

      {/* Write review CTA */}
      <AnimatePresence mode="wait">
        {!showForm && !editingReview && (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            {isAuthenticated ? (
              myReview ? (
                <div className="glass rounded-2xl p-4 flex items-center justify-between">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Bạn đã đánh giá sản phẩm này.
                  </p>
                  <button
                    onClick={() => setEditingReview(myReview)}
                    className="btn-ghost text-sm flex items-center gap-2 !py-2"
                  >
                    <HiOutlinePencil className="w-4 h-4" /> Chỉnh sửa
                  </button>
                </div>
              ) : (
                <div className="glass-strong rounded-3xl p-6 flex flex-col items-center gap-4 border border-white/5">
                  <p className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">
                    Bạn đánh giá sản phẩm này thế nào?
                  </p>
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    <StarRating 
                      value={0} 
                      size="lg" 
                      onChange={(val) => {
                        setInitialRating(val);
                        setShowForm(true);
                      }} 
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Chọn số sao để bắt đầu viết đánh giá
                  </p>
                </div>
              )
            ) : (
              <div className="glass rounded-2xl p-4 text-center text-sm text-[var(--color-text-muted)]">
                <a href="/login" className="text-[var(--color-primary)] hover:underline font-semibold">
                  Đăng nhập
                </a>{' '}
                để viết đánh giá
              </div>
            )}
          </motion.div>
        )}

        {/* Write form */}
        {(showForm || editingReview) && (
          <motion.div key="form" className="mb-6">
            <ReviewForm
              productId={productId}
              existing={editingReview}
              initialRating={initialRating}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingReview(null);
                setInitialRating(0);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <span className="text-4xl block mb-3">💬</span>
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={user?._id}
                onEdit={(r) => {
                  setShowForm(false);
                  setEditingReview(r);
                }}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
            className="btn-ghost text-sm !py-2 disabled:opacity-40"
          >
            ← Trước
          </button>
          <span className="flex items-center px-4 text-sm text-[var(--color-text-muted)]">
            {page} / {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost text-sm !py-2 disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      )}
    </section>
  );
}
