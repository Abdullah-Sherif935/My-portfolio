import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  itemName,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation('admin');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t('common.confirmDeleteTitle')}
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-text-secondary">
          {t('common.confirmDeleteBody', { name: itemName })}
        </p>
        <div className="flex flex-wrap justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className="bg-error text-white hover:bg-error/90"
          >
            {t('common.confirmDeleteAction')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
