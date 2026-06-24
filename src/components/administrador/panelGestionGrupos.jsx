import React, { useEffect, useMemo, useState } from 'react';
import { obtenerEstudios } from '../../services/estudio';
import {
    crearGrupoAsignatura,
    crearGruposCursoGrado,
    eliminarUltimoGrupoAsignatura,
    eliminarUltimosGruposAsignaturas,
    eliminarUltimosGruposCursoGrado
} from '../../services/grupo';
import "../../styles/admin-common.css";
import "../../styles/panelGestionUsuarios-style.css";
import "../../styles/panelGestionGrupos-style.css";

const CURSOS = ["PRIMERO", "SEGUNDO", "TERCERO", "CUARTO"];

const estadoInicialFormulario = {
    codigoCrear: '',
    gradoCrear: '',
    cursoCrear: 'PRIMERO',
    codigoEliminar: '',
    codigosEliminar: '',
    gradoEliminar: '',
    cursoEliminar: 'PRIMERO'
};

const obtenerPayloadResultado = (response) => {
    if (response?.err) {
        throw new Error(response.errmsg || "No se pudo completar la operación");
    }
    if (response?.result?.err || response?.result?.error) {
        throw new Error(response.result.message || "No se pudo completar la operación");
    }
    return response?.result?.result || response?.result || {};
};

const parseCodigos = (texto) => {
    return texto
        .split(/[\s,;]+/)
        .map(codigo => codigo.trim())
        .filter(Boolean)
        .map(codigo => Number.parseInt(codigo, 10))
        .filter(codigo => Number.isInteger(codigo));
};

const PanelGestionGrupos = () => {
    const [estudios, setEstudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [operationLoading, setOperationLoading] = useState(false);
    const [formData, setFormData] = useState(estadoInicialFormulario);
    const [resultadoOperacion, setResultadoOperacion] = useState(null);

    useEffect(() => {
        const fetchEstudios = async () => {
            try {
                const response = await obtenerEstudios();
                const payload = obtenerPayloadResultado(response);
                const estudiosRecibidos = Array.isArray(payload) ? payload : [];
                setEstudios(estudiosRecibidos);
                if (estudiosRecibidos.length > 0) {
                    const primerEstudio = String(estudiosRecibidos[0].id);
                    setFormData(prev => ({
                        ...prev,
                        gradoCrear: primerEstudio,
                        gradoEliminar: primerEstudio
                    }));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEstudios();
    }, []);

    const estudioSeleccionadoCrear = useMemo(() => {
        return estudios.find(estudio => String(estudio.id) === String(formData.gradoCrear));
    }, [estudios, formData.gradoCrear]);

    const estudioSeleccionadoEliminar = useMemo(() => {
        return estudios.find(estudio => String(estudio.id) === String(formData.gradoEliminar));
    }, [estudios, formData.gradoEliminar]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const ejecutarOperacion = async ({ accion, mensajeExito, requiereConfirmacion = false, resumen }) => {
        if (requiereConfirmacion && !window.confirm("Se eliminará siempre el grupo de mayor número. ¿Quieres continuar?")) {
            return;
        }

        setOperationLoading(true);
        setError(null);
        setFeedback(null);
        try {
            const response = await accion();
            const payload = obtenerPayloadResultado(response);
            setResultadoOperacion({
                titulo: resumen,
                ...payload
            });
            setFeedback({ tipo: 'success', mensaje: mensajeExito });
        } catch (err) {
            setError(err.message);
        } finally {
            setOperationLoading(false);
        }
    };

    const handleCrearGrupoAsignatura = (e) => {
        e.preventDefault();
        const codigo = Number.parseInt(formData.codigoCrear, 10);
        if (!Number.isInteger(codigo)) {
            setError("Introduce un código de asignatura válido");
            return;
        }

        ejecutarOperacion({
            accion: () => crearGrupoAsignatura(codigo),
            mensajeExito: "Grupo creado correctamente",
            resumen: `Creación en asignatura ${codigo}`
        });
    };

    const handleCrearGruposCurso = (e) => {
        e.preventDefault();
        const estudiosId = Number.parseInt(formData.gradoCrear, 10);
        if (!Number.isInteger(estudiosId)) {
            setError("Selecciona un grado válido");
            return;
        }

        ejecutarOperacion({
            accion: () => crearGruposCursoGrado(estudiosId, formData.cursoCrear),
            mensajeExito: "Grupos creados correctamente",
            resumen: `Creación en ${formData.cursoCrear} de ${estudioSeleccionadoCrear?.nombre || 'grado'}`
        });
    };

    const handleEliminarGrupoAsignatura = (e) => {
        e.preventDefault();
        const codigo = Number.parseInt(formData.codigoEliminar, 10);
        if (!Number.isInteger(codigo)) {
            setError("Introduce un código de asignatura válido");
            return;
        }

        ejecutarOperacion({
            accion: () => eliminarUltimoGrupoAsignatura(codigo),
            mensajeExito: "Grupo eliminado correctamente",
            requiereConfirmacion: true,
            resumen: `Eliminación en asignatura ${codigo}`
        });
    };

    const handleEliminarGruposAsignaturas = (e) => {
        e.preventDefault();
        const codigos = parseCodigos(formData.codigosEliminar);
        if (codigos.length === 0) {
            setError("Introduce al menos un código de asignatura válido");
            return;
        }

        ejecutarOperacion({
            accion: () => eliminarUltimosGruposAsignaturas(codigos),
            mensajeExito: "Grupos eliminados correctamente",
            requiereConfirmacion: true,
            resumen: `Eliminación en ${codigos.length} asignatura${codigos.length === 1 ? '' : 's'}`
        });
    };

    const handleEliminarGruposCurso = (e) => {
        e.preventDefault();
        const estudiosId = Number.parseInt(formData.gradoEliminar, 10);
        if (!Number.isInteger(estudiosId)) {
            setError("Selecciona un grado válido");
            return;
        }

        ejecutarOperacion({
            accion: () => eliminarUltimosGruposCursoGrado(estudiosId, formData.cursoEliminar),
            mensajeExito: "Grupos eliminados correctamente",
            requiereConfirmacion: true,
            resumen: `Eliminación en ${formData.cursoEliminar} de ${estudioSeleccionadoEliminar?.nombre || 'grado'}`
        });
    };

    const gruposResultado = resultadoOperacion?.gruposCreados || resultadoOperacion?.gruposEliminados || [];
    const tipoResultado = resultadoOperacion?.gruposCreados ? 'creados' : 'eliminados';

    return (
        <div className="admin-page-container">
            <div className="admin-content-wrap admin-content-wrap--full-width">
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Panel de Gestión de Grupos</h1>
                    <p className="admin-page-subtitle">
                        Control de grupos por asignatura y por curso de grado manteniendo la numeración secuencial.
                    </p>
                </div>

                {loading ? (
                    <div className="admin-loading">Cargando grados...</div>
                ) : (
                    <>
                        <div className="admin-grid admin-grid-3 group-summary-grid">
                            <div className="admin-card group-summary-card">
                                <span className="group-summary-label">Grados disponibles</span>
                                <strong>{estudios.length}</strong>
                            </div>
                            <div className="admin-card group-summary-card">
                                <span className="group-summary-label">Crear por curso</span>
                                <strong>{estudioSeleccionadoCrear?.nombre || 'Sin grado'}</strong>
                            </div>
                            <div className="admin-card group-summary-card">
                                <span className="group-summary-label">Última operación</span>
                                <strong>{resultadoOperacion?.asignaturasProcesadas || 0} asignaturas</strong>
                            </div>
                        </div>

                        {error && <div className="admin-error">Error: {error}</div>}
                        {feedback && (
                            <div className={`group-feedback group-feedback-${feedback.tipo}`}>
                                {feedback.mensaje}
                            </div>
                        )}

                        <div className="group-management-grid">
                            <section className="admin-card group-action-card">
                                <div className="admin-card-header">
                                    <h2 className="admin-card-title">
                                        <span className="admin-card-icon">+</span>
                                        Crear grupos
                                    </h2>
                                    <span className="admin-badge admin-badge-success">Secuencia +1</span>
                                </div>

                                <form className="group-form" onSubmit={handleCrearGrupoAsignatura}>
                                    <div className="admin-form-group">
                                        <label className="admin-label" htmlFor="codigoCrear">Asignatura</label>
                                        <input
                                            id="codigoCrear"
                                            name="codigoCrear"
                                            type="number"
                                            className="admin-input"
                                            value={formData.codigoCrear}
                                            onChange={handleInputChange}
                                            placeholder="Código de asignatura"
                                            min="1"
                                        />
                                    </div>
                                    <button className="admin-btn admin-btn-success" type="submit" disabled={operationLoading}>
                                        Crear siguiente grupo
                                    </button>
                                </form>

                                <div className="group-section-divider" />

                                <form className="group-form" onSubmit={handleCrearGruposCurso}>
                                    <div className="group-form-row">
                                        <div className="admin-form-group">
                                            <label className="admin-label" htmlFor="gradoCrear">Grado</label>
                                            <select
                                                id="gradoCrear"
                                                name="gradoCrear"
                                                className="admin-select"
                                                value={formData.gradoCrear}
                                                onChange={handleInputChange}
                                            >
                                                {estudios.map(estudio => (
                                                    <option key={estudio.id} value={estudio.id}>
                                                        {estudio.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-label" htmlFor="cursoCrear">Curso</label>
                                            <select
                                                id="cursoCrear"
                                                name="cursoCrear"
                                                className="admin-select"
                                                value={formData.cursoCrear}
                                                onChange={handleInputChange}
                                            >
                                                {CURSOS.map(curso => (
                                                    <option key={curso} value={curso}>{curso}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button className="admin-btn admin-btn-primary" type="submit" disabled={operationLoading || estudios.length === 0}>
                                        Crear en todo el curso
                                    </button>
                                </form>
                            </section>

                            <section className="admin-card group-action-card group-danger-card">
                                <div className="admin-card-header">
                                    <h2 className="admin-card-title">
                                        <span className="admin-card-icon">-</span>
                                        Eliminar grupos
                                    </h2>
                                    <span className="admin-badge admin-badge-danger">Mayor número</span>
                                </div>

                                <form className="group-form" onSubmit={handleEliminarGrupoAsignatura}>
                                    <div className="admin-form-group">
                                        <label className="admin-label" htmlFor="codigoEliminar">Asignatura</label>
                                        <input
                                            id="codigoEliminar"
                                            name="codigoEliminar"
                                            type="number"
                                            className="admin-input"
                                            value={formData.codigoEliminar}
                                            onChange={handleInputChange}
                                            placeholder="Código de asignatura"
                                            min="1"
                                        />
                                    </div>
                                    <button className="admin-btn admin-btn-danger" type="submit" disabled={operationLoading}>
                                        Eliminar último grupo
                                    </button>
                                </form>

                                <div className="group-section-divider" />

                                <form className="group-form" onSubmit={handleEliminarGruposAsignaturas}>
                                    <div className="admin-form-group">
                                        <label className="admin-label" htmlFor="codigosEliminar">Varias asignaturas</label>
                                        <textarea
                                            id="codigosEliminar"
                                            name="codigosEliminar"
                                            className="admin-textarea group-code-textarea"
                                            value={formData.codigosEliminar}
                                            onChange={handleInputChange}
                                            placeholder="Códigos separados por coma, espacio o salto de línea"
                                        />
                                    </div>
                                    <button className="admin-btn admin-btn-danger" type="submit" disabled={operationLoading}>
                                        Eliminar últimos grupos
                                    </button>
                                </form>

                                <div className="group-section-divider" />

                                <form className="group-form" onSubmit={handleEliminarGruposCurso}>
                                    <div className="group-form-row">
                                        <div className="admin-form-group">
                                            <label className="admin-label" htmlFor="gradoEliminar">Grado</label>
                                            <select
                                                id="gradoEliminar"
                                                name="gradoEliminar"
                                                className="admin-select"
                                                value={formData.gradoEliminar}
                                                onChange={handleInputChange}
                                            >
                                                {estudios.map(estudio => (
                                                    <option key={estudio.id} value={estudio.id}>
                                                        {estudio.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="admin-form-group">
                                            <label className="admin-label" htmlFor="cursoEliminar">Curso</label>
                                            <select
                                                id="cursoEliminar"
                                                name="cursoEliminar"
                                                className="admin-select"
                                                value={formData.cursoEliminar}
                                                onChange={handleInputChange}
                                            >
                                                {CURSOS.map(curso => (
                                                    <option key={curso} value={curso}>{curso}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button className="admin-btn admin-btn-danger" type="submit" disabled={operationLoading || estudios.length === 0}>
                                        Eliminar en todo el curso
                                    </button>
                                </form>
                            </section>
                        </div>

                        {operationLoading && <div className="admin-loading">Procesando operación...</div>}

                        {resultadoOperacion && gruposResultado.length > 0 && (
                            <section className="admin-card group-result-section">
                                <div className="admin-card-header">
                                    <h2 className="admin-card-title">Resultado</h2>
                                    <span className="admin-badge admin-badge-primary">
                                        {gruposResultado.length} {tipoResultado}
                                    </span>
                                </div>
                                <p className="group-result-title">{resultadoOperacion.titulo}</p>
                                <div className="group-result-list">
                                    {gruposResultado.map(grupo => (
                                        <div key={`${grupo.codigoAsignatura}-${grupo.numGrupo}-${grupo.id}`} className="group-result-row">
                                            <span className="group-result-number">Grupo {grupo.numGrupo}</span>
                                            <span>{grupo.nombreAsignatura}</span>
                                            <span className="group-result-code">{grupo.codigoAsignatura}</span>
                                            <span className="admin-badge admin-badge-secondary">{grupo.curso}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PanelGestionGrupos;
