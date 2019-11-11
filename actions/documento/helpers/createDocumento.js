const exactMath = require("exact-math");
var TipoCedula = require("../../../apiHelpers/hacienda/tipoCedula");
var moment = require("moment-timezone");

module.exports = (base, consecutivos, config) => {
  var consecutivo = consecutivos.consecutivoFactura;
  var casaMatriz = "1".pad(3);
  var terminalVenta = "1".pad(5);
  var tipoDocumento = "1".pad(2);
  var location = config.ubicacion.split(",");
  var fullConsecutivo = casaMatriz + terminalVenta + tipoDocumento + consecutivo.pad(10);

  var cedula = config.cedula.pad(12);
  var diamesano = moment().format("DDMMYY");
  var situacion = "1";
  var codigoSecreto = "12345678";
  var fechaYa = moment()
    .tz("America/Costa_Rica")
    .format(); //2018-05-24T07:01:42.539375-06:00

  var clave = "506" + diamesano + cedula + fullConsecutivo + situacion + codigoSecreto;

  var ubicacion = config.ubicacion.split(",");

  let documento = {
    codigoActividad: config.codigoActividad,
    consecutivo: fullConsecutivo,
    name: fullConsecutivo,
    clave: clave,
    fecha: moment().format("YYYY-MM-DD"),
    fechaISO: fechaYa,
    emisor: JSON.stringify({
      Nombre: config.name,
      Identificacion: {
        Tipo: TipoCedula(config.cedula),
        Numero: config.cedula
      },
      Ubicacion: {
        Provincia: ubicacion[0],
        Canton: ubicacion[1],
        Distrito: ubicacion[2],
        Barrio: "01",
        OtrasSenas: "Costa Rica"
      },
      Telefono: {
        CodigoPais: "506",
        NumTelefono: config.telefono
      },
      CorreoElectronico: config.cedula + "@efactura.io"
    }),
    receptor: !base.cedula
      ? null
      : JSON.stringify({
          Nombre: base.clienteName,
          Identificacion: {
            Tipo: TipoCedula(base.cedula, base.tipoCedula),
            Numero: base.cedula
          }
        }),
    plazo: base.plazo,
    estado: "por firmar",
    medioPago: base.plazo == 0 ? "01" : "04",
    condicionVenta: base.plazo == 0 ? "01" : "02",
    moneda: base.moneda || "CRC",
    tipoCambio: base.tipoCambio || 1,
    normativa: JSON.stringify({
      NumeroResolucion: "DGT-R-48-2016",
      FechaResolucion: "20-02-2017 13:22:22"
    }),
    tipo: base.tipo,
    descripcion: base.descripcion || "",
    ordenId: base.ordenId,
    clienteId: base.clienteId,
    resumen: base.resumen || "",
    fromOrden: base.ordenId ? true : false,
    vendedorId: base.vendedorId,
    ownerId: base.ownerId,
    transporteId: base.transporteId,
    documentoTags: base.ordenTags || ""
  };

  return documento;
};
