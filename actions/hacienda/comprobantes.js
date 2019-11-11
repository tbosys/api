var LOGIN = "https://idp.comprobanteselectronicos.go.cr/auth/realms/***/protocol/openid-connect/token";
var API = "https://api.comprobanteselectronicos.go.cr/***/v1/recepcion";
var COMPROBANTES = "https://api.comprobanteselectronicos.go.cr/***/v1/comprobantes";

var moment = require("moment-timezone");

var fs = require("fs");
var https = require("https");
var querystring = require("querystring");
var request = require("superagent");

var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var ProcesingError = {};
var RejectError = {};

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.getComprobantes(table, body);
  }

  async getComprobantes(body) {
    var token, responseXML, verifyResult;
    var { cedula, cedulaS3 } = body;

    //Bloque #1: Login a Hacienda

    var enviroment = process.env.NODE_ENV == "production" ? "production" : "staging";
    var firma = this.context.config;

    token = (await this.login(firma)).body.access_token;

    verifyResult = await this.comprobantes({ ...firma, ...body }, token);

    var response = verifyResult.body;

    return response;
  }

  //
  // Funciones de Soporte
  //
  //

  login(event) {
    return Login(event);
  }

  comprobantes(event, token) {
    return Comprobantes(event, token);
  }
};

function Url(type, sandbox) {
  if (type == "login") {
    if (sandbox) return LOGIN.replace("***", "rut-stag");
    else return LOGIN.replace("***", "rut");
  } else if (type == "api") {
    if (sandbox) return API.replace("***", "recepcion-sandbox");
    else return API.replace("***", "recepcion");
  } else if (type == "comprobantes") {
    if (sandbox) return COMPROBANTES.replace("***", "recepcion-sandbox");
    else return COMPROBANTES.replace("***", "recepcion");
  }
}

function Comprobantes(event, token) {
  var url = Url("comprobantes", event.username.indexOf("stag") > -1);

  return request
    .get(url + "/" + (event.clave || ""))
    .query({ emisor: "0200" + event.cedula, limit: 50, offset: 100 })
    .set("Authorization", "Bearer " + token)
    .set("Content-Type", "application/json")
    .send();
}

function Login(event) {
  Login.url = Url("login", event.username.indexOf("stag") > -1);
  var body = {
    client_id: "api-stag",
    grant_type: "password",
    username: event.username,
    password: event.password,
    client_secret: "",
    scope: ""
  };

  return request
    .post(Login.url)
    .type("form")
    .send(body)
    .catch(function(e) {
      console.log(e.body, e.response.body, e.response.header, e.response.headers);

      console.log(e, e.body, e.headers);
      console.log(JSON.stringify(e));
      throw e;
    });
}
