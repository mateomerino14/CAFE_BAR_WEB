import {PermissionSectionCard} from '../molecules/PermissionSectionCard';

const styles = {
  wrapper: 'grid grid-cols-1 gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]'
};

export const PermissionsSelector = ({screens, selectedIds, onToggle, onSelectAllInScreen, onSelectNoneInScreen}) => {
  return (
    <div className={styles.wrapper}>
      {screens.map((screen) => (
        <PermissionSectionCard
          key={screen.id_pant}
          screenName={screen.nom_pant}
          subpantallas={screen.subpantallas}
          selectedIds={selectedIds}
          onToggle={onToggle}
          onSelectAll={() => onSelectAllInScreen(screen.subpantallas.map((s) => s.id_sub_pant))}
          onSelectNone={() => onSelectNoneInScreen(screen.subpantallas.map((s) => s.id_sub_pant))}
        />
      ))}
    </div>
  );
};