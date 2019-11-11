const moment = require("moment");
//const distritos = require("../_seeds/distrito");

const consecutivo = [
  {
    id: 1,
    consecutivoFactura: 0,
    consecutivoNotaCredito: 0,
    consecutivoNotaDebito: 0,
    consecutivoRecibo: 0
  }
];

function insertIgnore(knex, operation) {
  return knex.raw(operation.toString().replace(/^insert/i, "insert ignore"));
}

exports.seed = async function(knex, Promise) {
  await insertIgnore(knex, knex("transporte").insert({ id: 1, name: "interno", namespaceId: "test" }));
  await insertIgnore(knex, knex("segmento").insert({ id: 1, name: "detalle" }));

  await insertIgnore(knex, knex("grupoProducto").insert({ id: 1, name: "G1" }));
  await insertIgnore(knex, knex("grupoProducto").insert({ id: 2, name: "G2" }));
  await insertIgnore(knex, knex("grupoProducto").insert({ id: 3, name: "G3" }));

  await insertIgnore(knex, knex("consecutivo").insert(consecutivo));

  //await insertIgnore(knex, knex("distrito").insert(distritos(process.env.NODE_ENV)));

  await insertIgnore(
    knex,
    knex("grupo").insert({
      id: 1,
      createdBy: "sistema",
      updatedBy: "sistema",
      createdAt: moment().format("YYYY-MM-DD"),
      updatedAt: moment().format("YYYY-MM-DD"),
      name: "retail",
      ownerId: 1,
      ownerName: "sistema",
      namespaceId: "test"
    })
  );

  //Borderline for production
  if (process.env.NODE_ENV == "staging" || process.env.NODE_ENV == "production") return;

  await insertIgnore(
    knex,
    knex("cliente").insert({
      cedula: "111050279",
      name: "Roberto",
      activo: true,
      creditoPlazo: 0,
      creditoLimite: 0
    })
  );

  await insertIgnore(
    knex,
    knex("cliente").insert({
      cedula: "3101023455",
      name: "credito",
      activo: true,
      creditoPlazo: 30,
      creditoLimite: 1000000
    })
  );

  await insertIgnore(
    knex,
    knex("producto").insert({
      activo: true,
      unidadMedida: "Sp",
      name: "Servicio Profesional",
      mercancia: false,
      codigo: "1",
      impuesto: 0
    })
  );

  await insertIgnore(knex, knex("precio").insert({ name: "retail", productoId: 1, grupoId: 1, precio: 1 }));
  await insertIgnore(
    knex,
    knex("descuentoGrupo").insert({ name: "retail", productoId: 1, grupoId: 1, descuento: 0 })
  );

  await insertIgnore(
    knex,
    knex("producto").insert({
      activo: true,
      unidadMedida: "Kg",
      name: "Producto 1",
      inventario: 100,
      mercancia: true,
      codigo: "2",
      impuesto: 13
    })
  );

  await insertIgnore(
    knex,
    knex("costoHistorico").insert({ activo: true, productoId: 2, costo: 0.5, costoAnterior: 0.4 })
  );

  await knex
    .table("producto")
    .update({ costoHistoricoId: 1 })
    .where("id", 2);

  await insertIgnore(knex, knex("precio").insert({ name: "retail", productoId: 2, grupoId: 1, precio: 1 }));
  await insertIgnore(
    knex,
    knex("descuentoGrupo").insert({ name: "retail", productoId: 2, grupoId: 1, descuento: 0 })
  );
};
