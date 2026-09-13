import { useCallback, useEffect, useRef, useState } from 'react';
import { obtenerNotificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas } from '../services/notificacion.js';
import { useAuth } from './useAuth';

const EVENTO = 'permutas:notificaciones-actualizadas';
const ordenar = lista => [...lista].sort((a, b) => Number(Boolean(a.leida)) - Number(Boolean(b.leida))
  || new Date(b.fecha_creacion) - new Date(a.fecha_creacion) || b.id - a.id);
const resultado = r => {
  if (r?.err || r?.error || r?.result?.err || r?.result?.error || r?.result?.result === undefined) throw new Error('Notificaciones no disponibles');
  return r?.result?.result;
};

export default function useNotificaciones() {
  const auth = useAuth();
  const usuario = auth?.user?.nombre_usuario;
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorLectura, setErrorLectura] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const version = useRef(0);
  const montado = useRef(false);
  const ocupado = useRef(false);

  const recargar = useCallback(async () => {
    const actual = ++version.current;
    try {
      const lista = resultado(await obtenerNotificaciones());
      if (!Array.isArray(lista)) throw new Error('Respuesta inválida');
      if (montado.current && actual === version.current) { setNotices(ordenar(lista)); setError(false); }
    } catch {
      if (montado.current && actual === version.current) setError(true);
    } finally {
      if (montado.current && actual === version.current) setLoading(false);
    }
  }, []);

  const invalidarConsultas = useCallback(() => { version.current++; }, []);

  useEffect(() => {
    montado.current = true;
    setNotices([]); setLoading(true); setErrorLectura(false);
    recargar();
    const actualizarVisible = () => { if (document.visibilityState !== 'hidden') recargar(); };
    const timer = window.setInterval(actualizarVisible, 30000);
    window.addEventListener(EVENTO, recargar);
    window.addEventListener('focus', actualizarVisible);
    document.addEventListener('visibilitychange', actualizarVisible);
    return () => {
      montado.current = false; invalidarConsultas();
      window.clearInterval(timer);
      window.removeEventListener(EVENTO, recargar);
      window.removeEventListener('focus', actualizarVisible);
      document.removeEventListener('visibilitychange', actualizarVisible);
    };
  }, [usuario, recargar, invalidarConsultas]);

  const guardar = async (id, leida) => {
    if (ocupado.current) return;
    ocupado.current = true; setGuardando(true); setErrorLectura(false);
    try {
      resultado(await (id === null ? marcarTodasNotificacionesLeidas() : marcarNotificacionLeida(id, leida)));
      if (montado.current) window.dispatchEvent(new Event(EVENTO));
    } catch {
      if (montado.current) setErrorLectura(true);
    } finally {
      ocupado.current = false;
      if (montado.current) setGuardando(false);
    }
  };
  return { notices, loading, error, errorLectura, guardando, recargar,
    noLeidas: notices.filter(n => !n.leida).length,
    cambiarLectura: (id, leida) => guardar(id, leida), marcarTodas: () => guardar(null, true) };
}
