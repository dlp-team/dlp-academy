// src/pages/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Users,
    Loader2, BookOpen, GraduationCap,
    ShieldAlert, Globe, BarChart3
} from 'lucide-react';
import {
    collection, query, where, getDocs,
    serverTimestamp, deleteDoc, doc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../../components/layout/Header';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { usePersistentState } from '../../hooks/usePersistentState';
import { buildUserScopedPersistenceKey } from '../../utils/pagePersistence';
import RoleBadge from './components/RoleBadge';
import AdminConfirmModal from './components/AdminConfirmModal';
import { parseCsvEmails } from './utils/adminEmailUtils';
import { filterAdminUsers } from './utils/adminUserFilterUtils';
import { filterInstitutions } from './utils/adminInstitutionFilterUtils';
import {
    createAdminInstitutionFormState,
    mapInstitutionToFormState,
} from './utils/adminInstitutionFormUtils';
import { buildInstitutionInviteSyncPlan } from './utils/adminInstitutionInviteSyncUtils';
import { buildAdminUsersPageQuery } from './utils/adminUserPaginationQueryUtils';
import {
    buildInstitutionConfirmDialogText,
    buildUserConfirmDialogText,
} from './utils/adminConfirmDialogTextUtils';
import {
    ADMIN_USER_ROLE_LABELS,
} from './utils/adminUserRoleConstants';
import UserTableRow from './components/UserTableRow';
import InstitutionTableRow from './components/InstitutionTableRow';
import AdminUsersFilters from './components/AdminUsersFilters';
import AdminInstitutionsFilters from './components/AdminInstitutionsFilters';
import InstitutionFormPanel from './components/InstitutionFormPanel';

// ─── Shared helpers ───────────────────────────────────────────────────────────

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab = ({ stats, loading }: any) => {
    const cards = [
        { label: 'Instituciones',  value: stats.Institutions,  icon: Building2,    color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Profesores',     value: stats.teachers, icon: BookOpen,     color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Alumnos',        value: stats.students, icon: GraduationCap,color: 'text-blue-600',   bg: 'bg-blue-50   dark:bg-blue-900/20'   },
        { label: 'Total Usuarios', value: stats.total,    icon: Users,        color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20'},
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map(({ label, value, icon, color, bg }: any) => (
                    <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                            {React.createElement(icon, { className: `w-5 h-5 ${color}` })}
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : (value ?? '—')}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center py-16">
                <BarChart3 className="w-14 h-14 text-slate-200 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Gráficas de Actividad</h3>
                <p className="text-slate-500 max-w-sm text-sm">Los reportes de actividad por institución estarán disponibles próximamente.</p>
                <span className="mt-4 inline-block px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-full text-xs font-medium">Próximamente</span>
            </div>
        </div>
    );
};

// ─── Institutions Tab ──────────────────────────────────────────────────────────────

const InstitutionsTab = () => {
    const navigate = useNavigate();
    const [Institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingInstitutionId, setEditingInstitutionId] = useState<any>(null);
    const [form, setForm] = useState(createAdminInstitutionFormState());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [institutionConfirm, setInstitutionConfirm] = useState<any>({
        isOpen: false,
        action: '',
        institution: null,
    });
    const [isConfirmingInstitutionAction, setIsConfirmingInstitutionAction] = useState(false);

    const fetchInstitutions = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'institutions'));
            setInstitutions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchInstitutions(); }, []);

    const handleCreate = async (e: any) => {
        e.preventDefault();
        setError(''); setSuccess(''); setSubmitting(true);

        const name = form.name.trim();
        const domain = form.domain.toLowerCase().trim();
        const admins = parseCsvEmails(form.institutionAdministrators);
        const institutionType = (form.type || 'school').trim();
        const city = form.city.trim();
        const country = form.country.trim();
        const timezone = form.timezone.trim() || 'Europe/Madrid';
        const institutionalCode = (form.institutionalCode || '').trim();
        if (!name) {
            setError('El nombre es obligatorio.');
            setSubmitting(false);
            return;
        }

        if (!domain || !domain.includes('.')) {
            setError('El dominio es obligatorio y debe ser válido (ej: universidad.edu).');
            setSubmitting(false);
            return;
        }

        if (admins.length === 0) {
            setError('Debes indicar al menos un administrador institucional.');
            setSubmitting(false);
            return;
        }

        const invalidAdmins = admins.filter(email => !/^\S+@\S+\.\S+$/.test(email));
        if (invalidAdmins.length > 0) {
            setError(`Emails de administradores inválidos: ${invalidAdmins.join(', ')}`);
            setSubmitting(false);
            return;
        }

        if (!institutionType) {
            setError('El tipo de institución es obligatorio.');
            setSubmitting(false);
            return;
        }

        try {
            const institutionPayload = {
                name,
                domain,
                domains: [domain],
                institutionAdministrators: admins,
                adminEmail: admins[0],
                type: institutionType,
                city,
                country,
                timezone,
                updatedAt: serverTimestamp(),
            };

            if (editingInstitutionId) {
                const batch = writeBatch(db);
                const institutionRef = doc(db, 'institutions', editingInstitutionId);
                batch.update(institutionRef, institutionPayload);

                // 1. Fetch current invites for this institution
                const invitesQuery = query(
                    collection(db, 'institution_invites'), 
                    where('institutionId', '==', editingInstitutionId),
                    where('role', '==', 'institutionadmin')
                );
                const invitesSnap = await getDocs(invitesQuery);
                
                const existingInvites: any[] = [];
                invitesSnap.forEach(snapDoc => {
                    existingInvites.push({ id: snapDoc.id, email: snapDoc.data().email });
                });

                // 2. Identify which emails to add and which to delete
                const { emailsToAdd, invitesToDelete } = buildInstitutionInviteSyncPlan(existingInvites, admins);

                // 3. Add deletion tasks to batch
                invitesToDelete.forEach(inv => {
                    batch.delete(doc(db, 'institution_invites', inv.id));
                });

                // 4. Add creation tasks to batch
                emailsToAdd.forEach(email => {
                    const newInviteRef = doc(collection(db, 'institution_invites'));
                    batch.set(newInviteRef, {
                        email: email,
                        role: 'institutionadmin',
                        institutionId: editingInstitutionId,
                        invitedAt: serverTimestamp()
                    });
                });

                if (institutionalCode) {
                    const newCodeRef = doc(db, 'institution_invites', institutionalCode);
                    batch.set(newCodeRef, {
                        type: 'institutional',
                        institutionId: editingInstitutionId,
                        createdAt: serverTimestamp()
                    });
                }

                await batch.commit();
                setSuccess(`Institución "${name}" actualizada y administradores sincronizados.`);
            } else {
                const batch = writeBatch(db);
                const institutionDocRef = doc(collection(db, 'institutions'));

                batch.set(institutionDocRef, {
                    ...institutionPayload,
                    enabled: true,
                    createdAt: serverTimestamp(),
                });

                admins.forEach(email => {
                    const inviteRef = doc(collection(db, 'institution_invites'));
                    batch.set(inviteRef, {
                        email: email,
                        role: 'institutionadmin',
                        institutionId: institutionDocRef.id,
                        invitedAt: serverTimestamp()
                    });
                });

                if (institutionalCode) {
                    const newCodeRef = doc(db, 'institution_invites', institutionalCode);
                    batch.set(newCodeRef, {
                        type: 'institutional',
                        institutionId: institutionDocRef.id,
                        createdAt: serverTimestamp()
                    });
                }

                await batch.commit();
                setSuccess(`Institución "${name}" creada correctamente.`);
            }

            setForm(createAdminInstitutionFormState());
            setEditingInstitutionId(null);
            setShowCreateForm(false);
            fetchInstitutions();
        } catch { setError('Error al crear la institución.'); }
        finally { setSubmitting(false); }
    };

    const queueInstitutionConfirm = (action, institution: any) => {
        setInstitutionConfirm({ isOpen: true, action, institution });
    };

    const closeInstitutionConfirm = () => {
        if (isConfirmingInstitutionAction) return;
        setInstitutionConfirm({ isOpen: false, action: '', institution: null });
    };

    const confirmInstitutionAction = async () => {
        if (!institutionConfirm.institution) return;

        setIsConfirmingInstitutionAction(true);
        try {
            if (institutionConfirm.action === 'toggle') {
                await updateDoc(doc(db, 'institutions', institutionConfirm.institution.id), {
                    enabled: !(institutionConfirm.institution.enabled !== false)
                });
            }

            if (institutionConfirm.action === 'delete') {
                await deleteDoc(doc(db, 'institutions', institutionConfirm.institution.id));
            }

            await fetchInstitutions();
            setInstitutionConfirm({ isOpen: false, action: '', institution: null });
        } catch (e) {
            console.error(e);
        } finally {
            setIsConfirmingInstitutionAction(false);
        }
    };

    const handleToggle = (school: any) => {
        queueInstitutionConfirm('toggle', school);
    };

    const handleDelete = (school: any) => {
        queueInstitutionConfirm('delete', school);
    };

    const handleEditInstitution = (school: any) => {
        setError('');
        setSuccess('');
        setEditingInstitutionId(school.id);
        setForm(mapInstitutionToFormState(school));
        setShowCreateForm(true);
    };

    const toggleInstitutionCreateForm = () => {
        setError('');
        setSuccess('');
        setEditingInstitutionId(null);
        setShowCreateForm(prev => !prev);
    };

    const filtered = filterInstitutions(Institutions, search, statusFilter, typeFilter);

    const institutionConfirmText = buildInstitutionConfirmDialogText(institutionConfirm);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminInstitutionsFilters
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                search={search}
                onSearchChange={setSearch}
                onToggleCreateForm={toggleInstitutionCreateForm}
            />

            {showCreateForm && (
                <InstitutionFormPanel
                    editingInstitutionId={editingInstitutionId}
                    form={form}
                    setForm={setForm}
                    submitting={submitting}
                    error={error}
                    success={success}
                    onSubmit={handleCreate}
                    onClose={() => {
                        setShowCreateForm(false);
                        setEditingInstitutionId(null);
                    }}
                />
            )}

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-purple-500" /></div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-500" /> Instituciones Registradas ({filtered.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Institución</th>
                                    <th className="px-6 py-4">ID (Firestore)</th>
                                    <th className="px-6 py-4">Dominio</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Ciudad</th>
                                    <th className="px-6 py-4">Admins</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">No hay instituciones registradas.</td></tr>
                                ) : filtered.map((school) => (
                                    <InstitutionTableRow
                                        key={school.id}
                                        school={school}
                                        onOpenDashboard={(schoolId) => navigate(`/institution-admin-dashboard?institutionId=${encodeURIComponent(schoolId)}`)}
                                        onEdit={handleEditInstitution}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AdminConfirmModal
                isOpen={institutionConfirm.isOpen}
                title={institutionConfirmText.title}
                description={institutionConfirmText.description}
                confirmLabel={institutionConfirmText.confirmLabel}
                isConfirming={isConfirmingInstitutionAction}
                onCancel={closeInstitutionConfirm}
                onConfirm={confirmInstitutionAction}
            />

        </div>
    );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────

const UsersTab = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [statusFilter, setStatusFilter] = useState('all');

    const [lastVisible, setLastVisible] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 50;
    const [userConfirm, setUserConfirm] = useState<any>({
        isOpen: false,
        action: '',
        user: null,
        newRole: '',
    });
    const [isConfirmingUserAction, setIsConfirmingUserAction] = useState(false);

    const fetchUsers = useCallback(async (isNextPage = false, cursor = null) => {
        if (isNextPage) setLoadingMore(true);
        else setLoading(true);

        try {
            const q = buildAdminUsersPageQuery(PAGE_SIZE, isNextPage ? cursor : null);

            const snap = await getDocs(q);
            
            const fetchedUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            setLastVisible(snap.docs[snap.docs.length - 1]);
            setHasMore(snap.docs.length === PAGE_SIZE);
            
            if (isNextPage) {
                setUsers(prev => [...prev, ...fetchedUsers]);
            } else {
                setUsers(fetchedUsers);
            }
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const queueUserConfirm = (payload: any) => {
        setUserConfirm({ isOpen: true, ...payload });
    };

    const closeUserConfirm = () => {
        if (isConfirmingUserAction) return;
        setUserConfirm({ isOpen: false, action: '', user: null, newRole: '' });
    };

    const confirmUserAction = async () => {
        if (!userConfirm.user) return;

        setIsConfirmingUserAction(true);
        try {
            if (userConfirm.action === 'toggle') {
                await updateDoc(doc(db, 'users', userConfirm.user.id), {
                    enabled: !(userConfirm.user.enabled !== false)
                });
            }

            if (userConfirm.action === 'role') {
                await updateDoc(doc(db, 'users', userConfirm.user.id), {
                    role: userConfirm.newRole
                });
            }

            await fetchUsers();
            setUserConfirm({ isOpen: false, action: '', user: null, newRole: '' });
        } catch (e) {
            console.error(e);
        } finally {
            setIsConfirmingUserAction(false);
        }
    };

    const handleToggle = (u: any) => {
        queueUserConfirm({ action: 'toggle', user: u, newRole: '' });
    };

    const handleRoleChange = (u, newRole: any) => {
        if (!newRole || newRole === u.role) return;
        queueUserConfirm({ action: 'role', user: u, newRole });
    };

    const filtered = filterAdminUsers(users, search, roleFilter, statusFilter);

    const userConfirmText = buildUserConfirmDialogText(userConfirm, ADMIN_USER_ROLE_LABELS);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminUsersFilters
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-purple-500" /></div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" /> Todos los Usuarios ({filtered.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Cambiar Rol</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No se encontraron usuarios.</td></tr>
                                ) : filtered.map((u) => (
                                    <UserTableRow
                                        key={u.id}
                                        userData={u}
                                        handleRoleChange={handleRoleChange}
                                        handleToggle={handleToggle}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {hasMore && (
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-center">
                            <button 
                                onClick={() => fetchUsers(true, lastVisible)}
                                disabled={loadingMore}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                Cargar más usuarios
                            </button>
                        </div>
                    )}

                </div>
            )}

            <AdminConfirmModal
                isOpen={userConfirm.isOpen}
                title={userConfirmText.title}
                description={userConfirmText.description}
                confirmLabel={userConfirmText.confirmLabel}
                isConfirming={isConfirmingUserAction}
                onCancel={closeUserConfirm}
                onConfirm={confirmUserAction}
            />
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = ({ user }: any) => {
    const navigate = useNavigate();
    useIdleTimeout(15);
    const activeTabKey = buildUserScopedPersistenceKey('admin-dashboard', user, 'active-tab');
    const [activeTab, setActiveTab] = usePersistentState(activeTabKey, 'overview');
    const [stats, setStats] = useState<any>({ Institutions: null, teachers: null, students: null, total: null });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            console.warn('Unauthorized access to Admin Dashboard');
            navigate('/home');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                const [InstitutionsSnap, teachersSnap, studentsSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'institutions')),
                    getDocs(query(collection(db, 'users'), where('role', '==', 'teacher'))),
                    getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
                    getDocs(collection(db, 'users')),
                ]);
                setStats({
                    Institutions:  InstitutionsSnap.size,
                    teachers: teachersSnap.size,
                    students: studentsSnap.size,
                    total:    usersSnap.size,
                });
            } catch (e) { console.error(e); }
            finally { setStatsLoading(false); }
        };
        fetchStats();
    }, []);

    const TABS = [
        { key: 'overview', label: 'Resumen',        icon: BarChart3   },
        { key: 'Institutions',  label: 'Instituciones',  icon: Building2   },
        { key: 'users',    label: 'Usuarios',       icon: Users       },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Page header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel de Administración Global</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gestiona todas las instituciones y usuarios de la plataforma.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium">
                        <ShieldAlert className="w-4 h-4" /> Acceso de Admin Global
                    </div>
                </div>

                {/* Underline tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
                    {TABS.map(({ key, label, icon }: any) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 -mb-px transition-colors ${
                                activeTab === key
                                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}>
                            {React.createElement(icon, { className: 'w-4 h-4' })} {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && <OverviewTab stats={stats} loading={statsLoading} />}
                {activeTab === 'Institutions'  && <InstitutionsTab />}
                {activeTab === 'users'    && <UsersTab />}
            </main>
        </div>
    );
};

export default AdminDashboard;