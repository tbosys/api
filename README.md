Api Login
CRM Api and Admin Api.
Routes for /api/crm/_/_

Setup:

- Install and start mysql
- Create Database development
- knex migrate:latest
- knex seed:run
- Add Roles - if needed.

* npm install
* knex migrate:latest
* knex seed:run
* npm run roles

Run:

- npm start or debug in VSCode

Manual testing

*Venta/Orden*

- crear: Seleccionar cliente, seleccionar productos (cantidades, precios), Revisar montos segun seleccion.
- editar: Hacer ajustes en campos y productos, guardar, revisar datos cambiados. 
- aplicar: Las ordenes en estado "por aplicar" deberian cambiar de estado al darle esta accion.
- aprobar: Las ordenes en estado "por aprobar" o "por reactivar" deberian cambiar de estado al darle esta accion.
- imprimir: Al darle esta accion revisamos que se despliegue la factura correctamente y se generen demas acciones relacionadas (*)
- espera: Cuando un pedido esta en estado "por aprobar" se puede ejecutar esta accion para ponerlo en "por esperar"
- proforma: Al darle esta accion revisamos que se despliegue la proforma correctamente

*Venta/Cliente*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Editar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente

*Venta/Documento*

- anular: Al darle anular revisar que se generen todas acciones relacionadas (*)

*Venta/Movimientos*

- devolver: Llenar los datos solicitados y verificar que se generen todas las acciones relacionadas (*).

*Credito/NotaFinanciera*

- crear: LLenar los dastos solicitados y guardar, al finalizar verificar que todo este segun lo esperado.
- aprobar: Al darle esta opcion revisar que se generen todas las acciones relacionadas (*)

*Credito/Saldo*

- pagar: llenar datos solicitados y verificar que se generen todas las acciones relacionadas (*)

*Credito/Recibo*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- aplicar: Ejecutar la accion y revisa que se generen todas las acciones relacionadas (*)
- imprimir: Una vez el estado del recibo sea "por archivar" ejecutar la accion para verificar la impresion del mismo.
- borrar: Ejecutar la accion en estado "por aplciar" deberia borrar el recibo caso contratio error

*Inventario/Despacho*

- imprimir: al ejecutar esta accion se deberia desplegar la boleta de alisto.

*Inventario/Boleta*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente.
- aprovar: Una vez el estado de la boleta sea "por aprobar" se puede ejecutar esta accion y cambia a "por aplicar"
- aplicar: Al aplicar revisar que se generen todas las acciones relacionadas.

*Inventario/Producto*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente.

*Inventario/DescuentoGrupo*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente.

*Inventario/DescuentoCliente*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente.

*CxP/Recibido*

- ingresar:   //esperando por cambios
- aceptar:
- rechazar:
- archivar:

*CxP/Gasto*

- prepagado: //esperando por cambios

*CxP/Facturas*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente.

*CxP/Proveedor*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente.

*CxP/Contactos*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente.

*CxP/Pago*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que se generen las acciones relacionadas (*)

*Auditoria/Cierre*

- marcar: se seleccionan ambas fecha para poder revisar informacion desplegada de movimientos del dia

*Administracion/Usuarios*

- crear: Llenar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente
- editar: Generar los cambios deseados y guardar, al finalizar revisar que los datos ingresados se guardaran correctamente. Importante revisar la parte de permisos.
- login: Revisar que esta accion nos permita entrar con la cuenta del usuario seleccionado.

(*) Ver documento ./infoTesting.md para obtener mayor detalle.
# api
