import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { obtenerMiGrupoAsignatura, obtenerTodosGruposMisAsignaturasSinGrupoUsuario } from "../../services/grupo.js";
import { obtenerCursosPermuta, obtenerSolicitudesPermuta, solicitarPermutaCurso } from "../../services/permuta.js";
import { completarCursos, resultadoAPI } from "../../lib/bloquesPermuta.js";
import "../../styles/user-common.css";
import "../../styles/solicitarPermuta-style.css";

export default function SolicitarPermuta() {
  const { t } = useTranslation();
  const [cursos, setCursos] = useState([]);
  const [formularios, setFormularios] = useState({});
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState({});
  const locks = useRef(new Set());
  const [inciertos, setInciertos] = useState({});

  const cargar = useCallback(async () => {
    const respuestas = await Promise.all([obtenerCursosPermuta(), obtenerMiGrupoAsignatura(), obtenerTodosGruposMisAsignaturasSinGrupoUsuario(), obtenerSolicitudesPermuta()]);
    const [matricula, actuales, destinos, existentes] = respuestas.map(resultadoAPI);
    const nuevos = completarCursos(matricula, actuales, destinos);
    setCursos(nuevos);
    setSolicitudes(existentes);
    setFormularios(prev => Object.fromEntries(nuevos.map(c => {
      const anterior = prev[c.curso] || { bloque: false, seleccion: {}, destinos: {} };
      return [c.curso, { ...anterior, destinos: Object.fromEntries(c.asignaturas.map(a => [a.codigo_asignatura,
        (anterior.destinos[a.codigo_asignatura] || []).filter(g => a.grupos.includes(g))])) }];
    })));
    setError(null);
  }, []);

  useEffect(() => { cargar().catch(e => setError(e.message)).finally(() => setCargando(false)); }, [cargar]);
  const cambiar = (curso, fn) => setFormularios(prev => ({ ...prev, [curso]: fn(prev[curso]) }));
  const enviar = async (event, curso, form, elegidas) => {
    event.preventDefault();
    if (locks.current.has(curso) || inciertos[curso]) return;
    locks.current.add(curso);
    setEnviando(prev => ({ ...prev, [curso]: true }));
    try {
      resultadoAPI(await solicitarPermutaCurso(curso, form.bloque, elegidas.map(a => ({
        asignatura: Number(a.codigo_asignatura), grupos_deseados: form.destinos[a.codigo_asignatura],
      }))));
      cambiar(curso, prev => ({ ...prev, seleccion: {}, destinos: {} }));
      toast.success(t("user.swap_request.success"));
      await cargar();
    } catch (e) {
      toast.error(e.message);
      // Nunca reintentamos una creación: primero reconciliamos con el servidor.
      setInciertos(prev => ({ ...prev, [curso]: true }));
      try {
        await cargar();
        setInciertos(prev => ({ ...prev, [curso]: false }));
      } catch (recarga) { setError(recarga.message); }
    } finally {
      locks.current.delete(curso);
      setEnviando(prev => ({ ...prev, [curso]: false }));
    }
  };
  if (cargando) return <div className="user-loading">{t("user.swap_request.loading")}</div>;
  return <div className="page-container"><div className="content-wrap">
    <h1 className="page-title">{t("user.swap_request.title")}</h1>
    <p>Cada curso se envía por separado. Para cambiar entre solicitudes individuales y bloque, cancela las solicitudes correspondientes y vuelve a crearlas.</p>
    <Link to="/misSolicitudesPermuta">Ver mis solicitudes</Link>
    {error && <div role="alert" className="user-error">{error}<button type="button" onClick={() => cargar().then(() => setInciertos({})).catch(e => setError(e.message))}>Recargar matrícula y solicitudes</button></div>}
    {!error && cursos.length === 0 && <p>{t("user.swap_request.empty_message")}</p>}
    {cursos.map(c => {
      const form = formularios[c.curso];
      const elegidas = c.asignaturas.filter(a => form.bloque || form.seleccion[a.codigo_asignatura]);
      const activas = solicitudes.filter(s => !["CANCELADA", "RECHAZADA", "CADUCADA", "FINALIZADA"].includes(String(s.estado).toUpperCase()) &&
        (s.curso === c.curso || c.asignaturas.some(a => String(a.codigo_asignatura) === String(s.codigo_asignatura))));
      const conflicto = form.bloque && activas.length > 0;
      const invalido = !elegidas.length || elegidas.some(a => !a.actual || !a.grupos.length || !(form.destinos[a.codigo_asignatura] || []).length || activas.some(s => String(s.codigo_asignatura) === String(a.codigo_asignatura)));
      return <form key={c.curso} aria-label={c.curso} className="user-card curso-permuta" onSubmit={e => enviar(e, c.curso, form, elegidas)}>
        <h2>{c.curso}</h2>
        <fieldset disabled={enviando[c.curso]} className="solicitar-grupos-fieldset">
          <label><input type="checkbox" role="switch" checked={form.bloque} onChange={e => cambiar(c.curso, f => ({ ...f, bloque: e.target.checked }))} /> Solo quiero permutar con una persona en este curso</label>
          <p>Se permutarán juntas todas tus asignaturas matriculadas de este curso con la misma persona. Si no hay una coincidencia completa, el bloque quedará pendiente</p>
          {conflicto && <p role="alert">Ya tienes solicitudes activas en este curso. Para crear un bloque, revisa y cancela primero las solicitudes correspondientes; las permutas activas impiden cancelarlas.</p>}
          <div className="solicitar-permuta-grid">{c.asignaturas.map(a => {
            const codigo = a.codigo_asignatura;
            const seleccion = form.destinos[codigo] || [];
            const incluida = form.bloque || !!form.seleccion[codigo];
            return <article className="user-card solicitar-permuta-card" key={codigo}>
              <label><input type="checkbox" checked={incluida} disabled={form.bloque} onChange={e => cambiar(c.curso, f => ({ ...f, seleccion: { ...f.seleccion, [codigo]: e.target.checked } }))} /> {a.nombre_asignatura}</label>
              <p>Grupo actual: {a.actual ?? "Sin grupo"}</p>
              {!a.actual && <p role="alert">Debes asignar tu grupo actual de esta asignatura en tu perfil.</p>}
              {!a.grupos.length && <p role="alert">No hay destinos válidos. Revisa los grupos de esta asignatura con administración.</p>}
              {activas.some(s => String(s.codigo_asignatura) === String(codigo)) && <p>Esta asignatura ya tiene una solicitud activa. Revísala en mis solicitudes.</p>}
              <fieldset className="solicitar-grupos-fieldset" disabled={!incluida || !a.actual}>
                <legend>{t("common.desired_groups")}</legend>
                <div className="solicitar-grupos-toolbar"><button type="button" onClick={() => cambiar(c.curso, f => ({ ...f, destinos: { ...f.destinos, [codigo]: a.grupos } }))}>Seleccionar todos</button><button type="button" onClick={() => cambiar(c.curso, f => ({ ...f, destinos: { ...f.destinos, [codigo]: [] } }))}>{t("common.clear")}</button></div>
                <div className="solicitar-grupos-opciones">{a.grupos.map(g => <label key={g} className="solicitar-grupo-opcion"><input type="checkbox" checked={seleccion.includes(g)} onChange={() => cambiar(c.curso, f => ({ ...f, destinos: { ...f.destinos, [codigo]: seleccion.includes(g) ? seleccion.filter(x => x !== g) : [...seleccion, g] } }))} />{t("common.group_with_number", { group: g })}</label>)}</div>
              </fieldset>
            </article>;
          })}</div>
          <button className="btn btn-primary" type="submit" disabled={invalido || conflicto || !!error || inciertos[c.curso]}>{enviando[c.curso] ? t("common.processing") : `Enviar solicitudes de ${c.curso}`}</button>
        </fieldset>
      </form>;
    })}
  </div></div>;
}
