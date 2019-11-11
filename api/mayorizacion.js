
const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require('../apiHelpers/xmlParser');
var BodyHelper = require("../operation/bodyHelper");
var Security = require("../apiHelpers/security");


class ApiOperation extends BaseOperation {


  get table() {
    return "mayorizacion";
  }

  async metadata(body) {
    var metadata = this.getMetadata();
    var item = null;
    var recent = null;

    if (body.id && (parseInt(body.id) >= 0)) item = await this.one(body);
    else if (body.inProgress) recent = await this.query(this.getQueryForInProgress() || { inProgress: true })
    else if (body.relatedTo) recent = await this.query({ filters: [[body.relatedTo, "=", body.relatedId]] })
    else if (body.filters) recent = await this.query(body);

    metadata.count = 0;

    metadata.item = item;
    metadata.recent = recent;
    return Promise.resolve(metadata);
  }

  get multiTenantObject() {
    return true;
  }

  async _query(body) {
    Security.checkQuery(this.table, this.user);
    body.isDraft = false
    var knexOperation = this.knex("journalItem");

    if(body.filters){
      body.filters.forEach((filter) => {
        var parts = filter[0].split(".");
      if(parts[1] == 'isDraft' && filter[2] == 1) body.isDraft = true;
      })
    };

    if(body.filters){
      body.filters.forEach((filter) => {
        var parts = filter[0].split(".");
        if(!body.isDraft && parts[1] != 'isDraft'){
          var regex = /mayorizacion/gi; 
          filter[0] = filter[0].replace(regex, 'journalItem'); 
          var key = parts[1] || parts[0];
          var column = this._metadata.properties[key];
          if(column && column.select && parts[0] == 'fecha' && filter[1] == 'BETWEEN') knexOperation.whereBetween(column.select, filter[2]);
          else if (parts[0] == 'fecha' && filter[1] == 'FIXED') throw new Errors.VALIDATION_ERROR("El filtro literal de fecha no esta habilitado de momento para esta app"); 
          else if (column && column.select) knexOperation.whereRaw(`${column.select} ${filter[1]} ?`, filter[2]);
          else knexOperation.where(filter[0], filter[1], filter[2]);
        }
      });
    }

    if(!body.isDraft){
        knexOperation.select(["journalItem.id", "journalItem.name", "account.name as accountName", "account.codigo as accountCodigo", "journal.fecha as fecha", "journalItem.descripcion as descripcion", "debito", "credito"])
        .innerJoin("journal", "journalItem.journalId", "journal.id")
        .innerJoin("account", "journalItem.accountId", "account.id")
    }

    return knexOperation;
  }

  async postQuery(items, body) {
    var rows = [];
    var filterRows = [];

    var knexOperation = this.knex("journal");

    if(body.isDraft){
        items = [];

        if(body.filters){
          body.filters.forEach((filter) => {
            var parts = filter[0].split(".");
            if(parts[0] == 'fecha'){
              var key = parts[1] || parts[0];
              var column = this._metadata.properties[key];
              if(column && column.select && parts[0] == 'fecha' && filter[1] == 'BETWEEN') knexOperation.whereBetween(`${column.select}`, filter[2]);
              else if (parts[0] == 'fecha' && filter[1] == 'FIXED') throw new Errors.VALIDATION_ERROR("El filtro literal de fecha no esta habilitado de momento para esta app"); 
              else if (column && column.select) knexOperation.whereRaw(`${column.select} ${filter[1]} ?`, filter[2]);
              else knexOperation.where(`${filter[0]}`, filter[1], filter[2]);
            }
          });
        }

        var accounts = await this.knex.table("account").forUpdate();
        var accountCodesMap = {};
        accounts.forEach(account => {
        accountCodesMap[account.id] = {"codigo": account.codigo, "name": account.name};
        });

        var draftData = await knexOperation
        .select(["journal.journalItem"])
        .where("journal.isDraft", "=", true);

        var rowDraftId = 0;
        draftData.forEach(data => {
            JSON.parse(data.journalItem).forEach(item => {
                var row = {};
                row.id = 'draft' + rowDraftId;
                row.isDraft = true;
                row.name = item.name;
                row.fecha = item.fecha;
                row.descripcion = item.descripcion;
                row.debito = item.debito;
                row.credito = item.credito;
                row.accountName = accountCodesMap[item.accountId].name;
                row.accountCodigo = accountCodesMap[item.accountId].codigo;
                row.credito = item.credito;
                rowDraftId++;
                rows.push(row);
            })
        })

        if(body.filters){
          body.filters.forEach((filter) => {
            var parts = filter[0].split(".");
            if(parts[1] != 'isDraft' && parts[0] != 'fecha'){
              rows = rows.filter(function(item){
                var key = parts[1] || parts[0];
                var textParse = filter[2].replace(/%/g, '');
                if (item[key].includes(textParse)) return item;
              });
            }
          });
        }
    }
    
    items.forEach(item => {
      item.isDraft = false;
    });

    return items.concat(rows);
  }

}

module.exports = ApiOperation;