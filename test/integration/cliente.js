process.env.NODE_ENV = process.env.NODE_ENV || "development";

var chai = require("chai");
chai.should();
var Execute = require("../helpers/context");
var Cliente = require("../helpers/objects/cliente");
var Contacto = require("../helpers/objects/contacto");
var Query = require("../helpers/query");

describe("Clientes", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });
  it("Cliente actualizar tags, actualiza el contacto", async function() {
    var cliente = await Cliente({ ownerId: 2 });
    var contacto = await Contacto({ ownerId: 2 ,clienteId: cliente.id});

    try {
        var clienteUpdate = await Execute(
          {
            ...cliente,
            tags: "testTag",
          },
          "cliente",
          "update"
        );
      } catch (e) {
        errored = true;
      }

    var contactoAfterClienteUpdate = await Query.byId("contacto", contacto.id);

    cliente.ownerId.should.equal(2);
    contactoAfterClienteUpdate.ownerId.should.equal(2);
    contactoAfterClienteUpdate.clienteId.should.equal(cliente.id);
    clienteUpdate.tags.should.equal("testTag");
    contactoAfterClienteUpdate.tags.should.equal("testTag");

    return true;
  });
});
