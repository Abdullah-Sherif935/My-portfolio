import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Language } from '@/types/portfolio';
import { cn } from '@/utils/cn';

export interface CvFlowBlock {
  id: string;
  kind: 'header' | 'heading' | 'entry';
  /** Top margin in px applied when not the first block on a page */
  marginTopPx?: number;
  node: ReactNode;
}

interface CvA4PaginatedPreviewProps {
  blocks: CvFlowBlock[];
  cvLanguage: Language;
  /** Used to trigger re-measurement whenever role, template, language, or customizations change */
  layoutKey: string;
  onPageCountChange?: (count: number) => void;
}

/**
 * Renders a CV as real, discrete A4 paper sheets (210mm × 297mm) in the live preview,
 * measuring each block's exact rendered height at printable A4 width (184mm) so that
 * live preview pagination matches the exported A4 PDF 1-to-1.
 */
export function CvA4PaginatedPreview({
  blocks,
  cvLanguage,
  layoutKey,
  onPageCountChange,
}: CvA4PaginatedPreviewProps) {
  const isRtl = cvLanguage === 'ar';
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const pageHeightProbeRef = useRef<HTMLDivElement>(null);
  const pageWidthProbeRef = useRef<HTMLDivElement>(null);

  const [pages, setPages] = useState<CvFlowBlock[][]>(() => [blocks]);
  const [scale, setScale] = useState<number>(1);
  const [sheetSizePx, setSheetSizePx] = useState<{ w: number; h: number }>({
    w: 794,
    h: 1123,
  });

  // Track responsive scale so 210mm A4 sheet fits smoothly inside any viewport width
  useEffect(() => {
    const updateScale = () => {
      const container = viewportRef.current;
      const wProbe = pageWidthProbeRef.current;
      if (!container) return;
      const a4WidthPx = wProbe?.offsetWidth || 793.7;
      const a4HeightPx = Math.round(a4WidthPx * (297 / 210));
      setSheetSizePx({ w: a4WidthPx, h: a4HeightPx });

      const availableWidth = container.clientWidth;
      if (availableWidth > 0) {
        setScale(Math.min(1, availableWidth / a4WidthPx));
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (viewportRef.current) {
      ro.observe(viewportRef.current);
    }
    return () => ro.disconnect();
  }, []);

  // Measure real block heights & compute exact A4 page buckets
  useLayoutEffect(() => {
    let cancelled = false;

    const paginate = () => {
      if (cancelled) return;
      const container = measureContainerRef.current;
      const heightProbe = pageHeightProbeRef.current;
      if (!container || !heightProbe) return;

      // Exact printable content height per A4 page (297mm - 12mm top - 15mm bottom - 5mm footer buffer = 265mm)
      const maxPageContentPx = heightProbe.offsetHeight || 1000;
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length !== blocks.length) return;

      const heights = children.map((el) => el.getBoundingClientRect().height);

      const nextPages: CvFlowBlock[][] = [];
      let currentPage: CvFlowBlock[] = [];
      let currentHeight = 0;

      const pushNewPage = () => {
        if (currentPage.length > 0) {
          nextPages.push(currentPage);
          currentPage = [];
          currentHeight = 0;
        }
      };

      for (let i = 0; i < blocks.length; i += 1) {
        const block = blocks[i]!;
        const h = heights[i] ?? 0;
        const gap = currentPage.length === 0 ? 0 : (block.marginTopPx ?? 8);

        // Prevent orphaned section headings: keep heading attached to its first entry block
        if (block.kind === 'heading' && i + 1 < blocks.length) {
          const nextBlock = blocks[i + 1]!;
          const nextH = heights[i + 1] ?? 0;
          const nextGap = nextBlock.marginTopPx ?? 6;
          if (
            currentPage.length > 0 &&
            currentHeight + gap + h + nextGap + nextH > maxPageContentPx
          ) {
            pushNewPage();
          }
        } else if (
          currentPage.length > 0 &&
          currentHeight + gap + h > maxPageContentPx
        ) {
          pushNewPage();
        }

        const appliedGap =
          currentPage.length === 0 ? 0 : (block.marginTopPx ?? 8);
        currentPage.push(block);
        currentHeight += appliedGap + h;
      }

      if (currentPage.length > 0) {
        nextPages.push(currentPage);
      }

      const finalPages = nextPages.length > 0 ? nextPages : [blocks];
      setPages(finalPages);
      onPageCountChange?.(finalPages.length);
    };

    paginate();

    // Re-run once web fonts finish loading so Arabic/English metrics are 100% exact
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        window.requestAnimationFrame(paginate);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [blocks, layoutKey, onPageCountChange]);

  const fontStyle = {
    fontFamily: isRtl ? 'var(--font-sans-ar)' : 'var(--font-sans-en)',
  };

  return (
    <div ref={viewportRef} className="cv-a4-viewport relative w-full">
      {/* Off-screen physical unit probes & exact-width block measurer (hidden on screen & print) */}
      <div
        aria-hidden="true"
        className="no-print pointer-events-none fixed top-0 left-[-99999px] opacity-0"
      >
        <div ref={pageWidthProbeRef} style={{ width: '210mm' }} />
        <div ref={pageHeightProbeRef} style={{ height: '265mm' }} />
        <div
          ref={measureContainerRef}
          dir={isRtl ? 'rtl' : 'ltr'}
          lang={cvLanguage}
          style={{ ...fontStyle, width: '184mm' }}
          className="text-slate-900"
        >
          {blocks.map((block) => (
            <div key={block.id}>{block.node}</div>
          ))}
        </div>
      </div>

      {/* Rendered Discrete A4 Pages (WYSIWYG on Screen & 1-to-1 on Print/PDF) */}
      <div className="cv-a4-stack flex flex-col items-center gap-9 pt-5 print:block print:gap-0 print:pt-0">
        {pages.map((pageBlocks, pageIndex) => {
          const isLastPage = pageIndex === pages.length - 1;
          const pageNumber = pageIndex + 1;
          const totalPages = pages.length;

          return (
            <div
              key={pageIndex}
              dir="ltr"
              className="cv-a4-page-slot relative print:m-0"
              style={{
                width: `${Math.round(sheetSizePx.w * scale)}px`,
                height: `${Math.round(sheetSizePx.h * scale)}px`,
              }}
            >
              {/* Screen-only subtle page label above each sheet */}
              <div
                aria-hidden="true"
                className="no-print pointer-events-none absolute -top-5 left-0 font-mono text-[10px] uppercase tracking-wider text-text-secondary/80"
              >
                {cvLanguage === 'ar'
                  ? `صفحة ${pageNumber} من ${totalPages} · A4`
                  : `Page ${pageNumber} of ${totalPages} · A4`}
              </div>

              <div
                dir={isRtl ? 'rtl' : 'ltr'}
                lang={cvLanguage}
                style={{
                  ...fontStyle,
                  width: '210mm',
                  height: '297mm',
                  padding: '12mm 13mm 15mm 13mm',
                  transform: scale < 1 ? `scale(${scale})` : undefined,
                  transformOrigin: 'top left',
                }}
                className={cn(
                  'cv-a4-page relative box-border flex flex-col overflow-hidden rounded-[4px] border border-slate-300/80 bg-white text-slate-900 shadow-xl print:transform-none print:rounded-none print:border-0 print:shadow-none',
                  !isLastPage && 'cv-a4-page-break'
                )}
              >
                {/* Page Content */}
                <div className="flex-1">
                  {pageBlocks.map((block, idx) => (
                    <div
                      key={block.id}
                      style={{
                        marginTop:
                          idx === 0 ? 0 : `${block.marginTopPx ?? 8}px`,
                      }}
                    >
                      {block.node}
                    </div>
                  ))}
                </div>

                {/* Page Number Footer (Visible on both Live Preview & Printed PDF when > 1 page) */}
                {totalPages > 1 && (
                  <div
                    dir="ltr"
                    className="pointer-events-none absolute right-[13mm] bottom-[6mm] font-sans text-[8pt] text-slate-500"
                  >
                    {pageNumber} / {totalPages}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
