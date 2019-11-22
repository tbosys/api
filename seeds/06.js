var profile = {
  id: 1,
  restricted: "",
  title: "Profiles del Sistema",
  name: "profile",
  properties:
    '[{"name":"id","$id":"/properties/id","type":"integer","title":"Id"},{"name":"name","$id":"/properties/name","type":"string","title":"Name","default":true},{"name":"description","$id":"/properties/description","type":"string","title":"Description"}]',
  form: "{}",
  system: true,
  table: ""
};

var profileOwner = {
  id: 2,
  restricted: "",
  title: "Profile Owner",
  name: "profileOwner",
  properties:
    '[{"name":"id","$id":"/properties/id","type":"integer"},{"name":"profileId","$id":"/properties/profileId","type":"integer","table":"profile","metadataType":"profile"},{"name":"ownerId","$id":"/properties/ownerId","type":"integer","table":"owner","metadataType":"owner"}]',
  form: "{}",
  table: "",
  system: true,
  required: "profileId,ownerId",
  belongsTo: "profile,owner"
};

var code = {
  id: 3,
  restricted: "",
  title: "code",
  name: "code",
  system: true,
  properties:
    '[{"name":"id","$id":"/properties/id","type":"integer","title":"Id"},{"name":"code","$id":"/properties/code","type":"integer","title":"Codigo"},{"name":"ownerId","$id":"/properties/ownerId","type":"integer","title":"Propietario"},{"name":"ownerName","$id":"/properties/ownerName","type":"string","title":"Nombre Propietario"},{"name":"createdBy","$id":"/properties/createdBy","type":"string","title":"Creado por"},{"name":"updatedBy","$id":"/properties/updatedBy","type":"string","title":"Actualizado por"},{"name":"createdAt","$id":"/properties/createdAt","type":"string","title":"Creado"},{"name":"updatedAt","$id":"/properties/updatedAt","type":"string","title":"Actualizado"}]',
  form: "{}",
  table: ""
};

var rol = {
  id: 4,
  restricted: "",
  title: "Rol",
  system: true,
  name: "rol",
  properties:
    '[{"name":"id","$id":"/properties/id","type":"integer","default":0},{"name":"table","$id":"/properties/table","type":"string","default":""},{"name":"actions","$id":"/properties/actions","type":"string","default":""}]',
  form: "{}",
  table: ""
};

var owner = {
  id: 55,
  restricted: "",
  system: true,
  title: "Owner",
  name: "owner",
  properties:
    '[{"name":"id","$id":"/properties/id","type":"integer"},{"name":"name","$id":"/properties/name","type":"string","default":"","minLength":2},{"name":"email","$id":"/properties/email","type":"string","default":"","minLength":3},{"name":"active","$id":"/properties/active","type":"boolean","default":true}]',
  form: "{}",
  table: "",
  required: "name,email,active",
  belongsTo: ""
};

var list = {
  id: 14,
  restricted: "",
  title: "List",
  name: "list",
  properties:
    '[{"name":"id","$id":"/properties/id","type":"integer","title":"Id"},{"name":"name","$id":"/properties/name","type":"string","title":"Nombre","width":450},{"name":"sums","$id":"/properties/sums","type":"string","element":"multiselectDynamic","route":"reporte/queryProperties","queryOnChange":["table"],"isJSON":true,"title":"sumas"},{"name":"sorts","$id":"/properties/sorts","type":"string","element":"multiselectDynamic","route":"reporte/queryProperties","queryOnChange":["table"],"isJSON":true,"title":"orden"},{"name":"columns","$id":"/properties/columns","type":"string","element":"multiselectDynamic","route":"reporte/queryProperties","queryOnChange":["table"],"isJSON":true,"title":"Campos"},{"name":"table","$id":"/properties/table","type":"string","element":"selectDynamic","route":"reporte/queryTables","title":"Table"},{"name":"type","$id":"/properties/type","type":"string","element":"selectDynamic","route":"reporte/queryTables","title":"Type"},{"name":"filters","$id":"/properties/filters","type":"string","isJSON":true,"title":"Filtros"},{"name":"ownerId","$id":"/properties/ownerId","type":"integer"},{"name":"groups","$id":"/properties/groups","type":"string","element":"multiselectDynamic","route":"reporte/queryProperties","queryOnChange":["table"],"isJSON":true,"title":"Agrupar"},{"name":"createdBy","$id":"/properties/createdBy","type":"string","title":"Creado por","filterable":true,"sortable":true},{"name":"createdAt","$id":"/properties/createdAt","type":"string","title":"Creado","filterable":true,"sortable":true,"formatter":"DateTimeFormatter"}]',
  form: "{}",
  table: "",
  required: "",
  belongsTo: ""
};

var table = {
  id: 15,
  restricted: "",
  title: "Table",
  name: "table",
  properties:
    '[{"name":"id","$id":"/properties/id","type":"integer","title":"Id"},{"name":"name","$id":"/properties/name","type":"string","title":"Nombre","default":""},{"name":"title","$id":"/properties/name","type":"string","title":"Title","default":""},{"name":"shareLevel","$id":"/properties/name","type":"integer","title":"shareLevel","default":""},{"name":"restricted","$id":"/properties/ownerId","type":"string","title":"Restricted","isCSV":true},{"name":"belongsTo","$id":"/properties/ownerId","type":"string","title":"Restricted","isCSV":true},{"name":"table","$id":"/properties/ownerId","type":"string","title":"Restricted","isJSON":true},{"name":"form","$id":"/properties/ownerId","type":"string","title":"form","isJSON":true},{"name":"properties","$id":"/properties/properties","type":"string","title":"properties","isJSON":true},{"name":"createdBy","$id":"/properties/createdBy","type":"string","title":"Creado por"},{"name":"createdAt","$id":"/properties/createdAt","type":"string"}]',
  form: '[{"title":"Información","fields":["name","properties"]}]',
  table: "",
  required: "",
  belongsTo: ""
};

function insertIgnore(knex, operation) {
  return knex.raw(operation.toString().replace(/^insert/i, "insert ignore"));
}

exports.seed = async function(knex) {
  if (process.env.NODE_ENV == "development") {
    await insertIgnore(knex, knex("table").insert(profile));
    await insertIgnore(knex, knex("table").insert(profileOwner));
    await insertIgnore(knex, knex("table").insert(rol));
    await insertIgnore(knex, knex("table").insert(code));
    await insertIgnore(knex, knex("table").insert(owner));
    await insertIgnore(knex, knex("table").insert(list));
    await insertIgnore(knex, knex("table").insert(table));
  }
};
