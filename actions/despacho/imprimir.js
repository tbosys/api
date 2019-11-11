const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var fs = require("fs");
var Handlebars = require("handlebars");
var mjml2html = require("mjml").default;
let AWS = require("aws-sdk");
var moment = require("moment");

var s3 = new AWS.S3();

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    var id = this.enforceSingleId(body);
    await this.knex.table(table).update({ estado: "por entregar" , fechaAlisto: moment().format("YYYY-MM-DD"),}).where("despacho.id", id);

    const despacho = await this.knex
      .table(table)
      .select(["documentoId", "clienteId", "transporteId"])
      .where("despacho.id", id)
      .first();

    const cliente = await this.knex
      .table("cliente")
      .select(["name", "direccion", "telefono"])
      .where("cliente.id", despacho.clienteId)
      .first();

    const transporte = await this.knex
      .table("transporte")
      .select("name")
      .where("transporte.id", despacho.transporteId)
      .first();

    const documento = await this.knex
      .table("documento")
      .select("consecutivo")
      .where("documento.id", despacho.documentoId)
      .first();

    despacho.cliente = cliente.name;
    despacho.clienteDireccion = cliente.direccion;
    despacho.telefono = cliente.telefono;
    despacho.transporte = transporte.name;
    despacho.consecutivo = documento.consecutivo;

    var movimientos = await this.knex
      .table("movimientoInventario")
      .select(["cantidad", "detalle"])
      .where("movimientoInventario.documentoId", despacho.documentoId);

    var firma = this.context.config;

    despacho.firma = firma;

    var cedulaS3 = `${firma.cedula}_${process.env.NODE_ENV}`;
    var template = Handlebars.compile(fs.readFileSync("./actions/despacho/print.mjml", "utf-8"));
    var html = template({ ...despacho, lineas: movimientos });
    var key = `despacho/${cedulaS3}/${id}.html`;
    const htmlOutput = mjml2html(html, {});
    var fixedHtml = htmlOutput.html;

    fixedHtml = fixedHtml.replaceAll("only screen and ", "");

    //if (process.env.NODE_ENV == "development") fs.writeFileSync("./despacho.html", fixedHtml); // para ver el html localmente

    await s3
      .putObject({
        Bucket: "facturas.efactura.io",
        Key: key,
        ContentType: "text/html",
        ACL: "public-read",
        Body: fixedHtml
      })
      .promise()
      .catch(e => {
        console.log(e, e.name, e.message);
        console.log(e);
        throw new Errors.SERVER_ERROR("Error guardando pdf impreso en S3.");
      });

    return { url: `http://facturas.efactura.io/${key}` };
  }
};

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};
