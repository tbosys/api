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
var arrayToTree = require('array-to-tree');


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


    var list = balance;// Object.keys(accountMap).map((key) => {
    //return accountMap[key];
    //});

    list.forEach((item) => {
      item.id = item.accountId;
    })

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



    return arrayToTree(list, {
      parentProperty: 'parentId',
      customID: 'id'
    });

    var tree = listToTree(list);



    return tree;

  }
}
