exports.up = function (knex, Promise) {
    return knex.schema.createTable('proveedorContacto', function (table) {
      table.increments();
      table.string("createdBy");
      table.string("updatedBy");
      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
      table.string("namespaceId", 20).notNull();
      table.string("name", 100).notNull();
      table.boolean("activo");
      table.string("cedula");
      table.string("email");
      table.string("mobile");
      table.string("rol");
      table.text("descripcion");
    
      table.integer("proveedorId").unsigned();
      table.foreign('proveedorId').references('id').inTable('proveedor').onDelete("RESTRICT");
  
  
      table.integer("ownerId").unsigned();
      table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");
    
      table.unique(['name', 'proveedorId', 'namespaceId'], "proveedorContacto")
  
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.dropTable('proveedorContacto');
  };
  