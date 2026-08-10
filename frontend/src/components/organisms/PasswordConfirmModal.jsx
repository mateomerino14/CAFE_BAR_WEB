import {useState} from 'react';
import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {Toast} from '../atoms/Toast';
import {PasswordField} from '../molecules/PasswordField';
import {FormField} from '../molecules/FormField';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  message: 'mt-2 text-sm text-slate-500',
  form: 'mt-4 flex flex-col gap-4',
  actions: 'mt-4 flex flex-col gap-2'
};

export const PasswordConfirmModal = ({onClose, onConfirm, error}) => {
  const [password, setPassword] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(password);
  };
  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Autorización requerida</h2>
      <p className={styles.message}>Se ha excedido el límite de 2 impresiones. Ingrese su contraseña para continuar.</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormField label="CONTRASEÑA">
          <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Su contraseña" />
        </FormField>
        <div className={styles.actions}>
          <Button type="submit">CONFIRMAR</Button>
          <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
        </div>
      </form>
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};