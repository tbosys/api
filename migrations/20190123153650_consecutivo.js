var $db = require("serverless-dynamodb-client").raw;
const DynamodbFactory = require("@awspilot/dynamodb");
DynamodbFactory.config({ empty_string_replace_as: undefined });

var DynamoDB = new DynamodbFactory($db);

exports.up = function(knex, Promise) {
  var firma;
  var env = process.env.NODE_ENV || "development";

  return knex.schema
    .createTable("consecutivo", function(table) {
      table.increments();
      table.integer("consecutivoFactura");
      table.integer("consecutivoNotaCredito");
      table.integer("consecutivoNotaDebito");
    })
    .then(async function() {
      firma = await knex
        .table("firmaDigital")
        .select()
        .first();
      if (!firma) return true;
      await knex.table("consecutivo").insert({
        consecutivoFactura: firma.consecutivoFactura,
        consecutivoNotaCredito: firma.consecutivoNotaCredito,
        consecutivoNotaDebito: firma.consecutivoNotaDebito
      });
      return true;
    })
    .then(async function() {
      if (!firma) return true;
      return DynamoDB.table(env + "Config")
        .return(DynamoDB.ALL_OLD)
        .insert_or_replace({
          cedula: firma.cedula || "",
          username: firma.username || "",
          password: firma.password || "",
          ubicacion: firma.ubicacion || "",
          email: firma.email || "@efactura.io",
          name: firma.name || "N/D",
          pin: firma.pin || 0000,
          telefono: firma.telefono || "",
          certificado: firma.certificado || "",
          slackWebHook: firma.slackWebHook || "",
          channelSlackFacturacion: firma.channelSlackFacturacion || "",
          channelSlackRecibo: firma.channelSlackRecibo || "",
          cuentaContableNcFinanciero: firma.cuentaContableNcFinanciero || "",
          username_staging: firma.username_staging || "",
          password_staging: firma.password_staging || "",
          pin_staging: firma.pin_staging || "0000",
          certificado_staging: firma.certificado_staging || "",
          tipoCambio: firma.tipoCambio || 600,
          debugging: 0,
          lastDebugDate: "2019-01-01",
          account: process.env.ACCOUNT || "development"
        });
    })
    .then(async function() {
      let usuarios = await knex.table("usuario").select();
      console.log("usuarios", usuarios);
      let promises = usuarios.map(usuario => {
        return DynamoDB.table(env + "Usuario")
          .return(DynamoDB.ALL_OLD)
          .insert_or_replace({
            id: usuario.id,
            createdBy: "Sistema",
            updatedBy: "Sistema",
            createdAt: "2019-01-01 00:53:35",
            updatedAt: "2019-01-01 15:59:42",
            activo: usuario.activo || 0,
            name: usuario.name,
            cedula: usuario.cedula || "1-0000-0000",
            email: usuario.email || "@efactura.io",
            mobile: usuario.mobiler,
            roles: usuario.roles,
            recibeCorreoFacturaEntrante: true,
            nivel: usuario.nivel || 5,
            account: process.env.ACCOUNT || "development"
          });
      });
      return Promise.all(promises);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("consecutivo");
};
