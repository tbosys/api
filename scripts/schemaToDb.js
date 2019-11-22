var path = require("path");
var fs = require("fs");

function loadSchemas() {
  var files = fs.readdirSync(path.resolve("schemas"));
  var map = {};
  files.forEach(file => {
    if (file == "schemas.json") return;
    map[file.replace(".json", "")] = schemaToDb(file);
  });

  fs.writeFileSync(
    path.resolve("schemas", "schemas.json"),
    JSON.stringify(map)
  );
}

function schemaToDb(file) {
  var jsonSchema = require(path.resolve("schemas", file));

  var props = [];
  Object.keys(jsonSchema.properties).forEach((key, index) => {
    props.push({ id: index, name: key, ...jsonSchema.properties[key] });
  });

  var nj = {
    restricted: jsonSchema.restricted.join(","),
    title: jsonSchema.title,
    name: jsonSchema.key,
    properties: JSON.stringify(props),
    form: JSON.stringify(jsonSchema.layout || []),
    table: (jsonSchema.table || []).join(","),
    required: (jsonSchema.required || []).join(","),
    belongsTo: (jsonSchema.belongsTo || []).join(",")
  };

  return nj;
}

loadSchemas();
