import React, { useState } from "react";
import "../styles/misIncidencias-style.css";
import Footer from "./footer";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";

export default function misIncidencias(){
    const navigate = useNavigate(); // 🔹 Inicializa navigate aquí
    const incidenciasPrueba = [
        {
          id: "I234920",
          tipo: "Dato erróneo",
          estado: "En curso",
          comentario: "Por un error he solicitado una permuta de la asignatura ISSII 1 para los grupos 1 y 2 y quería solicitarla de los grupos 2 y 3, ¿podríais cambiarla?"
        },
        {
          id: "I23852",
          tipo: "Error del sistema",
          estado: "En curso",
          comentario: "No me deja subir el fichero firmado."
        },
        {
          id: "I241761",
          tipo: "Dato erróneo",
          estado: "En curso",
          comentario: "Me he equivocado al seleccionar el grado, ¿podrías cambiarlo a TI?"
        },
        {
          id: "I251621",
          tipo: "Dato erróneo",
          estado: "En curso",
          comentario: "Me he cambiado de grado, ¿puedes cambiarlo a Computadores?"
        }
      ];
    return (
        <>
        <Navbar/>
        <div className="container">
      <div className="header">
        <h1>Mis Incidencias</h1>
        <div className="button-container">
        <button onClick={() => navigate("/reportarIncidencia")} className="open-button">
          Abrir incidencia
        </button>
        </div>

      </div>
      <div className="incidencias-container">
        {incidenciasPrueba.map((incidencia) => (
          <div key={incidencia.id} className="incidencia-card">
            <p><strong>Incidencia:</strong> {incidencia.id}</p>
            <p><strong>Tipo de Incidencia:</strong> {incidencia.tipo}</p>
            <p><strong>Estado:</strong> {incidencia.estado}</p>
            <p><strong>Comentario:</strong> {incidencia.comentario}</p>
          </div>
        ))}
      </div>
    </div>
          <Footer/>
        </>
      )
    }





