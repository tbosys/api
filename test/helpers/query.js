var Execute = require("./context");

module.exports = {
  byId: async (type, id) => {
    var result = await Execute(
      { filters: [[type + ".id", "=", id]] },
      type,
      "query"
    );
    return result[0];
  },
  byValue: async (type, field, value) => {
    var result = await Execute(
      { filters: [[type + "." + field, "=", value]] },
      type,
      "query"
    );
    return result[0];
  },
  byFiltersOne: async (filters, type) => {
    var result = await Execute(
      {
        filters: filters
      },
      type,
      "query"
    );
    return result[0];
  },
  byFiltersAll: (filters, type) => {
    return Execute(
      {
        filters: filters
      },
      type,
      "query"
    );
  }
};
