import { useState } from 'react';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';

const styles = {
  wrapper: 'mt-3 flex flex-wrap items-end gap-2 rounded-xl bg-white p-4 shadow-sm',
  field: 'flex-1 min-w-[200px]'
};

export const ReportActions = ({ onPrint, onSendEmail, sendingEmail }) => {
  const [correo, setCorreo] = useState('');

  const handleSend = async () => {
    const ok = await onSendEmail(correo);
    if (ok) setCorreo('');
  };

  return (
    <div className={styles.wrapper}>
      <Button type="button" onClick={onPrint}>IMPRIMIR / GUARDAR PDF</Button>
      <div className={styles.field}>
        <TextInput type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} placeholder="Correo de destino" />
      </div>
      <Button type="button" variant="warning" onClick={handleSend} disabled={sendingEmail}>
        {sendingEmail ? 'ENVIANDO...' : 'ENVIAR POR CORREO'}
      </Button>
    </div>
  );
};