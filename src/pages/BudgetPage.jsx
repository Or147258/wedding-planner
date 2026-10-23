import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';
import { DownloadIcon, PlusIcon } from '../components/common/Icons';
import VendorForm from '../components/budget/VendorForm';
import VendorTable from '../components/budget/VendorTable';
import { exportSheets } from '../utils/exportExcel';
import { formatCurrency, formatDate, percent, sumBy } from '../utils/helpers';

const HEADER = [
  'סוג שירות',
  'שם הספק / שירות',
  'עלות כוללת',
  'מקדמה ששולמה',
  'יתרה לתשלום',
  'תאריך יעד לתשלום היתרה',
];

export default function BudgetPage({ vendors, onAdd, onUpdate, onDelete }) {
  const [modal, setModal] = useState({ open: false, vendor: null });

  const total = sumBy(vendors, (v) => v.total);
  const paid = sumBy(vendors, (v) => v.paid);
  const balance = total - paid;

  const closeModal = () => setModal({ open: false, vendor: null });

  const handleSubmit = (values) => {
    if (modal.vendor) onUpdate(modal.vendor.id, values);
    else onAdd(values);
    closeModal();
  };

  const handleDelete = (vendor) => {
    if (window.confirm(`למחוק את "${vendor.name}" מהתקציב?`)) onDelete(vendor.id);
  };

  const handleExport = () => {
    const rows = vendors.map((v) => ({
      'סוג שירות': v.type || '',
      'שם הספק / שירות': v.name,
      'עלות כוללת': v.total,
      'מקדמה ששולמה': v.paid,
      'יתרה לתשלום': v.total - v.paid,
      'תאריך יעד לתשלום היתרה': formatDate(v.balanceDueDate),
    }));
    rows.push({
      'סוג שירות': '',
      'שם הספק / שירות': 'סה״כ',
      'עלות כוללת': total,
      'מקדמה ששולמה': paid,
      'יתרה לתשלום': balance,
      'תאריך יעד לתשלום היתרה': '',
    });
    exportSheets('תקציב_וספקים.xlsx', [
      { name: 'תקציב וספקים', rows, header: HEADER, widths: [16, 30, 16, 16, 16, 24] },
    ]);
  };

  return (
    <>
      <PageHeader title="תקציב, ספקים והוצאות" subtitle="מעקב אחרי עלויות, מקדמות ויתרות לתשלום">
        <button type="button" className="btn-export" onClick={handleExport} disabled={!vendors.length}>
          <DownloadIcon />
          ייצוא לאקסל
        </button>
        <button type="button" className="btn-primary" onClick={() => setModal({ open: true, vendor: null })}>
          <PlusIcon />
          הוספת ספק
        </button>
      </PageHeader>

      <section className="mb-8 space-y-4" aria-label="סיכום תקציב">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="סך כל ההוצאות" value={formatCurrency(total)} hint={`${vendors.length} ספקים`} />
          <StatCard
            label="סך המקדמות ששולמו"
            value={formatCurrency(paid)}
            tone="emerald"
            hint={`${percent(paid, total)}% מהעלות`}
          />
          <StatCard
            label="יתרה לתשלום"
            value={formatCurrency(balance)}
            tone={balance > 0 ? 'amber' : 'emerald'}
            hint={balance > 0 ? 'נותר לשלם' : 'הכול שולם'}
          />
        </div>
        {total > 0 && (
          <div className="card p-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">התקדמות תשלומים</span>
              <span className="tabular-nums text-stone-500">{percent(paid, total)}%</span>
            </div>
            <ProgressBar value={percent(paid, total)} color="bg-emerald-500" label="התקדמות תשלומים" />
          </div>
        )}
      </section>

      {vendors.length === 0 ? (
        <EmptyState
          title="עדיין לא נוספו ספקים"
          text="הוסיפו את האולם, הצלם, הדי־ג'יי ושאר הספקים כדי לעקוב אחרי העלויות והתשלומים."
        >
          <button type="button" className="btn-primary" onClick={() => setModal({ open: true, vendor: null })}>
            <PlusIcon />
            הוספת ספק
          </button>
        </EmptyState>
      ) : (
        <VendorTable
          vendors={vendors}
          onEdit={(vendor) => setModal({ open: true, vendor })}
          onDelete={handleDelete}
        />
      )}

      <Modal
        open={modal.open}
        title={modal.vendor ? 'עריכת ספק' : 'הוספת ספק'}
        onClose={closeModal}
      >
        <VendorForm initial={modal.vendor} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </>
  );
}
