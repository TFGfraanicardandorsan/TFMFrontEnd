"use client;"
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/mispermutas-style.css";
import {
  misPermutasPropuestas,
  denegarPermuta,
  validarPermuta,
  misPermutasPropuestasPorMi,
} from "../services/permuta.js";

export default function MisPermutas() {
  const [permutasPropuestas, setPermutasPropuestas] = useState([]);
  const [permutasPropuestasPorMi, setPermutasPropuestasPorMi] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarPermutasPropuestasPorMi();
    cargarPermutasPropuestas();
  }, []);

  const cargarPermutasPropuestasPorMi = async () => {
    try {
      const response = await misPermutasPropuestasPorMi();
      if (response && response.result && Array.isArray(response.result.result)) {
        setPermutasPropuestasPorMi(response.result.result);
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setError("Error al cargar los datos");
      }
      setCargando(false);
    } catch (error) {
      console.error("Error al cargar las permutas propuestas por mí:", error);
      setError("Error al cargar las permutas propuestas por mí");
      setCargando(false);
    }
  };

  const cargarPermutasPropuestas = async () => {
    try {
      const response = await misPermutasPropuestas();
      if (response && response.result && Array.isArray(response.result.result)) {
        setPermutasPropuestas(response.result.result);
      } else {
        console.error("Formato de respuesta inesperado:", response);
        setError("Error al cargar los datos");
      }
      setCargando(false);
    } catch (error) {
      console.error("Error al cargar las permutas propuestas:", error);
      setError("Error al cargar las permutas propuestas");
      setCargando(false);
    }
  };

  const handleDenegarPermuta = async (solicitudId) => {
    try {
      await denegarPermuta(solicitudId);
      setPermutasPropuestas((prev) =>
        prev.filter((permuta) => permuta.permuta_id !== solicitudId)
      );
      alert("Permuta denegada con éxito");
    } catch (error) {
      console.error("Error al denegar la permuta:", error);
      alert("Error al denegar la permuta");
    }
  };

  const handleAceptarPermuta = async (solicitudId) => {
    try {
      await validarPermuta(solicitudId);
      setPermutasPropuestas((prev) =>
        prev.filter((permuta) => permuta.permuta_id !== solicitudId)
      );
      alert("Permuta aceptada con éxito");
    } catch (error) {
      console.error("Error al aceptar la permuta:", error);
      alert("Error al aceptar la permuta");
    }
  };

  if (cargando) {
    return <div>Cargando permutas...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
    <br />
    <br />
    <h1 className="mispermutas-title">Mis Permutas</h1>
    <p className="mispermutas-subtitle">
      Aquí puedes ver las permutas que has propuesto y las que te han propuesto.
      <br />
      Puedes aceptar o denegar las permutas propuestas por otros usuarios.
      <br />
      También puedes ver las permutas que has propuesto tú mismo.
      </p>
    <div className="mispermutas-container">
      <div className="mispermutas-columns">
        <div className="mispermutascol">
          <h2>Permutas propuestas por mí</h2>
          {permutasPropuestasPorMi.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
            >
              {permutasPropuestasPorMi.map((permuta) => (
                <SwiperSlide key={permuta.permuta_id}>
                  <div className="mispermuta-card">
                    <div className="mispermuta-info">
                      <p><strong>Estado:</strong> {permuta.estado}</p>
                      <p><strong>Grupo Solicitante:</strong> {permuta.grupo_solicitante}</p>
                      <p><strong>Grupo Solicitado:</strong> {permuta.grupo_solicitado}</p>
                      <p><strong>Código Asignatura:</strong> {permuta.codigo_asignatura}</p>
                      <p><strong>Nombre Asignatura:</strong> {permuta.nombre_asignatura}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p>No has propuesto ninguna permuta</p>
          )}
        </div>

        <div className="mispermutascol">
          <h2>Permutas propuestas</h2>
          {permutasPropuestas.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
            >
              {permutasPropuestas.map((permuta) => (
                <SwiperSlide key={permuta.permuta_id}>
                  <div className="mispermuta-card">
                    <div className="mispermuta-info">
                      <p><strong>Estado:</strong> {permuta.estado}</p>
                      <p><strong>Grupo Solicitante:</strong> {permuta.grupo_solicitante}</p>
                      <p><strong>Grupo Solicitado:</strong> {permuta.grupo_solicitado}</p>
                      <p><strong>Código Asignatura:</strong> {permuta.codigo_asignatura}</p>
                      <p><strong>Nombre Asignatura:</strong> {permuta.nombre_asignatura}</p>
                    </div>
                    <button
                      className="denegar-btn"
                      onClick={() => handleDenegarPermuta(permuta.permuta_id)}
                    >
                      Denegar Permuta
                    </button>
                    <button
                      className="aceptar-btn"
                      onClick={() => handleAceptarPermuta(permuta.permuta_id)}
                    >
                      Aceptar Permuta
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p>No hay permutas disponibles</p>
          )}
        </div>
      </div>
    </div>
    <br />
    <br />
    </>
  );
}
