import React from 'react';
import { X, Check, MapPin } from 'lucide-react';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string;
  onSelectTable: (table: string) => void;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTable,
  onSelectTable,
}) => {
  if (!isOpen) return null;

  const tables = [
    { id: 'Mesa 01', zone: 'Salón Principal' },
    { id: 'Mesa 02', zone: 'Salón Principal' },
    { id: 'Mesa 03', zone: 'Salón Principal' },
    { id: 'Mesa 04', zone: 'Salón Principal' },
    { id: 'Mesa 05', zone: 'Salón Principal' },
    { id: 'Mesa 10', zone: 'Terraza Jardín' },
    { id: 'Mesa 12', zone: 'Terraza Jardín' },
    { id: 'Mesa 14', zone: 'Terraza Vista' },
    { id: 'Barra 01', zone: 'Barra de Coctelería' },
    { id: 'Barra 02', zone: 'Barra de Coctelería' },
    { id: 'Para Llevar', zone: 'Take Away / Recogida' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1917]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white border border-stone-300 rounded-sm p-6 text-stone-900 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#a83b24]" />
            <h3 className="font-serif-title text-xl font-bold text-stone-900">
              Seleccionar Mesa o Ubicación
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600">
          Indique su mesa para que el personal de servicio y cocina dirijan sus pedidos de forma exacta.
        </p>

        <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {tables.map((t) => {
            const isSelected = currentTable === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTable(t.id);
                  onClose();
                }}
                className={`p-3 rounded-xs text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#a83b24]/10 border-[#a83b24] text-stone-900 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-stone-900">{t.id}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#a83b24] stroke-[3]" />}
                </div>
                <span className="text-[11px] text-stone-500 mt-1">{t.zone}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
