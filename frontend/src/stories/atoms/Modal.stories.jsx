import {Modal} from '../../components/atoms/Modal';
import {Button} from '../../components/atoms/Button';

export default {
  title: 'Atoms/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'lg', 'xl'] },
    onClose: { action: 'closed' }
  }
};

export const Small = {
  args: {
    size: 'sm',
    children: (
      <>
        <h2 className="text-lg font-bold text-slate-800">Confirmar acción</h2>
        <p className="mt-2 text-sm text-slate-500">¿Está seguro de que desea continuar?</p>
        <div className="mt-4 flex flex-col gap-2">
          <Button>CONFIRMAR</Button>
          <Button variant="danger">CANCELAR</Button>
        </div>
      </>
    )
  }
};

export const Large = {
  args: {
    size: 'lg',
    children: (
      <>
        <h2 className="text-lg font-bold text-slate-800">Elegir sección</h2>
        <p className="mt-2 text-sm text-slate-500">Contenido de ejemplo dentro de un modal grande.</p>
      </>
    )
  }
};

export const ExtraLarge = {
  args: {
    size: 'xl',
    children: (
      <>
        <h2 className="text-lg font-bold text-slate-800">Personalizar promoción</h2>
        <p className="mt-2 text-sm text-slate-500">Contenido de ejemplo dentro de un modal extra grande.</p>
      </>
    )
  }
};