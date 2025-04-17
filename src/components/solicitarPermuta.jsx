import React, { useState, useEffect } from 'react';

const SolicitarPermuta = () => {
    const [formData, setFormData] = useState({
        asignatura: '',
        grupo: [],
        motivo: '',
    });
    const [asignaturas, setAsignaturas] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [loadingAsignaturas, setLoadingAsignaturas] = useState(true);
    const [loadingGrupos, setLoadingGrupos] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Obtener las asignaturas permutables del usuario
        fetch('/api/v1/asignatura/asignaturasPermutablesUsuario')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener asignaturas');
                }
                return response.json();
            })
            .then((data) => {
                setAsignaturas(data);
                setLoadingAsignaturas(false);
            })
            .catch((error) => {
                console.error(error);
                setError('No se pudieron cargar las asignaturas.');
                setLoadingAsignaturas(false);
            });
    }, []);

    const handleAsignaturaChange = (e) => {
        const asignaturaSeleccionada = e.target.value;
        setFormData({
            ...formData,
            asignatura: asignaturaSeleccionada,
            grupo: [], // Reiniciar los grupos seleccionados al cambiar de asignatura
        });

        if (asignaturaSeleccionada) {
            setLoadingGrupos(true);
            // Obtener los grupos disponibles para la asignatura seleccionada
            fetch(`/api/v1/grupo/obtenerTodosGruposMisAsignaturasSinGrupoUsuario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asignatura: asignaturaSeleccionada }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Error al obtener grupos');
                    }
                    return response.json();
                })
                .then((data) => {
                    setGrupos(data);
                    setLoadingGrupos(false);
                })
                .catch((error) => {
                    console.error(error);
                    setError('No se pudieron cargar los grupos.');
                    setLoadingGrupos(false);
                });
        } else {
            setGrupos([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleGrupoChange = (grupoId, checked) => {
        const selectedGrupos = formData.grupo ? [...formData.grupo] : [];
        if (checked) {
            selectedGrupos.push(grupoId);
        } else {
            const index = selectedGrupos.indexOf(grupoId);
            if (index > -1) {
                selectedGrupos.splice(index, 1);
            }
        }
        setFormData({
            ...formData,
            grupo: selectedGrupos,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.asignatura || formData.grupo.length === 0) {
            alert('Por favor, selecciona una asignatura y al menos un grupo.');
            return;
        }
        console.log('Solicitud enviada:', formData);
        // Aquí puedes agregar la lógica para enviar los datos al backend
    };

    return (
        <div>
            <h2>Solicitar Permuta</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="asignatura">Asignatura:</label>
                    {loadingAsignaturas ? (
                        <p>Cargando asignaturas...</p>
                    ) : (
                        <select
                            id="asignatura"
                            name="asignatura"
                            value={formData.asignatura}
                            onChange={handleAsignaturaChange}
                            required
                        >
                            <option value="">Seleccione una asignatura</option>
                            {asignaturas.map((asignatura) => (
                                <option key={asignatura.codigo} value={asignatura.codigo}>
                                    {asignatura.nombre}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div>
                    <label>Grupos:</label>
                    {loadingGrupos ? (
                        <p>Cargando grupos...</p>
                    ) : grupos.length > 0 ? (
                        grupos.map((grupo) => (
                            <div key={grupo.numGrupo}>
                                <input
                                    type="checkbox"
                                    id={`grupo-${grupo.numGrupo}`}
                                    name="grupo"
                                    value={grupo.numGrupo}
                                    onChange={(e) => handleGrupoChange(grupo.numGrupo, e.target.checked)}
                                />
                                <label htmlFor={`grupo-${grupo.numGrupo}`}>{grupo.numGrupo}</label>
                            </div>
                        ))
                    ) : (
                        <p>No hay grupos disponibles para esta asignatura.</p>
                    )}
                </div>
                <div>
                    <label htmlFor="motivo">Motivo:</label>
                    <textarea
                        id="motivo"
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleChange}
                        placeholder="Escribe el motivo de la permuta"
                        required
                    />
                </div>
                <button type="submit">Enviar Solicitud</button>
            </form>
        </div>
    );
};

export default SolicitarPermuta;