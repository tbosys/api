var path = require("path");
var fs = require("fs");

function loadSchemas() {
  var files = fs.readdirSync(path.resolve("src", "schemas"));
  var map = {};
  files.forEach(file => {
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
    var prop = jsonSchema.properties[key];
    delete prop.element;
    
    if(props.element){
        delete 
    }
    if(prop.formatter) 
    props.push({ id: index, name: key, ...jsonSchema.properties````[key] });
  });

  var nj = {
    restricted: jsonSchema.restricted.join(","),
    title: jsonSchema.title,
    name: jsonSchema.key,
    properties: JSON.stringify(props),
    form: jsonSchema.layout || []),
    table: (jsonSchema.table || []).join(","),
    required: (jsonSchema.required || []).join(","),
    belongsTo: (jsonSchema.belongsTo || []).join(",")
  };

  return nj;
}

loadSchemas();

formatter
filterRenderer
element

delete table,filterable,sortable

"table": "grupoProducto",
            "metadataType": "grupoProducto",
            
            "route": "grupoProducto/findLikeName",
            "element": "autocomplete",
            "width": 100,
            "default": 3,
            "elementOptions": {
                "primary": "name"
            }

layout to form
fields to cols