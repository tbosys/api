var JWT = require("../apiHelpers/jwt");
var errors = require("../errors");
var moment = require("moment");
var path = require("path");

module.exports = opts => {
  const defaults = {};

  const options = Object.assign({}, defaults, opts);

  return {
    before: (handler, next) => {
      let { context } = handler;

      var systemSchemas = require("require.all")("../schemas");
      var schemas = require("require.all")(`${process.cwd()}/src/schemas`);
      context.schemaMap = { ...systemSchemas, ...schemas };
      handler.context = context;
      next();
    },
    after: null,
    onError: null
  };
};
