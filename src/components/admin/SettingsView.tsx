import React from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Database, 
  HardDrive, 
  UserCheck, 
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SettingsViewProps {
  userEmail?: string | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userEmail }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-5 h-5 text-[#a83b24]" />
          <h2 className="font-serif-title text-2xl font-bold text-stone-900">
            Configuración del Sistema
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          Detalles de tu cuenta administrativa, colecciones de Cloud Firestore y estado de almacenamiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card: Cuenta de Administrador */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title text-base font-bold text-stone-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Sesión Administrativa</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verificado
            </span>
          </div>

          <div className="text-xs space-y-2 text-stone-600">
            <p>
              <span className="font-semibold text-stone-800">Email conectado:</span> {userEmail || 'Administrador'}
            </p>
            <p>
              <span className="font-semibold text-stone-800">Colección de acceso:</span> admin/{'{uid}'}
            </p>
            <p>
              <span className="font-semibold text-stone-800">Rol asignado:</span> rol: "admin"
            </p>
          </div>
        </div>

        {/* Card: Base de Datos Firestore */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title text-base font-bold text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#a83b24]" />
              <span>Colecciones Activas</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              Firestore
            </span>
          </div>

          <div className="text-xs space-y-2 text-stone-600">
            <p>
              <span className="font-semibold text-stone-800">Platillos:</span> Colección <code className="bg-stone-100 px-1 py-0.5 rounded text-[#a83b24]">productos</code>
            </p>
            <p>
              <span className="font-semibold text-stone-800">Secciones:</span> Colección <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-700">categorias</code>
            </p>
            <p>
              <span className="font-semibold text-stone-800">Credenciales Admin:</span> Documentos en <code className="bg-stone-100 px-1 py-0.5 rounded">admin</code>
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Storage Readiness Section */}
      <div className="bg-white p-6 rounded-sm border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif-title text-lg font-bold text-stone-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-stone-600" />
              <span>Estado de Firebase Storage & Fotos</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Cómo maneja tu aplicación las fotografías actualmente sin requerir plan Blaze
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
            Plan Spark (Gratuito) Respetado
          </span>
        </div>

        <div className="p-4 bg-stone-50 rounded-xs border border-stone-200 text-xs space-y-2.5 text-stone-700 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-stone-900">Subida local activa:</strong> Puedes seleccionar fotos desde tu computadora o teléfono. El sistema las optimiza y comprime en alta resolución en el navegador para que se vean nítidas en el menú público sin necesidad de activar planes de pago.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-stone-900">URLs directas activas:</strong> También puedes pegar cualquier enlace de imagen web (Unsplash, Cloudinary, etc.) si prefieres alojarlas externamente.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#a83b24] shrink-0 mt-0.5" />
            <p>
              <strong className="text-stone-900">¿Qué falta para conectar Firebase Storage?</strong> En el momento que decidas activar Firebase Storage en tu consola de Firebase (requiere vincular facturación de Google Cloud para el bucket), el código ya tiene los métodos <code className="font-mono text-xs">ref</code> y <code className="font-mono text-xs">uploadBytesResumable</code> listos. Simplemente comenzará a guardar en la carpeta <code className="font-mono text-xs">productos/</code> de tu bucket automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
