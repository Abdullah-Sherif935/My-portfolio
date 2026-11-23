import { useState, type FormEvent } from 'react';
import { Award, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAdminData } from '@/features/admin/context/useAdminData';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { PrototypeBanner } from '@/features/admin/components/PrototypeBanner';
import { ConfirmDeleteModal } from '@/features/admin/components/ConfirmDeleteModal';
import { LocalizedFieldGroup } from '@/features/admin/components/LocalizedFieldGroup';
import type { Certification } from '@/types/portfolio';

function createEmptyCertification(order: number): Certification {
  return {
    id: `cert-${Date.now()}`,
    title: { en: '', ar: '' },
    issuer: { en: '', ar: '' },
    issueDate: { en: '', ar: '' },
    credentialId: `CRS-NEW-0${order}`,
    credentialUrl: null,
    category: { en: '', ar: '' },
    description: { en: '', ar: '' },
    mediaUrl: null,
    dataSource: 'cms',
    isEditable: true,
    displayOrder: order,
  };
}

export function AdminCertificationsPage() {
  const { t } = useTranslation('admin');
  const { pick } = useLanguage();
  useDocumentTitle(t('certifications.pageTitle'));

  const { certifications, saveCertification, deleteCertification } = useAdminData();
  const [editing, setEditing] = useState<{ cert: Certification; isNew: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { cert } = editing;
    if (!cert.title.en.trim() || !cert.title.ar.trim()) {
      setError(t('common.validationRequired'));
      return;
    }
    saveCertification(cert);
    setEditing(null);
    setFeedback(t('prototype.savedInMemory'));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('certifications.title')}
        subtitle={t('certifications.subtitle')}
        actions={
          !editing && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditing({
                  cert: createEmptyCertification(certifications.length + 1),
                  isNew: true,
                });
                setError(null);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t('certifications.addButton')}</span>
            </Button>
          )
        }
      />

      <PrototypeBanner compact />

      {feedback && (
        <div role="status" className="rounded-xl border border-success/30 bg-success-subtle px-4 py-2.5 text-xs font-medium text-success">
          {feedback}
        </div>
      )}

      {editing ? (
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-border-default pb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {editing.isNew
                ? t('certifications.createHeading')
                : t('certifications.editHeading')}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label={t('common.close')}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-error/40 bg-error-subtle px-4 py-2.5 text-xs text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <LocalizedFieldGroup
              idPrefix="cert-title"
              label={t('certifications.fields.title')}
              required
              value={editing.cert.title}
              onChange={(title) =>
                setEditing((p) => (p ? { ...p, cert: { ...p.cert, title } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="cert-cat"
              label={t('certifications.fields.category')}
              value={editing.cert.category}
              onChange={(category) =>
                setEditing((p) => (p ? { ...p, cert: { ...p.cert, category } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="cert-issuer"
              label={t('certifications.fields.issuer')}
              value={editing.cert.issuer}
              onChange={(issuer) =>
                setEditing((p) => (p ? { ...p, cert: { ...p.cert, issuer } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="cert-date"
              label={t('certifications.fields.issueDate')}
              value={editing.cert.issueDate}
              onChange={(issueDate) =>
                setEditing((p) => (p ? { ...p, cert: { ...p.cert, issueDate } } : null))
              }
            />

            <LocalizedFieldGroup
              idPrefix="cert-desc"
              label={t('certifications.fields.description')}
              multiline
              rows={2}
              value={editing.cert.description ?? { en: '', ar: '' }}
              onChange={(description) =>
                setEditing((p) =>
                  p
                    ? {
                        ...p,
                        cert: {
                          ...p.cert,
                          description:
                            description.en.trim() || description.ar.trim()
                              ? description
                              : undefined,
                        },
                      }
                    : null
                )
              }
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="cert-id" className="block text-xs font-medium text-text-primary">
                  {t('certifications.fields.credentialId')}
                </label>
                <input
                  id="cert-id"
                  dir="ltr"
                  value={editing.cert.credentialId}
                  onChange={(e) =>
                    setEditing((p) =>
                      p ? { ...p, cert: { ...p.cert, credentialId: e.target.value } } : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 font-mono text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cert-url" className="block text-xs font-medium text-text-primary">
                  {t('certifications.fields.credentialUrl')}
                </label>
                <input
                  id="cert-url"
                  dir="ltr"
                  value={editing.cert.credentialUrl ?? ''}
                  onChange={(e) =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            cert: {
                              ...p.cert,
                              credentialUrl: e.target.value.trim() ? e.target.value : null,
                            },
                          }
                        : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="cert-media" className="block text-xs font-medium text-text-primary">
                  {t('certifications.fields.mediaUrl')}
                </label>
                <input
                  id="cert-media"
                  dir="ltr"
                  value={editing.cert.mediaUrl ?? ''}
                  onChange={(e) =>
                    setEditing((p) =>
                      p
                        ? {
                            ...p,
                            cert: {
                              ...p.cert,
                              mediaUrl: e.target.value.trim() ? e.target.value : null,
                            },
                          }
                        : null
                    )
                  }
                  className="h-10 w-full rounded-[10px] border border-border-default bg-bg-primary px-3 text-xs text-text-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border-default pt-4">
              <Button variant="secondary" size="md" onClick={() => setEditing(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" size="md">
                {editing.isNew ? t('common.create') : t('common.save')}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => (
            <Card key={cert.id} className="flex flex-col justify-between gap-4 p-5">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-subtle text-accent">
                    <Award className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <Badge variant="muted" mono>
                    {cert.credentialId}
                  </Badge>
                </div>
                <p className="font-mono text-[11px] text-accent">{pick(cert.category)}</p>
                <h3 className="text-base font-semibold text-text-primary">
                  {pick(cert.title)}
                </h3>
                <p className="text-xs text-text-secondary">{pick(cert.issuer)}</p>
                <p className="font-mono text-[11px] text-text-secondary">
                  {pick(cert.issueDate)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1.5 border-t border-border-default pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing({ cert: structuredClone(cert), isNew: false })}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t('common.edit')}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('common.delete')}
                  onClick={() => setDeleteTarget(cert)}
                  className="text-error hover:text-error"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget ? pick(deleteTarget.title) : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCertification(deleteTarget.id);
          setDeleteTarget(null);
          setFeedback(t('prototype.deletedInMemory'));
        }}
      />
    </div>
  );
}
