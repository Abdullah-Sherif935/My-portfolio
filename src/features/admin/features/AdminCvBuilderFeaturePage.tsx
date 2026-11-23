import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { PageEditorShell } from '@/features/admin/components/PageEditorShell';
import { SectionMappingBadge } from '@/features/admin/components/SectionMappingBadge';
import { AdminCvPage } from '@/features/admin/cv/AdminCvPage';
import type { CvSectionConfig, CvTemplateId } from '@/types/admin';
import { cn } from '@/utils/cn';

type CvAdminTab = 'public-defaults' | 'owner-workspace';

export function AdminCvBuilderFeaturePage() {
  const { t } = useTranslation('admin');
  useDocumentTitle(`${t('nav.featureCvBuilder')} — ${t('brand.console')}`);

  const { siteSettings, updateSiteSettings, isSaving } = useAdminData();
  const [activeTab, setActiveTab] = useState<CvAdminTab>('public-defaults');
  const [defaultTemplate, setDefaultTemplate] = useState<CvTemplateId>(
    siteSettings.defaultCvTemplate
  );
  const [sectionOrder, setSectionOrder] = useState<CvSectionConfig[]>(() =>
    structuredClone(siteSettings.cvSectionOrder)
  );
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  useEffect(() => {
    setDefaultTemplate(siteSettings.defaultCvTemplate);
    setSectionOrder(structuredClone(siteSettings.cvSectionOrder));
  }, [siteSettings]);

  const isDirty = useMemo(() => {
    return (
      defaultTemplate !== siteSettings.defaultCvTemplate ||
      JSON.stringify(sectionOrder) !== JSON.stringify(siteSettings.cvSectionOrder)
    );
  }, [defaultTemplate, sectionOrder, siteSettings]);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sectionOrder.length) return;
    const next = [...sectionOrder];
    const currentItem = next[index];
    const targetItem = next[target];
    if (!currentItem || !targetItem) return;
    next[index] = targetItem;
    next[target] = currentItem;
    setSectionOrder(next);
  };

  const handleSavePublicDefaults = async (e: FormEvent) => {
    e.preventDefault();
    await updateSiteSettings({
      ...siteSettings,
      defaultCvTemplate: defaultTemplate,
      cvSectionOrder: sectionOrder,
    });
    setLastSaved(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    setPreviewRefreshKey((k) => k + 1);
  };

  return (
    <PageEditorShell
      title={t('cvMgr.title')}
      subtitle={t('cvMgr.subtitle')}
      publicRoute="/career/cv-builder"
      mappingPath={t('cvMgr.mappingPath')}
      hasUnsavedChanges={isDirty}
      lastSavedLabel={lastSaved}
      previewRefreshKey={previewRefreshKey}
    >
      {/* Internal Sub-Tabs */}
      <div role="tablist" className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ['public-defaults', t('cvMgr.tabs.publicDefaults')],
            ['owner-workspace', t('cvMgr.tabs.ownerWorkspace')],
          ] as const
        ).map(([tabId, label]) => (
          <button
            key={tabId}
            type="button"
            role="tab"
            aria-selected={activeTab === tabId}
            onClick={() => setActiveTab(tabId)}
            className={cn(
              'rounded-[10px] border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm cursor-pointer',
              activeTab === tabId
                ? 'border-accent bg-accent text-accent-foreground'
                : 'border-border-default bg-bg-secondary text-text-secondary hover:text-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sub-Tab 1: Public Smart CV Defaults */}
      {activeTab === 'public-defaults' && (
        <form onSubmit={(e) => void handleSavePublicDefaults(e)} className="space-y-6">
          <Card className="space-y-5 p-5 sm:p-6">
            <SectionMappingBadge location={t('cvMgr.mapPublicDefaults')} />

            <div className="space-y-1.5">
              <label
                htmlFor="cv-mgr-template"
                className="block text-xs font-medium text-text-primary"
              >
                {t('settings.defaultCvTemplate')}
              </label>
              <select
                id="cv-mgr-template"
                value={defaultTemplate}
                onChange={(e) => setDefaultTemplate(e.target.value as CvTemplateId)}
                className="h-10 w-full max-w-md rounded-[10px] border border-border-default bg-bg-primary px-3 text-sm text-text-primary"
              >
                <option value="ats">{t('settings.templateAts')}</option>
                <option value="modern">{t('settings.templateModern')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-text-primary">
                {t('settings.cvSectionOrderLabel')}
              </p>
              <div className="space-y-2">
                {sectionOrder.map((sec, idx) => (
                  <div
                    key={sec.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-primary px-3.5 py-2.5"
                  >
                    <label className="inline-flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sec.visible}
                        onChange={(e) =>
                          setSectionOrder((prev) =>
                            prev.map((item) =>
                              item.key === sec.key
                                ? { ...item, visible: e.target.checked }
                                : item
                            )
                          )
                        }
                        className="h-4 w-4 rounded accent-accent"
                      />
                      <span>{t(`cv.sections.${sec.key}`)}</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, 'up')}
                        aria-label={t('common.moveUp')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sectionOrder.length - 1}
                        onClick={() => moveSection(idx, 'down')}
                        aria-label={t('common.moveDown')}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border-default text-text-secondary hover:border-accent hover:text-accent disabled:opacity-35 cursor-pointer"
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={!isDirty}
              onClick={() => {
                setDefaultTemplate(siteSettings.defaultCvTemplate);
                setSectionOrder(structuredClone(siteSettings.cvSectionOrder));
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSaving || !isDirty}>
              {isSaving ? t('prototype.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      )}

      {/* Sub-Tab 2: Existing Private Owner CV Curation Workspace */}
      {activeTab === 'owner-workspace' && (
        <div className="space-y-4">
          <SectionMappingBadge location={t('cvMgr.mapOwnerWorkspace')} />
          <AdminCvPage />
        </div>
      )}
    </PageEditorShell>
  );
}
