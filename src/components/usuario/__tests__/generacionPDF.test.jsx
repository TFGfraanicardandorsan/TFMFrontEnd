// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
import i18n from "../../../i18n.js";

const mocks = vi.hoisted(() => ({
  listarPermutas: vi.fn(),
  verListaPermutas: vi.fn(),
  obtenerPlantillaPermuta: vi.fn(),
  subidaArchivo: vi.fn(),
  servirArchivo: vi.fn(),
  firmarPermuta: vi.fn(),
  aceptarPermuta: vi.fn(),
  signPdfDocuments: vi.fn(),
  navigate: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("../../../services/permuta.js", () => ({
  listarPermutas: mocks.listarPermutas,
  verListaPermutas: mocks.verListaPermutas,
  firmarPermuta: mocks.firmarPermuta,
  aceptarPermuta: mocks.aceptarPermuta,
  validarSolicitudPermuta: vi.fn(),
}));

vi.mock("../../../services/subidaArchivos.js", () => ({
  obtenerPlantillaPermuta: mocks.obtenerPlantillaPermuta,
  subidaArchivo: mocks.subidaArchivo,
  servirArchivo: mocks.servirArchivo,
}));

vi.mock("../../../services/autofirma.js", () => ({
  getPermutaSignatureParams: (signerNumber) => `params-${signerNumber}`,
  signPdfDocuments: mocks.signPdfDocuments,
}));

vi.mock("../../../lib/logger.js", () => ({
  logError: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useLocation: () => ({ state: { IdsPermuta: [10] } }),
  };
});

vi.mock("react-toastify", () => ({
  toast: {
    error: mocks.toastError,
    warning: vi.fn(),
    success: mocks.toastSuccess,
  },
}));

import GeneracionPDF from "../generacionPDF.jsx";

const grupoConHistorico = {
  usuarios: [
    { nombre_completo: "Alumno Uno", uvus: "alumno1", estudio: "GII-IS" },
    { nombre_completo: "Alumno Dos", uvus: "alumno2", estudio: "GII-IS" },
  ],
  permutas: [
    { permuta_id: 10, nombre_asignatura: "Actual", codigo_asignatura: 100 },
    { permuta_id: 11, nombre_asignatura: "Histórica", codigo_asignatura: 200 },
  ],
};

describe("GeneracionPDF - carga del documento", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("es");
    mocks.verListaPermutas.mockResolvedValue({
      err: false,
      result: { err: false, result: [grupoConHistorico] },
    });
    mocks.listarPermutas.mockResolvedValue({
      err: false,
      result: { error: false, result: [{ id: 42, estado: "BORRADOR", archivo: null }] },
    });
    mocks.subidaArchivo.mockResolvedValue({
      err: false,
      result: { message: "Archivo subido", fileId: "12345678-1234-1234-1234-123456789abc.pdf" },
    });
    mocks.firmarPermuta.mockResolvedValue({
      err: false,
      result: { err: false, result: "Firmada" },
    });
    mocks.aceptarPermuta.mockResolvedValue({
      err: false,
      result: { err: false, result: "Aceptada" },
    });
    mocks.signPdfDocuments.mockResolvedValue([{
      filename: "solicitud-permutas.pdf",
      pdfBase64: btoa("%PDF-1.7\nfirmado"),
    }]);
    URL.createObjectURL = vi.fn(() => "blob:permuta");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(cleanup);

  it("consulta únicamente los IDs seleccionados aunque la pareja tenga históricos", async () => {
    render(<GeneracionPDF />);

    await waitFor(() => expect(mocks.listarPermutas).toHaveBeenCalledWith([10]));
    expect(screen.getByRole("button", { name: "Visualizar" })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("bloquea la generación y muestra el fallo de carga del backend", async () => {
    mocks.listarPermutas.mockResolvedValue({
      err: true,
      errmsg: "Las permutas no pertenecen al mismo documento",
    });

    render(<GeneracionPDF />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Las permutas no pertenecen al mismo documento"
    );
    expect(screen.getByRole("button", { name: "Visualizar" })).toBeDisabled();
    expect(mocks.toastError).toHaveBeenCalled();
  });

  it("admite una plantilla que renombra GII-IS como GII_IS", async () => {
    const documento = await PDFDocument.create();
    documento.addPage();
    const formulario = documento.getForm();
    formulario.createCheckBox("GII_IS");
    [
      "DAY", "MONTH", "YEAR",
      "ASIGNATURA1-1", "ASIGNATURA2-1", "COD1-1", "COD2-1",
      "DNI1", "LETRA1", "NOMBRE1", "DOMICILIO1", "POBLACION1",
      "COD-POSTAL1", "PROVINCIA1", "TELEFONO1",
    ].forEach((nombre) => formulario.createTextField(nombre));
    mocks.obtenerPlantillaPermuta.mockResolvedValue(await documento.save());

    const { container } = render(<GeneracionPDF />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Visualizar" })).toBeEnabled());

    const campos = container.querySelectorAll('input[type="text"]');
    ["12345678", "A", "Calle Prueba", "Sevilla", "41001", "Sevilla", "600123123"]
      .forEach((valor, index) => fireEvent.change(campos[index], { target: { value: valor } }));
    fireEvent.click(screen.getByRole("button", { name: "Visualizar" }));

    expect(await screen.findByTitle("Vista previa del PDF")).toHaveAttribute(
      "src",
      "blob:permuta"
    );
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("rellena los nombres automáticos de la plantilla oficial 2026-27", async () => {
    const documento = await PDFDocument.create();
    documento.addPage();
    const formulario = documento.getForm();
    ["Check Box1", "Check Box5", "Check Box6", "Check Box7"].forEach(
      (nombre) => formulario.createCheckBox(nombre)
    );
    [
      "Text2", "Text3", "Text4", "Text8", "Text9", "Text10", "Text11", "Text12",
      "Text13", "Text32", "Text44", "Text56",
      "Text71", "Text72", "Text73",
    ].forEach((nombre) => formulario.createTextField(nombre));
    mocks.obtenerPlantillaPermuta.mockResolvedValue(await documento.save());

    const { container } = render(<GeneracionPDF />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Visualizar" })).toBeEnabled());

    const campos = container.querySelectorAll('input[type="text"]');
    ["12345678", "A", "Calle Prueba", "Sevilla", "41001", "Sevilla", "600123123"]
      .forEach((valor, index) => fireEvent.change(campos[index], { target: { value: valor } }));
    fireEvent.click(screen.getByRole("button", { name: "Visualizar" }));

    expect(await screen.findByTitle("Vista previa del PDF")).toHaveAttribute(
      "src",
      "blob:permuta"
    );
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("firma la solicitud con AutoFirma, sube el PDF y registra la primera firma", async () => {
    const documento = await PDFDocument.create();
    documento.addPage();
    const formulario = documento.getForm();
    formulario.createCheckBox("GII_IS");
    [
      "DAY", "MONTH", "YEAR",
      "ASIGNATURA1-1", "ASIGNATURA2-1", "COD1-1", "COD2-1",
      "DNI1", "LETRA1", "NOMBRE1", "DOMICILIO1", "POBLACION1",
      "COD-POSTAL1", "PROVINCIA1", "TELEFONO1",
    ].forEach((nombre) => formulario.createTextField(nombre));
    mocks.obtenerPlantillaPermuta.mockResolvedValue(await documento.save());

    const { container } = render(<GeneracionPDF />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Firmar con AutoFirma y enviar" })).toBeEnabled());

    const campos = container.querySelectorAll('input[type="text"]');
    ["12345678", "A", "Calle Prueba", "Sevilla", "41001", "Sevilla", "600123123"]
      .forEach((valor, index) => fireEvent.change(campos[index], { target: { value: valor } }));
    fireEvent.click(screen.getByRole("button", { name: "Firmar con AutoFirma y enviar" }));

    await waitFor(() => expect(mocks.firmarPermuta).toHaveBeenCalledWith(
      "12345678-1234-1234-1234-123456789abc.pdf",
      42,
    ));
    expect(mocks.signPdfDocuments).toHaveBeenCalledWith(
      [expect.objectContaining({
        filename: "solicitud-permutas.pdf",
        pdfBase64: expect.stringMatching(/^JVBER/),
      })],
      null,
      { signatureParams: "params-1" },
    );
    const formData = mocks.subidaArchivo.mock.calls[0][0];
    expect(formData.get("tipo")).toBe("buzon");
    expect(formData.get("file")).toEqual(expect.objectContaining({
      name: "solicitud-permutas-firmada.pdf",
      type: "application/pdf",
    }));
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "La solicitud se ha firmado y enviado correctamente.",
    );
    expect(mocks.navigate).toHaveBeenCalledWith("/permutasAceptadas");
  });

  it("usa el segundo recuadro y acepta la solicitud al firmar el segundo estudiante", async () => {
    const documento = await PDFDocument.create();
    documento.addPage();
    const formulario = documento.getForm();
    formulario.createCheckBox("GII_IS");
    [
      "DAY", "MONTH", "YEAR",
      "ASIGNATURA1-1", "ASIGNATURA2-1", "COD1-1", "COD2-1",
      "DNI1", "LETRA1", "NOMBRE1", "DOMICILIO1", "POBLACION1",
      "COD-POSTAL1", "PROVINCIA1", "TELEFONO1",
      "DNI2", "LETRA2", "NOMBRE2", "DOMICILIO2", "POBLACION2",
      "COD-POSTAL2", "PROVINCIA2", "TELEFONO2",
    ].forEach((nombre) => formulario.createTextField(nombre));
    const existingBytes = await documento.save();
    mocks.listarPermutas.mockResolvedValue({
      err: false,
      result: {
        error: false,
        result: [{
          id: 42,
          estado: "FIRMADA",
          archivo: "firma-primero.pdf",
        }],
      },
    });
    mocks.servirArchivo.mockResolvedValue(existingBytes);

    const { container } = render(<GeneracionPDF />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Firmar con AutoFirma y enviar" })).toBeEnabled());

    const campos = container.querySelectorAll('input[type="text"]');
    ["87654321", "B", "Calle Segunda", "Sevilla", "41002", "Sevilla", "611123123"]
      .forEach((valor, index) => fireEvent.change(campos[index], { target: { value: valor } }));
    fireEvent.click(screen.getByRole("button", { name: "Firmar con AutoFirma y enviar" }));

    await waitFor(() => expect(mocks.aceptarPermuta).toHaveBeenCalledWith(
      "12345678-1234-1234-1234-123456789abc.pdf",
      42,
    ));
    expect(mocks.signPdfDocuments).toHaveBeenCalledWith(
      [expect.objectContaining({ filename: "solicitud-permutas.pdf" })],
      null,
      { signatureParams: "params-2" },
    );
    expect(mocks.firmarPermuta).not.toHaveBeenCalled();
  });
});
