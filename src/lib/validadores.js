export const validarDNI = (value) => {
  const dniRegex = /^[0-9]{8}$/;
  if (!value) return "El DNI es obligatorio";
  if (!dniRegex.test(value)) return "El DNI debe tener 8 números";
  return "";
};
export const validarLetraDNI = (value) => {
  const letraRegex = /^[A-Z]$/;
  if (!value) return "La letra es obligatoria";
  if (!letraRegex.test(value)) return "Debe ser una letra mayúscula";
  return "";
};

export const validarNIF = (value) => {
  const nif = value.trim().toUpperCase();
  if (!nif) return "El NIF es obligatorio";
  if (!/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(nif)) {
    return "El NIF debe tener una letra, 7 números y un carácter de control";
  }

  const sumaPares = [2, 4, 6].reduce(
    (total, posicion) => total + Number(nif[posicion]),
    0
  );
  const sumaImpares = [1, 3, 5, 7].reduce((total, posicion) => {
    const doble = Number(nif[posicion]) * 2;
    return total + Math.floor(doble / 10) + (doble % 10);
  }, 0);
  const digitoControl = (10 - ((sumaPares + sumaImpares) % 10)) % 10;
  const letraControl = "JABCDEFGHI"[digitoControl];
  const control = nif[8];
  const inicial = nif[0];
  const requiereLetra = "KPQRSNW".includes(inicial);
  const requiereDigito = "ABEH".includes(inicial);

  if (
    (requiereLetra && control !== letraControl) ||
    (requiereDigito && control !== String(digitoControl)) ||
    (!requiereLetra &&
      !requiereDigito &&
      control !== letraControl &&
      control !== String(digitoControl))
  ) {
    return "El carácter de control del NIF no es válido";
  }

  return "";
};
export const validarCodigoPostal = (value) => {
  const cpRegex = /^[0-9]{5}$/;
  if (!value) return "El código postal es obligatorio";
  if (!cpRegex.test(value)) return "El código postal debe tener 5 números";
  return "";
};

export const validarTelefono = (value) => {
  const telefonoRegex = /^[0-9]{9}$/;
  if (!value) return "El teléfono es obligatorio";
  if (!telefonoRegex.test(value)) return "El teléfono debe tener 9 números";
  return "";
};

export const validarCampoObligatorio = (value, campo) => {
  if (!value.trim()) return `El campo ${campo} es obligatorio`;
  return "";
};
