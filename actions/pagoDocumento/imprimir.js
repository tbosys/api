const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var fs = require("fs");
var https = require("https");
var Handlebars = require("handlebars");
var mjml2html = require("mjml").default;
let AWS = require("aws-sdk");
var numeral = require("numeral");

var s3 = new AWS.S3();

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    var id = this.enforceSingleId(body);

    var recibo = await this.knex
      .table(table)
      .select(["pagoDocumento.*", "cliente.name", "cliente.cedula"])
      .where("pagoDocumento.id", id)
      .innerJoin("cliente", "cliente.id", "pagoDocumento.clienteId")
      .first();

    var lineas = await this.knex
      .table("lineaPagoDocumento")
      .select(["lineaPagoDocumento.*", "documento.consecutivo as documentoConsecutivo"])
      .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId")
      .where("pagoDocumentoId", id);

    var firma = this.context.config;

    recibo.emisor = {
      nombre: firma.name,
      cedula: firma.cedula
    };

    var cedulaS3 = `${firma.cedula}_${process.env.NODE_ENV}`;

    var template = Handlebars.compile(fs.readFileSync("./actions/pagoDocumento/print.mjml", "utf-8"));
    recibo.monto = numeral(recibo.monto).format("0,0.00");
    lineas.forEach(linea => {
      linea.monto = numeral(linea.monto).format("0,0.00");
    });

    var html = template({ ...recibo, lineas: lineas });

    const htmlOutput = mjml2html(html, {});

    var key = `recibos/${cedulaS3}/${recibo.id}.html`;

    await s3
      .putObject({
        ACL: "public-read",
        Bucket: "facturas.efactura.io",
        Key: key,
        ContentType: "text/html",
        Body: htmlOutput.html
      })
      .promise()
      .catch(e => {
        console.log(e, e.name, e.message);
        console.log(e);
        throw new Errors.SERVER_ERROR("Error guardando archivo impreso en S3.");
      });

    return { url: `http://facturas.efactura.io/${key}` };
  }
};
