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
var moment = require("moment");
var request = require("request");

var s3 = new AWS.S3();

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    var id = this.enforceSingleId(body);
    await this.enforceNotStatus(body, ["archivado", "por archivar"]);

    var orden = await this.knex
      .table(table)
      .select([
        "orden.*",
        "cliente.name as clienteName",
        "cliente.cedula",
        "cliente.creditoPlazo",
        "transporte.name as transporte"
      ])
      .where("orden.id", id)
      .innerJoin("cliente", "cliente.id", "orden.clienteId")
      .leftJoin("transporte", "orden.transporteId", "transporte.id")
      .first();

    var lineas = JSON.parse(orden.ordenLinea);

    lineas.forEach(element => {
      element.precio = numeral(element.precio).format("0,0.00");
      element.descuento = numeral(element.descuento).format("0,0.00");
      element.descuentoUnitario = numeral(element.descuentoUnitario).format("0,0.00");
      element.total = numeral(element.total).format("0,0.00");
    });

    orden.subTotal = numeral(orden.subTotal).format("0,0.00");
    orden.descuento = numeral(orden.descuento).format("0,0.00");
    orden.impuesto = numeral(orden.impuesto).format("0,0.00");
    orden.total = numeral(orden.total).format("0,0.00");
    orden.name = orden.name || "n/d";

    var firma = this.context.config;

    orden.emisor = {
      nombre: firma.name,
      cedula: firma.cedula,
      ubicacion: firma.ubicacion
    };

    orden.fechaVencimiento = moment(orden.fecha)
      .add(8, "days")
      .format("YYYY-MM-DD");
    var cedulaS3 = `${firma.cedula}_${process.env.NODE_ENV}`;
    var template = Handlebars.compile(fs.readFileSync("./actions/orden/print.mjml", "utf-8"));
    var html = template({ ...orden, lineas: lineas });
    var key = `ordenes/${cedulaS3}/${orden.id}.pdf`;
    const htmlOutput = mjml2html(html, {});
    var fixedHtml = htmlOutput.html;

    fixedHtml = fixedHtml.replaceAll("only screen and ", "");

    //if (process.env.NODE_ENV == "development") fs.writeFileSync("./orden.html", fixedHtml); // para ver el html localmente

    var binaryPdf = await getPdf(fixedHtml);

    await s3
      .putObject({
        Bucket: "facturas.efactura.io",
        Key: key,
        ContentType: "application/pdf",
        ACL: "public-read",
        Body: binaryPdf
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

function getPdf(html) {
  var promise = function(resolve, reject) {
    config = {
      url: "https://docraptor.com/docs",
      encoding: null, //IMPORTANT! This produces a binary body response instead of text
      headers: {
        "Content-Type": "application/json"
      },
      json: {
        user_credentials: "UPAAd0ML8deQp1tXf",
        doc: {
          document_content: html,
          type: "pdf",
          test: false
          // prince_options: {
          //   media:   "screen",          // use screen styles instead of print styles
          //   baseurl: "http://hello.com" // URL to use for generating absolute URLs for assets from relative URLs
          // }
        }
      }
    };
    request.post(config, function(err, response, body) {
      if (err) reject(err);
      resolve(body);
    });
  };
  return new Promise(promise);
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};
