const csv = require("csvjson");
const knex = require("../apiHelpers/knex");
const fs = require("fs");

const file = fs.readFileSync(`scripts/productionTarea.csv`, "utf8");
const dataObj = csv.toObject(file);

dataObj.forEach(data => {
  delete data.account;
  delete data.__ownerId;
  data.estado = data.estadoOwnerId;
  delete data.estadoOwnerId;
  delete data.importante;
  delete data.urgente;
  delete data.id;
  delete data.important;
  delete data.urgent;
  delete data.taskId;
  delete data.ownerName;
  delete data.sortKey;
  //data.important = data.important ? 1 : 0;
  //data.urgent = data.important ? 1 : 0;

  data.isSection = data.isSection ? 1 : 0;
  data.estado = data.progress == 100 ? "archivado" : "pendiente";
  delete data.progress;
  data.createdAt = data.createdAt ? data.createdAt : new Date();
  data.fechaVencimiento = data.fechaVencimiento ? data.fechaVencimiento : data.createdAt;
  data.createdById = data.createdById ? data.createdById : 1;
  data.ownerId = data.ownerId ? data.ownerId : 19; //esteban to check
  data.order = data.order ? data.order : 1000;
  //data.taskId = data.taskId ? data.taskId : 0;
  data.description = data.description.length > 1000 ? data.description : data.description.substring(0, 999);
  data.name = data.name.length > 1000 ? data.name : data.name.substring(0, 999);
});

const database = process.env.NODE_ENV == "development" ? "development" : "rodco";

knex(database)
  .insert(dataObj)
  .into("task")
  .then(() => {
    console.log("Import data done!");
    process.exit(0);
  })
  .catch(err => {
    console.log("Import data failed" + err);
    process.exit(0);
  });
