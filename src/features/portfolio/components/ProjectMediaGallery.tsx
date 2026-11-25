import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Maximize2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { useLanguage } from '@/hooks/useLanguage';
import type { ProjectGalleryImage } from '@/types/portfolio';
import { cn } from '@/utils/cn';

interface ProjectMediaGalleryProps {
  images: ProjectGalleryImage[];
  projectTitle: string;
}

export function ProjectMediaGallery({
  images,
  projectTitle,
}: ProjectMediaGalleryProps) {
  const { t } = useTranslation(['pages', 'common']);
  const { pick, isRtl } = useLanguage();

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  const safeIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0;
  const activeImage = images[safeIndex];

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((prev) => (prev + 1) % count);
  }, [count]);

  // Reset active index when image list identity changes (e.g. navigating between projects)
  useEffect(() => {
    setActiveIndex(0);
    setLightboxOpen(false);
  }, [projectTitle]);

  // Keep selected thumbnail scrolled into view inside the thumbnail rail
  useEffect(() => {
    const btn = thumbRefs.current[safeIndex];
    if (btn && typeof btn.scrollIntoView === 'function') {
      btn.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [safeIndex]);

  // Lock background page scroll & handle keyboard controls while Lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        if (isRtl) goPrev();
        else goNext();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) goNext();
        else goPrev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, isRtl, goNext, goPrev]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || count <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 45) return;
    if (delta < 0) {
      if (isRtl) goPrev();
      else goNext();
    } else {
      if (isRtl) goNext();
      else goPrev();
    }
  };

  if (count === 0 || !activeImage) {
    return null;
  }

  const activeAlt = pick(activeImage.alt).trim() || projectTitle;
  const activeCaption = activeImage.caption ? pick(activeImage.caption).trim() : '';
  const hasMultiple = count > 1;

  return (
    <>
      <Card className="space-y-4 p-5 sm:p-6">
        {/* Header with image counter */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
            <ImageIcon className="h-5 w-5 text-accent" aria-hidden="true" />
            <span>{t('pages:projectDetail.galleryHeading')}</span>
          </h2>
          {hasMultiple && (
            <span className="rounded-lg border border-border-default bg-bg-primary px-2.5 py-1 font-mono text-xs font-medium text-text-secondary">
              {safeIndex + 1} / {count}
            </span>
          )}
        </div>

        {/* Interactive Gallery Layout:
            Desktop (md+): 2-column grid (Thumbnail Rail ~20% on start side + Main Viewer ~80% on end side)
            Mobile (<md): Main Viewer on top + Horizontal scrollable Thumbnail Rail below */}
        <div
          tabIndex={hasMultiple ? 0 : undefined}
          onKeyDown={(e) => {
            if (!hasMultiple || lightboxOpen) return;
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              if (isRtl) goPrev();
              else goNext();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              if (isRtl) goNext();
              else goPrev();
            }
          }}
          className={cn(
            'min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-xl',
            hasMultiple
              ? 'flex flex-col gap-3 md:grid md:grid-cols-[118px_minmax(0,1fr)] lg:grid-cols-[132px_minmax(0,1fr)] md:gap-4'
              : 'block'
          )}
        >
          {/* Main Image Viewer */}
          <div
            className={cn(
              'min-w-0 overflow-hidden rounded-xl border border-border-default bg-bg-primary',
              hasMultiple && 'order-1 md:order-2'
            )}
          >
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="group relative flex h-[280px] w-full items-center justify-center bg-bg-primary sm:h-[360px] md:h-[420px] lg:h-[450px]"
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={t('pages:projectDetail.openLightbox')}
                className="flex h-full w-full cursor-zoom-in items-center justify-center p-2 sm:p-3 focus-visible:outline-none"
              >
                <img
                  key={activeImage.url}
                  src={activeImage.url}
                  alt={activeAlt}
                  decoding="async"
                  className="max-h-full max-w-full rounded-lg object-contain transition-opacity duration-200"
                />
              </button>

              {/* Expand / Fullscreen Hint */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={t('pages:projectDetail.openLightbox')}
                className="absolute end-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border-default bg-bg-secondary/90 text-text-secondary backdrop-blur transition-colors hover:border-accent hover:text-accent"
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {/* Previous / Next Controls */}
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label={t('pages:projectDetail.galleryPrev')}
                    className="absolute start-2.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border-default bg-bg-secondary/90 text-text-primary shadow-sm backdrop-blur transition-colors hover:border-accent hover:text-accent"
                  >
                    <ChevronLeft
                      className="h-4 w-4 rtl:rotate-180"
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label={t('pages:projectDetail.galleryNext')}
                    className="absolute end-2.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border-default bg-bg-secondary/90 text-text-primary shadow-sm backdrop-blur transition-colors hover:border-accent hover:text-accent"
                  >
                    <ChevronRight
                      className="h-4 w-4 rtl:rotate-180"
                      aria-hidden="true"
                    />
                  </button>
                </>
              )}
            </div>

            {activeCaption && (
              <div className="border-t border-border-default bg-bg-secondary/60 px-4 py-2.5 text-xs leading-relaxed text-text-secondary sm:text-sm">
                {activeCaption}
              </div>
            )}
          </div>

          {/* Thumbnail Rail (ONLY when multiple images exist) */}
          {hasMultiple && (
            <div
              role="listbox"
              aria-label={t('pages:projectDetail.galleryHeading')}
              className="order-2 flex min-w-0 max-w-full flex-row gap-2 overflow-x-auto pb-1 md:order-1 md:h-[420px] md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pb-0 md:pe-1 lg:h-[450px]"
            >
              {images.map((item, idx) => {
                const selected = idx === safeIndex;
                const thumbAlt =
                  pick(item.alt).trim() || `${projectTitle} ${idx + 1}`;
                return (
                  <button
                    key={`${item.url}-${idx}`}
                    ref={(el) => {
                      thumbRefs.current[idx] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-label={`${t('pages:projectDetail.galleryHeading')} ${idx + 1}`}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      'relative h-[64px] w-[88px] shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-bg-primary transition-all md:h-[78px] md:w-full',
                      selected
                        ? 'border-accent ring-2 ring-accent/35 opacity-100'
                        : 'border-border-default opacity-70 hover:border-border-strong hover:opacity-100'
                    )}
                  >
                    <img
                      src={item.url}
                      alt={thumbAlt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Accessible Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeAlt}
          onClick={() => setLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-[9999] flex h-[100dvh] w-full flex-col justify-between bg-black/92 p-3 backdrop-blur-sm sm:p-6"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-3"
          >
            <span className="rounded-lg bg-white/10 px-3 py-1.5 font-mono text-xs font-medium text-white">
              {safeIndex + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label={t('common:actions.close', { defaultValue: 'Close' })}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Center Image Stage */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
            {hasMultiple && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label={t('pages:projectDetail.galleryPrev')}
                className="absolute start-1 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/25 sm:start-3"
              >
                <ChevronLeft
                  className="h-6 w-6 rtl:rotate-180"
                  aria-hidden="true"
                />
              </button>
            )}

            <img
              src={activeImage.url}
              alt={activeAlt}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80dvh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />

            {hasMultiple && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label={t('pages:projectDetail.galleryNext')}
                className="absolute end-1 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition-colors hover:bg-white/25 sm:end-3"
              >
                <ChevronRight
                  className="h-6 w-6 rtl:rotate-180"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {/* Bottom Caption (when present) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="min-h-[24px] text-center"
          >
            {activeCaption && (
              <p className="mx-auto max-w-3xl text-xs text-white/85 sm:text-sm">
                {activeCaption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
