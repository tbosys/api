var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var Parser = require("../../apiHelpers/xmlParser");
var InvokeReceive = require("../../apiHelpers/invokeReceive");

let AWS = require("aws-sdk");
var s3 = new AWS.S3();
var moment = require("moment");
var moment = require("moment-timezone");
var parseString = require("xml2js").parseString;
var BUCKET = "facturas.efactura.io";
var request = require("superagent");

module.exports = class FacturaImportAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;

    return this.importar(table, body);
  }

  //emisor,
  //clave
  async importar(table, body) {
    var id = this.enforceSingleId(body);

    var registroId = id;

    var createGasto = this.getActionInstanceFor("gasto", "create");
    var updateGasto = this.getActionInstanceFor("gasto", "update");
    var createProveedor = this.getActionInstanceFor("proveedor", "create");

    var registro = await this.knex
      .table("registroRecibido")
      .where("id", registroId)
      .first();
    await this.knex
      .table("registroRecibido")
      .update("estado", "archivado")
      .where("id", registroId);

    var firma = this.context.config;

    var gasto = await this.knex
      .table("gasto")
      .where("clave", registro.clave)
      .first();

    if (!gasto)
      gasto = await createGasto.execute("gasto", {
        clave: registro.clave || "",
        emailId: registro.emailId,
        estado: "por completar",
        descripcion: registro.from,
        referencia: registro.clave || "",
        registroRecibidoId: registro.id
      });

    gasto = await this.knex
      .table("gasto")
      .where("id", gasto.id)
      .first();
    estado: "por completar";

    if (!gasto.linkFacturaXml && registro.xml) gasto.linkFacturaXml = registro.xml;
    if (!gasto.linkFactura && registro.pdf) gasto.linkFactura = registro.pdf;
    if (!gasto.linkRespuesta && registro.respuestaXml) gasto.linkRespuesta = registro.respuestaXml;

    if (gasto.linkRespuesta) {
      var mensajeXmlRaw = await Receive.downloadFile(gasto.linkRespuesta);
      var mensajeXml = await Receive.transformXML(mensajeXmlRaw);
      var cedulaEmisor = mensajeXml.MENSAJEHACIENDA.NUMEROCEDULAEMISOR;
      var nombreEmisor = mensajeXml.MENSAJEHACIENDA.NOMBREEMISOR;

      var proveedor = await this.knex
        .table("proveedor")
        .select(["id"])
        .where({ cedula: cedulaEmisor })
        .first();
      if (!proveedor)
        proveedor = await createProveedor.execute("proveedor", { name: nombreEmisor, cedula: cedulaEmisor });
      gasto.total = parseFloat(mensajeXml.MENSAJEHACIENDA.TOTALFACTURA);
      gasto.proveedorId = proveedor.id;
    }

    if (gasto.linkFacturaXml) {
      var xmlRaw = await Receive.downloadFile(gasto.linkFacturaXml);
      var xml = await Receive.transformXML(xmlRaw);

      var mainKey = Object.keys(xml)[0];

      var tipo = "FA";
      if (mainKey == "NotaCreditoElectronica") tipo = "NC";
      if (mainKey == "NotaDebitoElectronica") tipo = "ND";

      var xmlInternal = xml[mainKey];

      var emisor = xmlInternal.EMISOR || { IDENTIFICACION: {} };
      var receptor = xmlInternal.RECEPTOR || { IDENTIFICACION: {} };
      var resumenFactura = xmlInternal.RESUMENFACTURA || {};

      var proveedor = { id: null };
      if (emisor && emisor.IDENTIFICACION && emisor.IDENTIFICACION.TIPO && emisor.IDENTIFICACION.NUMERO) {
        var proveedor = await this.knex
          .table("proveedor")
          .select(["id"])
          .where({ cedula: emisor.IDENTIFICACION.NUMERO })
          .first();
        if (!proveedor)
          proveedor = await createProveedor.execute("proveedor", {
            name: emisor.NOMBRE,
            cedula: emisor.IDENTIFICACION.NUMERO
          });
      }
      if (
        resumenFactura.CODIGOMONEDA == "USD" &&
        (!resumenFactura.TIPOCAMBIO || resumenFactura.TIPOCAMBIO == "1" || resumenFactura.TIPOCAMBIO == 1)
      )
        resumenFactura.TIPOCAMBIO = await Receive.getTipoCambio(xmlInternal.FECHAEMISION);

      gasto.tipo = tipo;
      gasto.fecha = moment().format("YYYY-MM-DD");
      gasto.consecutivo = xmlInternal.CONSECUTIVO;

      if (resumenFactura) {
        gasto.moneda = resumenFactura.CODIGOMONEDA;
        gasto.tipoCambio = parseFloat(resumenFactura.TIPOCAMBIO || 1);
        gasto.subTotal = parseFloat(resumenFactura.TOTALCOMPROBANTE || 0);
        gasto.impuesto = parseFloat(resumenFactura.TOTALIMPUESTO || 0);
        gasto.descuento = parseFloat(resumenFactura.TOTALDESCUENTOS || 0);
        gasto.total = parseFloat(resumenFactura.TOTALCOMPROBANTE || 0);
        gasto.saldo = parseFloat(resumenFactura.TOTALCOMPROBANTE || 0);
        gasto.resumenFactura = JSON.stringify(resumenFactura);
        gasto.subTotalConDescuento = parseFloat(resumenFactura.TOTALVENTA || 0);
      }
      gasto.proveedorId = proveedor.id;
      gasto.descripcion = "";
      gasto.asignacion = "";
      gasto.registrarImpuesto = false;
      gasto.consecutivo = xmlInternal.CONSECUTIVO;
      gasto.emisor = JSON.stringify(xmlInternal.EMISOR);
      gasto.detalleServicio = JSON.stringify(xmlInternal.DETALLESERVICIO);
      gasto.receptor = JSON.stringify(xmlInternal.RECEPTOR);
      gasto.estado = "por enviar";

      if (
        !receptor.IDENTIFICACION ||
        !receptor.IDENTIFICACION.TIPO ||
        receptor.IDENTIFICACION.NUMERO.indexOf(firma.cedula) == -1
      ) {
        gasto.estado = "por corregir";
        gasto.descripcion = "El receptor no coincide con el esta empresa";
      } else if (!emisor.IDENTIFICACION || !emisor.IDENTIFICACION.TIPO || !emisor.IDENTIFICACION.NUMERO) {
        gasto.estado = "por corregir";
        gasto.descripcion = "No se tienen todos los datos del emisor";
      } else {
        gasto.mensajeEnviadoXml = JSON.stringify({
          payload: {
            clave: xmlInternal.CLAVE,
            fecha: moment().format(),
            emisor: {
              tipoIdentificacion: emisor.IDENTIFICACION.TIPO,
              numeroIdentificacion: emisor.IDENTIFICACION.NUMERO
            },
            receptor: {
              tipoIdentificacion: receptor.IDENTIFICACION.TIPO,
              numeroIdentificacion: receptor.IDENTIFICACION.NUMERO
            }
          },
          xml: {
            Clave: xmlInternal.CLAVE,
            NumeroCedulaEmisor: emisor.IDENTIFICACION.NUMERO,
            FechaEmisionDoc: moment()
              .tz("America/Costa_Rica")
              .format(),
            Mensaje: "1",
            DetalleMensaje: "",
            MontoTotalImpuesto: parseFloat(resumenFactura.TOTALIMPUESTO || 0),
            TotalFactura: parseFloat(resumenFactura.TOTALCOMPROBANTE || 0),
            NumeroCedulaReceptor: receptor.IDENTIFICACION.NUMERO
          }
        });
      }
    }

    var keys = Object.keys(gasto);
    keys.forEach(key => {
      if (gasto[key] == null) delete gasto[key];
    });

    await updateGasto.execute("gasto", gasto);

    if (
      gasto.mensajeEnviadoXml &&
      gasto.linkFacturaXml &&
      gasto.linkRespuesta &&
      process.env.NODE_ENV != "development"
    )
      await InvokeReceive({
        account: body.account || this.user.account,
        emailId: registro.emailId,
        mensajePayload: JSON.parse(gasto.mensajeEnviadoXml).payload,
        mensajeReceptor: JSON.parse(gasto.mensajeEnviadoXml).xml,
        gastoId: gasto.id
      });

    return gasto;
  }
};

var Receive = {};
Receive.transformXML = file => {
  return new Promise((resolve, reject) => {
    content = file.toString().replace("\ufeff", "");
    parseString(content, { explicitArray: false, trim: true, strict: false }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

Receive.byDate = {};
Receive.getTipoCambio = async date => {
  var formattedDate = moment(date).format("YYYY-MM-DD");
  if (Receive.byDate[formattedDate]) return Receive.byDate[formattedDate];

  var url = `http://free.currencyconverterapi.com/api/v5/convert?q=USD_CRC&compact=y&date=${formattedDate}`;
  var response = await request.get(url);
  Receive.byDate[formattedDate] = response.body.USD_CRC.val[formattedDate];
  return response.body.USD_CRC.val[formattedDate];
};

Receive.downloadFile = async key => {
  return s3
    .getObject({
      Bucket: BUCKET,
      Key: key
    })
    .promise()
    .then(response => {
      return response.Body;
    });
};

Receive.parseDocumentos = xmlFiles => {
  var mensaje = {};

  xmlFiles.forEach(xmlFile => {
    if (!xmlFile.xml) return;
    try {
      var mainKey = Object.keys(xmlFile.xml)[0];
      if (
        mainKey == "FACTURAELECTRONICA" ||
        mainKey == "NOTACREDITOELECTRONICA" ||
        mainKey == "NOTADEBITOELECTRONICA"
      ) {
        var xml = xmlFile.xml[mainKey];
        mensaje = {
          Clave: xml.CLAVE,
          NumeroCedulaEmisor: xml.EMISOR.IDENTIFICACION.NUMERO,
          FechaEmisionDoc: moment()
            .tz("America/Costa_Rica")
            .format(),
          Mensaje: "1",
          DetalleMensaje: "",
          MontoTotalImpuesto: parseFloat(xml.RESUMENFACTURA.TOTALIMPUESTO || 0),
          TotalFactura: parseFloat(xml.RESUMENFACTURA.TOTALCOMPROBANTE || 0),
          NumeroCedulaReceptor: xml.RECEPTOR.IDENTIFICACION.NUMERO,
          extra: {
            emisor: xml.EMISOR,
            receptor: xml.RECEPTOR
          }
        };
      }
    } catch (e) {
      console.log(e);
    }
  });
  return mensaje;
};

exports.handler = Receive;
