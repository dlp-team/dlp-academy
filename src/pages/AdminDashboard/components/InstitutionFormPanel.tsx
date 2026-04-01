// src/pages/AdminDashboard/components/InstitutionFormPanel.tsx
import React from 'react';
import { CheckCircle2, Loader2, Pencil, Plus, XCircle } from 'lucide-react';

type InstitutionFormPanelProps = {
    editingInstitutionId: any;
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    submitting: boolean;
    error: string;
    success: string;
    onSubmit: (event: any) => void;
    onClose: () => void;
};

const InstitutionFormPanel = ({
    editingInstitutionId,
    form,
    setForm,
    submitting,
    error,
    success,
    onSubmit,
    onClose,
}: InstitutionFormPanelProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingInstitutionId ? 'Editar Institución' : 'Nueva Institución'}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
                    <input type="text" placeholder="Ej: IES Ramón y Cajal" value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" required />
                </div>
                {/* ID Institucional field removed, Firestore document ID will be used */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dominio de la institución *</label>
                    <input type="text" placeholder="ej: universidad.edu" value={form.domain}
                        onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" required />
                    <p className="text-xs text-gray-500 mt-2">Se utilizará para validación de emails institucionales y agrupación por tenant.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Administradores institucionales *</label>
                    <input type="text" placeholder="admin1@dominio.com, admin2@dominio.com" value={form.institutionAdministrators}
                        onChange={e => setForm(p => ({ ...p, institutionAdministrators: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" required />
                    <p className="text-xs text-gray-500 mt-2">Lista separada por comas.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de institución *</label>
                    <select value={form.type}
                        onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" required>
                        <option value="school">Escuela</option>
                        <option value="academy">Academia</option>
                        <option value="university">Universidad</option>
                        <option value="training-center">Centro de Estudios</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ciudad</label>
                    <input type="text" placeholder="Ej: Madrid" value={form.city}
                        onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">País</label>
                    <input type="text" placeholder="Ej: España" value={form.country}
                        onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                    <input type="text" placeholder="Ej: Europe/Madrid" value={form.timezone}
                        onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Código Institucional (Opcional)</label>
                    <input type="text" placeholder="Ej: CIENCIAS-2026" value={form.institutionalCode}
                        onChange={e => setForm(p => ({ ...p, institutionalCode: e.target.value.toUpperCase().replace(/\s+/g, '-') }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                    <p className="text-xs text-gray-500 mt-2">Código compartido para que los profesores se registren. Se guardará de forma segura. Dejar en blanco para no crear ninguno nuevo.</p>
                </div>
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><XCircle className="w-4 h-4" /> {error}</div>}
                {success && <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {success}</div>}
                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all">Cerrar</button>
                    <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg shadow-purple-200 dark:shadow-purple-900/20 transition-all flex justify-center items-center gap-2">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingInstitutionId ? <><Pencil className="w-5 h-5" /><span>Guardar</span></> : <><Plus className="w-5 h-5" /><span>Crear</span></>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InstitutionFormPanel;
