import { useState } from 'react';
import { ZoomIn, ZoomOut, Check, AlertTriangle, FileText, XCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const aiExtractedFields = [
  { id: 'numero_factura', label: 'Número de factura', value: 'FV-2024-001', confidence: 98 },
  { id: 'nombre_proveedor', label: 'Nombre del emisor', value: 'Empresa X', confidence: 95 },
  { id: 'nit_proveedor', label: 'NIT / RUT', value: '900.123.456-7', confidence: 99 },
  { id: 'fecha_emision', label: 'Fecha de emisión', value: '2024-01-15', confidence: 96 },
  { id: 'fecha_vencimiento', label: 'Fecha de vencimiento', value: '2024-02-15', confidence: 85 },
  { id: 'valor_base', label: 'Subtotal', value: '1260504', confidence: 92 },
  { id: 'iva', label: 'IVA (19%)', value: '239496', confidence: 88 },
  { id: 'valor_total', label: 'Total', value: '1500000', confidence: 99 },
];

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 90) {
    return <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><Check size={12} /> {score}%</span>;
  }
  if (score >= 60) {
    return <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full"><AlertTriangle size={12} /> {score}%</span>;
  }
  return <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><XCircle size={12} /> {score}%</span>;
}

export default function VistaPrevia() {
  const navigate = useNavigate();
  const [fields, setFields] = useState(aiExtractedFields);

  const handleChange = (id: string, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, value } : f));
  };

  const handleConfirm = () => {
    navigate('/gestion');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-heading">Vista Previa e Interpretación IA</h1>
        <p className="text-gray-500 text-sm mt-1">Revise la información extraída y corrija si es necesario antes de radicar.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-[600px]">
        {/* Document Viewer (Left) */}
        <div className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={18} className="text-gray-400" />
              factura_empresa_x.pdf
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><ZoomOut size={18} /></button>
              <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"><ZoomIn size={18} /></button>
            </div>
          </div>
          <div className="flex-1 bg-gray-200 flex justify-center p-4 overflow-auto">
            {/* Mock PDF Document */}
            <div className="bg-white shadow-md w-full max-w-lg aspect-[1/1.414] p-8 flex flex-col text-xs text-gray-800 font-mono select-none">
              <div className="flex justify-between border-b pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold">EMPRESA X S.A.S.</h2>
                  <p>NIT: 900.123.456-7</p>
                  <p>Calle Falsa 123, Bogotá</p>
                </div>
                <div className="text-right">
                  <h1 className="text-xl font-bold text-gray-400 uppercase tracking-wider">Factura</h1>
                  <p className="font-bold mt-1">FV-2024-001</p>
                </div>
              </div>
              <div className="mb-6 flex justify-between">
                <div>
                  <p><strong>Cliente:</strong> Cementos Tequendama</p>
                  <p><strong>Fecha Emisión:</strong> 15 Ene 2024</p>
                </div>
                <div className="text-right">
                  <p><strong>Vencimiento:</strong> 15 Feb 2024</p>
                </div>
              </div>
              <div className="border-t border-b py-2 mb-4 font-bold flex justify-between">
                <span>Descripción</span>
                <span>Valor</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Servicios de Consultoría Tech</span>
                <span>$ 1.260.504</span>
              </div>
              <div className="mt-auto border-t pt-4 ml-auto w-1/2">
                <div className="flex justify-between mb-1">
                  <span>Subtotal</span>
                  <span>$ 1.260.504</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>IVA (19%)</span>
                  <span>$ 239.496</span>
                </div>
                <div className="flex justify-between font-bold text-sm mt-2 border-t pt-2">
                  <span>Total a Pagar</span>
                  <span>$ 1.500.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Data (Right) */}
        <div className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              Datos Extraídos por IA
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-gray-500">Confianza Global:</span>
                <span className="font-bold text-green-600">94%</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md border border-yellow-200">
                <AlertTriangle size={14} />
                <span>2 por revisar</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-sm font-medium text-gray-700 col-span-1">
                    {field.label}
                  </label>
                  <div className="col-span-2 relative">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className={`block w-full pr-16 py-2 px-3 border rounded-lg text-sm bg-white focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        field.confidence < 90 ? 'border-yellow-400 bg-yellow-50/30 focus:border-yellow-500 focus:ring-yellow-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                      <ConfidenceBadge score={field.confidence} />
                    </div>
                  </div>
                </div>
              ))}
            </form>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50/50">
            <button 
              type="button"
              onClick={() => navigate('/radicacion')} 
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:text-gray-900 transition-colors text-sm font-bold bg-gray-50"
            >
              <RotateCcw size={16} />
              Volver a cargar
            </button>
            <button 
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 border border-transparent text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-bold shadow-sm"
            >
              <Check size={18} />
              Confirmar y Radicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
