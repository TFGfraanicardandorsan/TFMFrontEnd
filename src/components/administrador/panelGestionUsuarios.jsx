import { useEffect, useState, useMemo } from 'react';
import { obtenerTodosUsuarios, actualizarUsuario } from '../../services/usuario';
import "../../styles/admin-common.css";
import "../../styles/panelGestionUsuarios-style.css";
import { isDelegationRole } from '../../lib/roles';
import { useTranslation } from 'react-i18next';
import { translateRole } from '../../lib/i18nLabels';

const UserManagementPanel = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    // Estados para filtros y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('todos');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 9;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await obtenerTodosUsuarios();
                if (Array.isArray(response?.result.result)) {
                    const mappedUsers = response.result.result.map(u => ({
                        id: u.uvus || u.id,
                        name: u.nombre_completo || u.name,
                        email: u.correo || u.email,
                        rol: u.rol,
                        estudio: u.estudio,
                        uvus: u.uvus
                    }));
                    setUsers(mappedUsers);
                } else {
                    setUsers([]);
                }
            } catch (err) {
                setError(err.message);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleOpenModal = (user) => {
        setEditingUser(user);
        setFormData(user);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingUser(null);
        setFormData({});
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await actualizarUsuario(editingUser.id, {
                nombre_completo: formData.name,
                correo: formData.email,
                rol: formData.rol
            });
            setUsers(users.map(user => (user.id === editingUser.id ? { ...user, ...formData } : user)));
            handleCloseModal();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Lógica de filtrado y paginación
    const filteredUsers = useMemo(() => {
        return users
            .filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(user =>
                roleFilter === 'todos' ||
                (roleFilter === 'delegacion' && isDelegationRole(user.rol)) ||
                (user.rol && user.rol.toLowerCase() === roleFilter.toLowerCase())
            );
    }, [users, searchTerm, roleFilter]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * usersPerPage;
        return filteredUsers.slice(startIndex, startIndex + usersPerPage);
    }, [filteredUsers, currentPage, usersPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <>
            <div className="admin-page-container">
                <div className="admin-content-wrap admin-content-wrap--full-width">
                    {/* Header */}
                    <div className="admin-page-header">
                        <h1 className="admin-page-title">{t("admin.users.title")}</h1>
                        <p className="admin-page-subtitle">
                            {t("admin.users.subtitle")}
                        </p>
                    </div>

                    {/* Filtros y Búsqueda */}
                    <div className="admin-filters-bar">
                        <input
                            type="text"
                            placeholder={t("admin.users.search_placeholder")}
                            className="admin-search-input"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <select
                            className="admin-filter-select"
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="todos">{t("common.all_roles")}</option>
                            <option value="estudiante">{t("common.roles.estudiante")}</option>
                            <option value="administrador">{t("common.roles.administrador")}</option>
                            <option value="delegacion">{t("common.roles.delegacion")}</option>
                        </select>
                    </div>

                    {/* Contenido */}
                    {loading ? (
                        <div className="admin-loading">{t("admin.users.loading")}</div>
                    ) : error ? (
                        <div className="admin-error">{t("common.error_prefix", { error })}</div>
                    ) : paginatedUsers.length === 0 ? (
                        <div className="admin-empty-state">
                            <div className="admin-empty-state-icon">👤</div>
                            <p className="admin-empty-state-text">{t("admin.users.empty")}</p>
                        </div>
                    ) : (
                        <div className="admin-grid admin-grid-3">
                            {paginatedUsers.map(user => (
                                <div key={user.id} className="admin-card">
                                    <div className="admin-card-header">
                                        <h2 className="admin-card-title">
                                            <span className="admin-card-icon">👤</span>
                                            {user.name}
                                        </h2>
                                        <span className="admin-badge admin-badge-primary">
                                            {translateRole(t, user.rol)}
                                        </span>
                                    </div>
                                    <div className="admin-card-body">
                                        <p><strong>{t("common.email")}:</strong> {user.email}</p>
                                        {user.estudio && <p><strong>{t("common.study")}:</strong> {user.estudio}</p>}
                                        {user.uvus && <p><strong>{t("common.uvus")}:</strong> {user.uvus}</p>}
                                    </div>
                                    <div className="admin-card-footer">
                                        <button
                                            className="admin-btn admin-btn-primary admin-btn-sm"
                                            onClick={() => handleOpenModal(user)}
                                        >
                                            ✏️ {t("common.edit")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="admin-btn"
                            >
                                {t("common.previous")}
                            </button>
                            <span className="admin-pagination-info">
                                {t("common.page_of", { current: currentPage, total: totalPages })}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="admin-btn"
                            >
                                {t("common.next")}
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* Modal de Edición */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={handleCloseModal}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">{t("admin.users.edit_title")}</h3>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-label">{t("common.name")}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="admin-input"
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">{t("common.email")}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="admin-input"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-label">{t("common.role")}</label>
                                    <select
                                        name="rol"
                                        className="admin-input"
                                        value={formData.rol || ''}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="estudiante">{t("common.roles.estudiante")}</option>
                                        <option value="administrador">{t("common.roles.administrador")}</option>
                                        <option value="delegacion">{t("common.roles.delegacion")}</option>
                                    </select>
                                </div>
                                {formData.estudio !== undefined && (
                                    <div className="admin-form-group">
                                        <label className="admin-label">{t("common.study")}</label>
                                        <input
                                            type="text"
                                            name="estudio"
                                            className="admin-input"
                                            value={formData.estudio || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="admin-modal-footer">
                                <button
                                    type="button"
                                    className="admin-btn admin-btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    {t("common.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                >
                                    {t("common.save_changes")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </>
    );
};

export default UserManagementPanel;
