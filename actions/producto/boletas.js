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
    let familia = body.ids.familia
    let productos = [];
    if (familia) {
        productos = await this.knex
        .table("producto")
        .select("name")
        .where("activo", true)
        .andWhere("familia", "like", familia)
        .orderBy("name")
    } else {
        productos = await this.knex
        .table("producto")
        .select("name")
        .where("activo", true)
        .orderBy("name")
    }


    let halfWayThough = Math.floor(productos.length / 2);
    let arrayFirstHalf = productos.slice(0, halfWayThough);
    let arraySecondHalf = productos.slice(halfWayThough, productos.length);
    var productosArray = []

    for(var i = 0; i < arrayFirstHalf.length; i++){
        var productosMerge = {}
        productosMerge.name1 = arrayFirstHalf[i].name;
        productosMerge.name2 = arraySecondHalf[i].name;
        productosArray.push(productosMerge);
    }

    console.log("productoArray--> " + productosArray);

    if(arrayFirstHalf.length != arraySecondHalf.length) productosArray.push({"name1":arraySecondHalf[arraySecondHalf.length-1].name, "name2": "Blank"});

    var firma = this.context.config;

    var date = Date.now();
    var cedulaS3 = `${firma.cedula}_${process.env.NODE_ENV}`;
    var template = Handlebars.compile(fs.readFileSync("./actions/producto/boletas.mjml", "utf-8"));
    var html = template({ productos: productosArray });
    var key = `productos/boletas/${cedulaS3}/${familia}-${date}.html`;
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
