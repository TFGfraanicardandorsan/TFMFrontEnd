import { useEffect, useState } from "react";
//import { Select, Label } from "@/components/ui/select";
//import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

 export default function SeleccionGrupos() {
//     const [asignaturasGrupos, setAsignaturasGrupos] = useState({});
//     const [selecciones, setSelecciones] = useState({});

//     useEffect(() => {
//         obtenerTodosGruposMisAsignaturasUsuario()
//             .then(res => res.json())
//             .then(data => {
//                 const agrupado = {};
//                 data.forEach(({ nombre, id, grupo }) => {
//                     if (!agrupado[id]) {
//                         agrupado[id] = { nombre, grupos: [] };
//                     }
//                     agrupado[id].grupos.push(grupo);
//                 });
//                 setAsignaturasGrupos(agrupado);
//             });
//     }, []);

//     const handleSeleccion = (asignaturaId, grupoId) => {
//         setSelecciones(prev => ({ ...prev, [asignaturaId]: grupoId }));
//     };

    return (
        <div className="space-y-4">
            {/* {Object.entries(asignaturasGrupos).map(([id, { nombre, grupos }]) => (
                <Card key={id}>
                    <CardHeader>
                        <CardTitle>{nombre}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor={`grupo-${id}`}>Selecciona un grupo:</Label>
                        <Select
                            id={`grupo-${id}`}
                            onChange={(e) => handleSeleccion(id, e.target.value)}
                            value={selecciones[id] || ""}
                        >
                            <option value="" disabled>Seleccione un grupo</option>
                            {grupos.map(grupo => (
                                <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                            ))}
                        </Select>
                    </CardContent>
                </Card>
            ))} */}
        </div>
    );
}
