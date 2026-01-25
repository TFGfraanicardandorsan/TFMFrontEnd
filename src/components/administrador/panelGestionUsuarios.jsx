import React, { useEffect, useState } from 'react';
import { obtenerTodosUsuarios, actualizarUsuario } from '../../services/usuario';
import "../../styles/admin-common.css";
import "../../styles/panelGestionUsuarios-style.css";

const UserManagementPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await obtenerTodosUsuarios();
                setUsers(response.data);
            } catch (err) {
                setError(err.message);
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
            await actualizarUsuario({ ...formData, id: editingUser.id });
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

    return (
        <>
            <div className="admin-page-container">
                <div className="admin-content-wrap">
                    {/* Header */}
                    <div className="admin-page-header">
                        <h1 className="admin-page-title">👥 Panel de Gestión de Usuarios</h1>
                        <p className="admin-page-subtitle">
                            Administra todos los usuarios del sistema. Puedes actualizar la información de cada usuario haciendo clic en el botón correspondiente.
                        </p>
                    </div>

                    {/* Contenido */}
                    {loading ? (
                        <div className="admin-loading">Cargando usuarios...</div>
                    ) : error ? (
                        <div className="admin-error">Error: {error}</div>
                    ) : users.length === 0 ? (
                        <div className="admin-empty-state">
                            <div className="admin-empty-state-icon">👤</div>
                            <p className="admin-empty-state-text">No hay usuarios registrados.</p>
                        </div>
                    ) : (
                        <div className="admin-grid admin-grid-3">
                            {users.map(user => (
                                <div key={user.id} className="admin-card">
                                    <div className="admin-card-header">
                                        <h2 className="admin-card-title">
                                            <span className="admin-card-icon">👤</span>
                                            {user.name}
                                        </h2>
                                        <span className="admin-badge admin-badge-primary">
                                            {user.rol || 'Usuario'}
                                        </span>
                                    </div>
                                    <div className="admin-card-body">
                                        <p><strong>Email:</strong> {user.email}</p>
                                        {user.estudio && <p><strong>Estudio:</strong> {user.estudio}</p>}
                                        {user.uvus && <p><strong>UVUS:</strong> {user.uvus}</p>}
                                    </div>
                                    <div className="admin-card-footer">
                                        <button
                                            className="admin-btn admin-btn-primary admin-btn-sm"
                                            onClick={() => handleOpenModal(user)}
                                        >
                                            ✏️ Editar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={handleCloseModal}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">✏️ Editar Usuario</h3>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="admin-modal-body">
                                <div className="admin-form-group">
                                    <label className="admin-label">Nombre</label>
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
                                    <label className="admin-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="admin-input"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                {formData.estudio !== undefined && (
                                    <div className="admin-form-group">
                                        <label className="admin-label">Estudio</label>
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
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ height: "80px" }} />
        </>
    );
};

export default UserManagementPanel;