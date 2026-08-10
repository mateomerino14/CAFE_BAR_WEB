import { buildKitchenText } from '../../features/pos/utils/ticketFormat';

const styles = {
  wrapper: 'printable-ticket mx-auto max-w-xs bg-white p-4',
  pre: 'whitespace-pre font-mono text-[11px] leading-tight text-black'
};

export const PrintableKitchenOrder = ({ticket}) => {
  if (!ticket) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
      <pre className={styles.pre}>{buildKitchenText(ticket)}</pre>
    </div>
  );
};