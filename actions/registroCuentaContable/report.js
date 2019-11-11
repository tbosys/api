const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;


var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var fs = require("fs");
var https = require('https');
var querystring = require('querystring');
var request = require("superagent");
var js2xmlparser = require("js2xmlparser");
var TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
var Resumen = require("../../apiHelpers/hacienda/resumen");
var InvokeSign = require("../../apiHelpers/invokeSign");
var moment = require('moment-timezone');


module.exports = class DefaultUpdateAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {

    var balance = await this.knex.table("registroCuentaContableDetail")
      .select("registroCuentaContableDetail.*", "account.accountId as parentId", "account.name", "account.nivel", "account.codigo")
      .innerJoin("account", "registroCuentaContableDetail.accountId", "account.id")
      .innerJoin("registroCuentaContable", "registroCuentaContableDetail.registroCuentaContableId", "registroCuentaContable.id")
      .where({ "registroCuentaContable.createdAt": body.start })
      .orderBy("codigo", "ASC");

    var journals = [];
    if (body.end) await this.knex.table("journal").select()
      .where("createdAt", "BETWEEN", [body.start, body.end]);

    var accountMap = {};
    balance.forEach((accountLoop) => {
      var account = accountMap[accountLoop.accountId];
      accountMap[accountLoop.accountId] = { codigo: accountLoop.codigo, nivel: accountLoop.nivel, name: accountLoop.name, id: accountLoop.id, inicial: accountLoop.balance, parentId: accountLoop.parentId || 0, debito: 0, credito: 0, final: 0 };
    })

    var journalMap = {};
    journals.forEach((journal) => {
      JSON.parse(journal.journalItem).forEach((item) => {
        //accountMap[item.accountId].inicial += item.inicial;
        //accountMap[item.accountId].nivel = item.nivel;
        accountMap[item.accountId].debito += item.debito;
        accountMap[item.accountId].credito += item.credito;
        accountMap[item.accountId].final += item.credito - item.debito;
      })
    })

    var list = Object.keys(accountMap).map((key) => {
      return accountMap[key];

    });

    function listToTree(data, options) {
      options = options || {};
      var ID_KEY = options.idKey || 'id';
      var PARENT_KEY = options.parentKey || 'parentId';
      var CHILDREN_KEY = options.childrenKey || 'children';

      var tree = [],
        childrenOf = {};
      var item, id, parentId;

      for (var i = 0, length = data.length; i < length; i++) {
        item = data[i];
        id = item[ID_KEY];
        parentId = item[PARENT_KEY] || 0;
        // every item may have children
        childrenOf[id] = childrenOf[id] || [];
        // init its children
        item[CHILDREN_KEY] = childrenOf[id];
        if (parentId != 0) {
          // init its parent's children object
          childrenOf[parentId] = childrenOf[parentId] || [];
          // push it into its parent's children object
          childrenOf[parentId].push(item);
        } else {
          tree.push(item);
        }
      };

      return tree;
    }


    function calculateFromKids(parent, children) {
      children.forEach((item) => {
        if (item.children) item = calculateFromKids(item, item.children);
        parent.debito += item.debito;
        parent.inicial += item.inicial;
        parent.credito += item.credito;
        parent.final += item.final;
      })

      return parent;
    }

    var tree = listToTree(list);

    tree.forEach((item) => {
      if (item.children) item = calculateFromKids(item, item.children);
    })

    return tree;

  }
}
