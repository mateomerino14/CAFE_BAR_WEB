import { useState } from 'react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Pagination } from '../molecules/Pagination';
import { usePagination } from '../../hooks/usePagination';

const SECTIONS_PAGE_SIZE = 9;
const TABLES_PAGE_SIZE = 15;

const styles = {
  title: 'text-lg font-bold text-slate-800',
  sectionsGrid: 'mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3',
  sectionButton: 'flex min-h-[64px] items-center justify-center rounded-lg px-3 py-3 text-center text-sm font-bold leading-tight text-white transition-transform hover:scale-105',
  tablesGrid: 'mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5',
  tableCell: 'flex flex-col gap-1',
  tableButton: 'flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-xs font-bold transition-colors',
  available: 'border-emerald-400 bg-emerald-50 text-emerald-700 hover:border-emerald-500',
  occupied: 'border-red-400 bg-red-50 text-red-700 hover:border-red-500',
  checkoutButton: 'rounded-lg bg-emerald-500 py-1 text-xs font-bold text-white hover:bg-emerald-600',
  pagination: 'mt-4',
  back: 'mt-4'
};

const SECTION_COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#d35400'];

export const TablePickerModal = ({ sections, onClose, onSelect, onCheckout }) => {
  const [activeSection, setActiveSection] = useState(null);

  const sectionsPagination = usePagination(sections, SECTIONS_PAGE_SIZE);
  const tablesPagination = usePagination(activeSection?.mesas || [], TABLES_PAGE_SIZE);

  if (!activeSection) {
    return (
      <Modal onClose={onClose} size="lg">
        <h2 className={styles.title}>Elegir sección</h2>
        <div className={styles.sectionsGrid}>
          {sectionsPagination.visible.map((section) => {
            const colorIndex = sections.indexOf(section) % SECTION_COLORS.length;
            return (
              <button
                key={section.id_seccion}
                type="button"
                className={styles.sectionButton}
                style={{ backgroundColor: SECTION_COLORS[colorIndex] }}
                onClick={() => setActiveSection(section)}
              >
                {section.nomb_seccion.toUpperCase()}
              </button>
            );
          })}
        </div>
        <div className={styles.pagination}>
          <Pagination
            currentPage={sectionsPagination.currentPage}
            totalPages={sectionsPagination.totalPages}
            canGoLeft={sectionsPagination.canGoLeft}
            canGoRight={sectionsPagination.canGoRight}
            onPrev={sectionsPagination.goLeft}
            onNext={sectionsPagination.goRight}
          />
        </div>
        <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CANCELAR</Button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} size="lg">
      <h2 className={styles.title}>{activeSection.nomb_seccion}</h2>
      <div className={styles.tablesGrid}>
        {tablesPagination.visible.map((mesa) => (
          <div key={mesa.id_mesa} className={styles.tableCell}>
            <button
              type="button"
              className={`${styles.tableButton} ${mesa.disponible ? styles.available : styles.occupied}`}
              onClick={() => onSelect(activeSection, mesa)}
            >
              <span>Mesa {mesa.id_mesa}</span>
              <span>{mesa.disponible ? 'Libre' : 'Ocupada'}</span>
            </button>
            {!mesa.disponible && (
              <button type="button" className={styles.checkoutButton} onClick={() => onCheckout(activeSection, mesa)}>
                COBRAR
              </button>
            )}
          </div>
        ))}
        {activeSection.mesas.length === 0 && <p className="text-sm text-slate-400">No hay mesas en esta sección</p>}
      </div>
      <div className={styles.pagination}>
        <Pagination
          currentPage={tablesPagination.currentPage}
          totalPages={tablesPagination.totalPages}
          canGoLeft={tablesPagination.canGoLeft}
          canGoRight={tablesPagination.canGoRight}
          onPrev={tablesPagination.goLeft}
          onNext={tablesPagination.goRight}
        />
      </div>
      <Button type="button" variant="danger" className={styles.back} onClick={() => setActiveSection(null)}>VOLVER A SECCIONES</Button>
    </Modal>
  );
};