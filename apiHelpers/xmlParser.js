var parseString = require("xml2js").parseString;

var moment = require("moment-timezone");

function Parser() {}

Parser.facturaProveedor = function(body) {
  return new Promise((resolve, reject) => {
    parseString(body.file, { explicitArray: false }, (err, data) => {
      if (err) reject(err);
      else {
        if (data.FacturaElectronica) {
          var clave = getValue(data, "FacturaElectronica", "Clave");
          var fechaEmision = moment(getValue(data, "FacturaElectronica", "FechaEmision")).format(
            "YYYY-MM-DDTHH:MM:SS"
          );
          var proveedor = getEmpresaValue(data, "FacturaElectronica", "Emisor");
          var receptor = getEmpresaValue(data, "FacturaElectronica", "Receptor");
          var totales = getTotalesValue(data, "FacturaElectronica");
          var consecutivo = getValue(data, "FacturaElectronica", "NumeroConsecutivo");
        }
        var result = {
          consecutivo: consecutivo,
          clave: clave,
          fechaEmision: fechaEmision,
          proveedor: proveedor,
          receptor: receptor,
          totales: totales
        };

        if (result.totales.moneda != "CRC") {
          //  result.totales.moneda = "CRC";
          // result.totales.subtotal = result.totales.subtotal * result.totales.tipoCambio
          // result.totales.subtotalDescuento = result.totales.subtotalDescuento * result.totales.tipoCambio
          // result.totales.descuento = result.totales.descuento * result.totales.tipoCambio
          // result.totales.total = result.totales.total * result.totales.tipoCambio
          // result.totales.excento = result.totales.excento * result.totales.tipoCambio
          // result.totales.gravado = result.totales.gravado * result.totales.tipoCambio
          // result.totales.impuesto = result.totales.impuesto * result.totales.tipoCambio
        }
        resolve(result);
      }
    });
  });
};

function getEmpresaValue(data, documentType, companyType) {
  var value = {
    nombre: "",
    email: "",
    telefono: "",
    cedula: { tipo: "", numero: "" },
    ubicacion: { provincia: "", canton: "", distrito: "", senas: "" }
  };
  var company = data[documentType][companyType];

  if (company) value.nombre = company.Nombre.toLowerCase();
  if (company.Identificacion)
    value.cedula = { tipo: company.Identificacion.Tipo, numero: company.Identificacion.Numero };

  if (company.Telefono) value.telefono = `+${company.Telefono.CodigoPais}${company.Telefono.NumTelefono}`;
  value.email = company.CorreoElectronico;

  if (company.Ubicacion)
    value.ubicacion = {
      provincia: company.Ubicacion.Provincia,
      canton: company.Ubicacion.Canton,
      distrito: company.Ubicacion.Distrito,
      senas: company.Ubicacion.OtrasSenas
    };
  return value;
}

function getTotalesValue(data, documentType) {
  var value = {
    moneda: data[documentType].ResumenFactura.CodigoMoneda,
    tipoCambio: parseFloat(data[documentType].ResumenFactura.TipoCambio || 1.0),
    subtotal: parseFloat(data[documentType].ResumenFactura.TotalVenta || 0),
    subtotalDescuento: parseFloat(data[documentType].ResumenFactura.TotalVentaNeta || 0),
    descuento: parseFloat(data[documentType].ResumenFactura.TotalDescuentos || 0),
    total: parseFloat(data[documentType].ResumenFactura.TotalComprobante || 0),
    excento: parseFloat(data[documentType].ResumenFactura.TotalExento || 0),
    gravado: parseFloat(data[documentType].ResumenFactura.TotalGravado || 0),
    impuesto: parseFloat(data[documentType].ResumenFactura.TotalImpuesto || 0)
  };
  return value;
}

function getValue(data, documentType, value) {
  return data[documentType][value];
}

module.exports = Parser;
