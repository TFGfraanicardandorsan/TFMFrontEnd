import React, { useEffect, useState } from 'react';
import { obtenerTodosUsuarios, actualizarUsuario } from '../services/usuario';

const UserManagementPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleUpdateUser = async (userId, updatedFields) => {
        try {
            await actualizarUsuario(userId, updatedFields);
            setUsers(users.map(user => (user.id === userId ? { ...user, ...updatedFields } : user)));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Panel de Gestión de Usuarios</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} - {user.email}
                        {/* Add functionality to update user fields here */}
                        <button onClick={() => handleUpdateUser(user.id, { /* updated fields */ })}>Actualizar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserManagementPanel;