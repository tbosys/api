var Producto = require("../objects/producto");
var Boleta = require("../objects/boleta");

module.exports = async function(productoBody = {}) {
  var producto = await Producto(productoBody);
  await Boleta("CO", {}, [{ id: producto.id }]);
  return producto;
};
