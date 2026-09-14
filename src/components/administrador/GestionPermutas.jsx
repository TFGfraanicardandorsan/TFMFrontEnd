import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  buscarParejasOptimasAdmin,
  cancelarPermutaAdmin,
  cancelarSolicitudAdmin,
  generarPropuestasAdmin,
  obtenerPanelGestionPermutas,
  retirarVigenciaAdmin,
} from '../../services/permuta.js';
import '../../styles/gestionPermutas-style.css';

const extraer = (respuesta) => respuesta?.result?.result;
const textoBusqueda = (item) => JSON.stringify(item).toLocaleLowerCase('es');

const Estado = ({ estado, vigente }) => (
  <span className={`swap-admin-status status-${String(estado).toLowerCase()}`}>
    {estado} {!vigente && '· no vigente'}
  </span>
);
Estado.propTypes = { estado: PropTypes.string.isRequired, vigente: PropTypes.bool.isRequired };

export default function GestionPermutas() {
  const [datos, setDatos] = useState({ resumen: {}, solicitudes: [], permutas: [] });
  const [cargando, setCargando] = useState(true);
  const [ejecutando, setEjecutando] = useState(false);
  const [tab, setTab] = useState('solicitudes');
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [soloVigentes, setSoloVigentes] = useState(true);
  const [parejas, setParejas] = useState(null);
  const [accion, setAccion] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [usuarioSolicitante, setUsuarioSolicitante] = useState('');

  const cargarPanel = useCallback(async () => {
    setCargando(true);
    const respuesta = await obtenerPanelGestionPermutas();
    const panel = extraer(respuesta);
    if (respuesta?.err || !panel) {
      toast.error(respuesta?.errmsg || 'No se pudo cargar la gestión de permutas.');
    } else {
      setDatos(panel);
    }
    setCargando(false);
  }, []);

  useEffect(() => { cargarPanel(); }, [cargarPanel]);

  const lista = tab === 'solicitudes' ? datos.solicitudes : datos.permutas;
  const estados = useMemo(
    () => [...new Set(lista.map((item) => item.estado).filter(Boolean))].sort(),
    [lista]
  );
  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase('es');
    return lista.filter((item) => (!soloVigentes || item.vigente)
      && (!estado || item.estado === estado)
      && (!termino || textoBusqueda(item).includes(termino)));
  }, [lista, busqueda, estado, soloVigentes]);

  const buscarParejas = async () => {
    setEjecutando(true);
    const respuesta = await buscarParejasOptimasAdmin();
    const resultado = extraer(respuesta);
    if (respuesta?.err || !resultado) {
      toast.error(respuesta?.errmsg || 'No se pudieron calcular las parejas óptimas.');
    } else {
      setParejas(resultado);
      toast.success(`Análisis completado: ${resultado.asignaturasResueltas} asignaturas resolubles.`);
    }
    setEjecutando(false);
  };

  const abrirAccion = (tipo, item = null) => {
    setAccion({ tipo, item });
    setMotivo('');
    setUsuarioSolicitante(tipo === 'permuta' ? item.usuario_1_uvus : '');
  };

  const cerrarAccion = () => {
    if (!ejecutando) setAccion(null);
  };

  const ejecutarAccion = async () => {
    setEjecutando(true);
    let respuesta;
    if (accion.tipo === 'solicitud') {
      respuesta = await cancelarSolicitudAdmin(accion.item.solicitud_id, motivo);
    } else if (accion.tipo === 'permuta') {
      respuesta = await cancelarPermutaAdmin(
        accion.item.permuta_id, usuarioSolicitante, motivo
      );
    } else if (accion.tipo === 'retirar') {
      respuesta = await retirarVigenciaAdmin(motivo);
    } else {
      respuesta = await generarPropuestasAdmin();
    }

    const resultado = extraer(respuesta);
    if (respuesta?.err || !resultado) {
      toast.error(respuesta?.errmsg || 'No se pudo completar la operación.');
    } else {
      if (accion.tipo === 'generar') {
        toast.success(`Se han creado ${resultado.propuestasCreadas} propuestas.`);
        setParejas(null);
      } else if (accion.tipo === 'retirar') {
        toast.success('Se ha cerrado la vigencia del periodo de permutas.');
      } else {
        toast.success(
          `Actualización completada: ${resultado.solicitudesCanceladas} solicitudes y ${resultado.permutasCanceladas} permutas canceladas.`
        );
      }
      setAccion(null);
      await cargarPanel();
    }
    setEjecutando(false);
  };

  const resumen = datos.resumen || {};
  return (
    <div className="swap-admin-page">
      <header className="swap-admin-hero">
        <div>
          <p className="swap-admin-eyebrow">OPERACIONES ACADÉMICAS</p>
          <h1>Gestión de permutas</h1>
          <p>Supervisa solicitudes y parejas, ejecuta el emparejamiento óptimo y resuelve excepciones sin perder consistencia entre tablas.</p>
        </div>
        <div className="swap-admin-hero-actions">
          <button className="admin-btn admin-btn-secondary" onClick={buscarParejas} disabled={ejecutando}>
            Buscar parejas óptimas
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => abrirAccion('generar')} disabled={ejecutando}>
            Generar propuestas
          </button>
        </div>
      </header>

      <section className="swap-admin-summary" aria-label="Resumen del periodo">
        <article><span>Solicitudes vigentes</span><strong>{resumen.solicitudes_vigentes ?? 0}</strong><small>{resumen.solicitudes_pendientes ?? 0} pendientes</small></article>
        <article><span>Permutas vigentes</span><strong>{resumen.permutas_vigentes ?? 0}</strong><small>{resumen.propuestas_pendientes ?? 0} propuestas</small></article>
        <article><span>Confirmadas</span><strong>{resumen.permutas_confirmadas ?? 0}</strong><small>validadas o finalizadas</small></article>
        <article><span>Documentos vigentes</span><strong>{resumen.documentos_vigentes ?? 0}</strong><small>expedientes activos</small></article>
      </section>

      {parejas && (
        <section className="swap-admin-matches" aria-live="polite">
          <div className="swap-admin-section-heading">
            <div><h2>Parejas óptimas encontradas</h2><p>{parejas.solicitudesAnalizadas} solicitudes analizadas · {parejas.asignaturasResueltas} asignaturas resolubles</p></div>
            <button className="swap-admin-close" onClick={() => setParejas(null)} aria-label="Cerrar resultados">×</button>
          </div>
          {parejas.parejas.length === 0 ? <p className="swap-admin-empty">No hay solicitudes recíprocas compatibles en este momento.</p> : (
            <div className="swap-admin-match-grid">
              {parejas.parejas.map((pareja, indice) => <article key={`${pareja.estudiante1?.id}-${pareja.estudiante2?.id}-${indice}`}>
                <div className="swap-admin-pair"><strong>{pareja.estudiante1?.nombre}</strong><span>⇄</span><strong>{pareja.estudiante2?.nombre}</strong></div>
                <p>{pareja.estudiante1?.uvus} · {pareja.estudiante2?.uvus}</p>
                <ul>{pareja.asignaturas.map((asignatura) => <li key={asignatura.id}>{asignatura.nombre} ({asignatura.codigo})</li>)}</ul>
              </article>)}
            </div>
          )}
        </section>
      )}

      <section className="swap-admin-workspace">
        <div className="swap-admin-tabs" role="tablist" aria-label="Tipo de registro">
          <button role="tab" aria-selected={tab === 'solicitudes'} className={tab === 'solicitudes' ? 'selected' : ''} onClick={() => { setTab('solicitudes'); setEstado(''); }}>Solicitudes <span>{datos.solicitudes.length}</span></button>
          <button role="tab" aria-selected={tab === 'permutas'} className={tab === 'permutas' ? 'selected' : ''} onClick={() => { setTab('permutas'); setEstado(''); }}>Permutas <span>{datos.permutas.length}</span></button>
        </div>
        <div className="swap-admin-toolbar">
          <label className="swap-admin-search"><span>Buscar</span><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, UVUS, asignatura, código o ID" /></label>
          <label><span>Estado</span><select value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Todos</option>{estados.map((valor) => <option key={valor}>{valor}</option>)}</select></label>
          <label className="swap-admin-check"><input type="checkbox" checked={soloVigentes} onChange={(e) => setSoloVigentes(e.target.checked)} /> Sólo vigentes</label>
          <button className="admin-btn admin-btn-secondary" onClick={cargarPanel} disabled={cargando}>Actualizar</button>
        </div>

        {cargando ? <div className="swap-admin-empty">Cargando gestión de permutas…</div> : filtrados.length === 0 ? <div className="swap-admin-empty">No hay registros que coincidan con los filtros.</div> : (
          <div className="swap-admin-table-wrap">
            {tab === 'solicitudes' ? (
              <table className="swap-admin-table">
                <thead><tr><th>Solicitud</th><th>Estudiante</th><th>Asignatura</th><th>Cambio solicitado</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
                <tbody>{filtrados.map((item) => <tr key={item.solicitud_id}>
                  <td data-label="Solicitud"><strong>#{item.solicitud_id}</strong>{item.en_bloque && <small>Bloque · {item.curso}</small>}</td>
                  <td data-label="Estudiante"><strong>{item.usuario_nombre}</strong><small>{item.usuario_uvus} · {item.usuario_estudio}</small></td>
                  <td data-label="Asignatura"><strong>{item.asignatura_nombre}</strong><small>{item.asignatura_codigo}</small></td>
                  <td data-label="Cambio"><strong>Grupo {item.grupo_solicitante}</strong><small>→ {item.grupos_deseados.join(', ')}</small></td>
                  <td data-label="Estado"><Estado estado={item.estado} vigente={item.vigente} /></td>
                  <td><button className="swap-admin-row-action" disabled={!item.vigente || item.estado !== 'SOLICITADA'} onClick={() => abrirAccion('solicitud', item)}>Cancelar</button></td>
                </tr>)}</tbody>
              </table>
            ) : (
              <table className="swap-admin-table">
                <thead><tr><th>Permuta</th><th>Pareja</th><th>Asignatura</th><th>Grupos</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
                <tbody>{filtrados.map((item) => <tr key={item.permuta_id}>
                  <td data-label="Permuta"><strong>#{item.permuta_id}</strong>{item.en_bloque && <small>Bloque · {item.curso}</small>}</td>
                  <td data-label="Pareja"><strong>{item.usuario_1_nombre}</strong><small>{item.usuario_1_uvus} ⇄ {item.usuario_2_uvus}</small></td>
                  <td data-label="Asignatura"><strong>{item.asignatura_nombre}</strong><small>{item.asignatura_codigo}</small></td>
                  <td data-label="Grupos"><strong>{item.grupo_1} ⇄ {item.grupo_2}</strong><small>{item.documentos_ids.length ? `Documentos: ${item.documentos_ids.join(', ')}` : 'Sin documento'}</small></td>
                  <td data-label="Estado"><Estado estado={item.estado} vigente={item.vigente} /></td>
                  <td><button className="swap-admin-row-action" disabled={!item.vigente} onClick={() => abrirAccion('permuta', item)}>Cancelar</button></td>
                </tr>)}</tbody>
              </table>
            )}
          </div>
        )}
      </section>

      <section className="swap-admin-danger-zone">
        <div><h2>Cierre del periodo</h2><p>Retira en una sola operación la vigencia de solicitudes, permutas y documentos activos.</p></div>
        <button className="admin-btn admin-btn-danger" onClick={() => abrirAccion('retirar')}>Retirar toda la vigencia</button>
      </section>

      {accion && (
        <div className="swap-admin-dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) cerrarAccion(); }}>
          <section className="swap-admin-dialog" role="dialog" aria-modal="true" aria-labelledby="swap-action-title">
            <h2 id="swap-action-title">{accion.tipo === 'retirar' ? 'Cerrar la vigencia del periodo' : accion.tipo === 'generar' ? 'Generar propuestas óptimas' : `Cancelar ${accion.tipo}`}</h2>
            <p>{accion.tipo === 'retirar'
              ? 'Todas las solicitudes, permutas y documentos activos dejarán de estar vigentes.'
              : accion.tipo === 'generar'
                ? 'Se volverá a calcular el óptimo y se crearán propuestas para todas las parejas compatibles.'
                : 'La operación actualizará de forma atómica las solicitudes, permutas, bloques y documentos relacionados.'}</p>
            {accion.tipo === 'permuta' && <label><span>¿Qué participante ha solicitado cancelar?</span><select value={usuarioSolicitante} onChange={(e) => setUsuarioSolicitante(e.target.value)}><option value={accion.item.usuario_1_uvus}>{accion.item.usuario_1_nombre} ({accion.item.usuario_1_uvus})</option><option value={accion.item.usuario_2_uvus}>{accion.item.usuario_2_nombre} ({accion.item.usuario_2_uvus})</option></select></label>}
            {accion.tipo !== 'generar' && <label><span>Motivo (opcional)</span><textarea maxLength={500} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Quedará incluido en la notificación a las personas afectadas." /><small>{motivo.length}/500</small></label>}
            <div className="swap-admin-dialog-actions"><button className="admin-btn admin-btn-secondary" onClick={cerrarAccion} disabled={ejecutando}>Volver</button><button className={`admin-btn ${accion.tipo === 'generar' ? 'admin-btn-primary' : 'admin-btn-danger'}`} onClick={ejecutarAccion} disabled={ejecutando}>{ejecutando ? 'Procesando…' : 'Confirmar operación'}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
