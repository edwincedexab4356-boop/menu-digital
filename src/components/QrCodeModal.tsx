import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Download, Printer, ExternalLink, UtensilsCrossed } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string;
  currentTable?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  restaurantName = 'Delicias Belgi',
  currentTable = 'Mesa 04',
}) => {
  const [qrUrlType, setQrUrlType] = useState<'general' | 'mesa'>('mesa');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  // Compute public target URL
  const getTargetUrl = () => {
    if (typeof window === 'undefined') return 'https://deliciasbelgi.com';
    const baseUrl = `${window.location.origin}${window.location.pathname.replace(/\/admin.*$/, '')}`;
    if (qrUrlType === 'mesa' && currentTable) {
      const param = encodeURIComponent(currentTable);
      return `${baseUrl}?mesa=${param}`;
    }
    return baseUrl;
  };

  const targetUrl = getTargetUrl();

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generando código QR:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const safeName = (restaurantName || 'menu').toLowerCase().replace(/\s+/g, '-');
    const tableSuffix = qrUrlType === 'mesa' ? `-${currentTable.toLowerCase().replace(/\s+/g, '-')}` : '';
    a.download = `qr-${safeName}${tableSuffix}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1917]/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="qr-code-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white border border-stone-300 rounded-sm p-6 text-stone-900 shadow-2xl space-y-5 print:p-0 print:border-none print:shadow-none"
      >
        {/* Close Button (hidden in print) */}
        <button
          id="close-qr-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-sm hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer print:hidden"
          aria-label="Cerrar modal QR"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-stone-200 pb-3">
          <div className="w-10 h-10 rounded-xs bg-[#a83b24] text-white flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-title text-xl font-bold text-stone-900 leading-snug">
              Código QR del Menú
            </h3>
            <p className="text-xs text-stone-500">
              Escanea con cualquier cámara de smartphone para ver la carta
            </p>
          </div>
        </div>

        {/* Tab selector for general vs table QR */}
        <div className="flex rounded-xs bg-stone-100 p-1 border border-stone-200 print:hidden">
          <button
            type="button"
            onClick={() => setQrUrlType('mesa')}
            className={`flex-1 py-1.5 px-2 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
              qrUrlType === 'mesa'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Con {currentTable || 'Mesa'}
          </button>
          <button
            type="button"
            onClick={() => setQrUrlType('general')}
            className={`flex-1 py-1.5 px-2 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
              qrUrlType === 'general'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Menú General
          </button>
        </div>

        {/* QR Code Presentation Box */}
        <div className="flex flex-col items-center justify-center p-6 bg-stone-50 border border-stone-200 rounded-sm">
          <div className="flex items-center space-x-2 mb-3">
            <UtensilsCrossed className="w-4 h-4 text-[#a83b24]" />
            <span className="font-serif-title font-bold text-sm text-stone-900">
              {restaurantName}
            </span>
            {qrUrlType === 'mesa' && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#a83b24]/10 text-[#a83b24] border border-[#a83b24]/20">
                {currentTable}
              </span>
            )}
          </div>

          <div className="bg-white p-3 rounded-sm border border-stone-200 shadow-xs flex items-center justify-center min-h-[200px] min-w-[200px]">
            {isGenerating || !qrDataUrl ? (
              <div className="flex flex-col items-center justify-center text-stone-400 p-8 space-y-2">
                <QrCode className="w-8 h-8 animate-pulse text-stone-400" />
                <span className="text-xs">Generando código...</span>
              </div>
            ) : (
              <img
                src={qrDataUrl}
                alt={`Código QR para el menú de ${restaurantName}`}
                className="w-52 h-52 object-contain"
              />
            )}
          </div>

          <p className="text-[11px] text-stone-500 mt-3 text-center max-w-xs">
            Apunta la cámara de tu teléfono al código para abrir la carta digital en segundos.
          </p>
        </div>

        {/* URL String & Copy Box */}
        <div className="space-y-1.5 print:hidden">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
            Enlace directo
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="flex-1 bg-stone-50 border border-stone-300 rounded-xs px-2.5 py-1.5 text-xs text-stone-700 font-mono select-all focus:outline-none"
            />
            <button
              id="copy-qr-url-btn"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xs bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200 print:hidden">
          <button
            id="download-qr-btn"
            onClick={handleDownloadQr}
            disabled={!qrDataUrl || isGenerating}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xs border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Descargar PNG</span>
          </button>
          <button
            id="print-qr-btn"
            onClick={handlePrint}
            disabled={!qrDataUrl || isGenerating}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xs bg-[#a83b24] hover:bg-[#91321d] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>Imprimir QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
