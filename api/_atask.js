const Errors = require("../errors");
const moment = require("moment");
const Slack = require("../apiHelpers/slack");
var BaseOperation = require("../operation/baseOperation");

class Audit extends BaseOperation {
  get table() {
    return "task";
  }

  get multiTenantObject() {
    return false;
  }

  async progress(body) {
    var updateBody = {
      progress: body.progress
    };
    if (!process.env.TESTING && ["staging", "production"].indexOf(process.env.NODE_ENV) > -1)
      await this.context.DynamoDB.table(process.env.NODE_ENV + "Tarea")
        .where("accountTypeId")
        .eq(body.accountTypeId)
        .where("sortKey")
        .eq(body.sortKey)
        .delete(updateBody);

    return updateBody;
  }

  async morning(body) {
    if (!this.context.config.slack) return { success: true };
    var pending = await this.context.DynamoDB.table(process.env.NODE_ENV + "Tarea")
      .index("estado")
      .select(
        "taskId",
        "id",
        "type",
        "accountTypeId",
        "sortKey",
        "section",
        "createdById",
        "comentarios",
        "attachment",
        "ownerId",
        "createdBy",
        "ownerName",
        "name",
        "fechaVencimiento",
        "progress"
      )
      .where("account")
      .eq(this.context.account)
      .where("estadoOwnerId")
      .begins_with("pendiente")
      .descending()
      .query();

    var tareasByOwner = {};
    pending.forEach(task => {
      if (!tareasByOwner[task.ownerId])
        tareasByOwner[task.ownerId] = { owner: task.ownerName, tasks: [], first: "" };
      tareasByOwner[task.ownerId].tasks.push(task);
    });

    return await Slack.postMessage(
      this.context.config.slack.bot.bot_access_token,
      "general",
      "Reporte de Tareas Pendientes \n" +
        Object.values(tareasByOwner)
          .map(taskGroup => {
            return taskGroup.owner + " " + taskGroup.tasks.length;
          })
          .join("\n"),
      JSON.stringify(pending)
    );
  }

  async destroy(body) {
    if (!process.env.TESTING && ["staging", "production"].indexOf(process.env.NODE_ENV) > -1)
      var res = await this.context.DynamoDB.table(process.env.NODE_ENV + "Tarea")
        .where("accountTypeId")
        .eq(body.accountTypeId)
        .where("sortKey")
        .eq(body.sortKey)
        .delete();

    console.log(res);
    return { success: true };
  }

  async create(body) {
    var taskId = body.taskId || parseInt(Math.random() * 10000000);
    if (!body.ownerId || !body.ownerName)
      throw new Errors.VALIDATION_ERROR("Escoja un Propietario de la Tarea");
    if (body.description && body.description.length > 0 && body.description.length > 254)
      throw new Errors.VALIDATION_ERROR("Se ha sobrepasado el limite de tamaño del comentario");

    var delta = {};

    try {
      if (body.taskId) {
        var current = await this.context.DynamoDB.table(process.env.NODE_ENV + "Tarea")
          .index("estado")
          .select("comentarios", "name", "fechaVencimiento", "progress", "attachment")
          .where("accountTypeId")
          .eq(this.context.account + "/task/" + body.taskId)
          .where("sortKey")
          .eq(body.sortKey)
          .consistent_read()
          .get();

        Object.keys(current).forEach(key => {
          if (body[key] != current[key]) delta[key] = body[key];
        });
      }
    } catch (e) {
      console.log(e);
    }

    var status = "pendiente" + "-" + body.ownerId;
    if (body.progress == 100) status = "completo" + "-" + body.ownerId;

    var insert1 = {
      ...body,
      account: this.context.account,
      progress: body.progress || 0,
      important: body.important || false,
      urgent: body.urgent || false,
      createdById: body.createdById || this.context.user.id,
      createdBy: body.createdBy || this.context.user.name,
      createdAt: body.createdAt || moment().format("YYYY-MM-DD HH:MM:SS"),
      estadoOwnerId: status,
      description: body.description || "",
      order: body.order || 1000,
      isSection: body.isSection || false,
      accountTypeId: this.context.account + "/task/" + taskId,
      sortKey: body.sortKey || this.context.account + "/" + body.type + "/" + body.id,
      taskId: taskId
    };

    if (!process.env.TESTING && ["staging", "production"].indexOf(process.env.NODE_ENV) > -1) {
      if (body.id)
        await this.context.DynamoDB.table(process.env.NODE_ENV + "Tarea").insert_or_replace(insert1);
    }

    try {
      if (this.context.config.slack && !body.isSection) {
        var owner = this.context.userMap[body.ownerId + ""];
        var createdBy = this.context.userMap[insert1.createdById + ""];

        var message = [
          {
            fallback: "",
            author_name: insert1.createdBy,
            title:
              Object.keys(delta).length > 0
                ? `Cambios a Tarea ${Object.keys(delta).join(" , ")}`
                : "Nueva Tarea",
            title_link: "",
            text: insert1.description,
            fields: [
              { title: "Comentarios", value: insert1.comentarios || "Sin Comentarios", short: false },
              { title: "Archivo", value: insert1.attachment || "Sin Archivos", short: true },
              { title: "Progreso", value: insert1.progress, short: true },
              { title: "Encargado", value: insert1.ownerName, short: true },
              { title: "Vencimiento", value: insert1.fechaVencimiento, short: true },
              { title: "Solicitado Por", value: insert1.createdBy, short: true }
            ],
            footer: `eFactura ${process.env.NODE_ENV}`
          }
        ];
        var res = await Slack.postMessageToChannel(
          this.context.config.slack.bot.bot_access_token,
          owner,
          createdBy,
          insert1.name,
          message
        );
        console.log(res);
      }
    } catch (e) {
      console.log(e.stack);
    }

    return insert1;
  }

  async query(body) {
    if (["staging", "production"].indexOf(process.env.NODE_ENV) == -1)
      return [
        {
          ownerName: "Roberto",
          createdBy: "Juan Carlos",
          action: "create",
          typeid: "1222",
          progress: 50,
          ownerId: 2,
          urgent: false,
          important: true,
          createdById: 3,
          taskId: 151,
          type: "task",
          fechaVencimiento: "2019-07-30",
          createdAt: "2019-11-11 11:33:33",
          name: "Una tarea con el nombre mas corto de lo normal"
        },
        {
          ownerName: "Roberto",
          createdBy: "Juan Carlos",
          action: "create",
          typeid: "1222",
          progress: 50,
          ownerId: 2,
          urgent: false,
          important: true,
          createdById: 3,
          taskId: 15,
          type: "task",
          fechaVencimiento: "2019-07-30",
          createdAt: "2019-11-11 11:33:33",
          name:
            "Cambiar http://google.com los descuentos del cliente A4 i4949 ppor un 5% y lurego visitar el cliente para ver que se piuede hacer en el timepo laro"
        },
        {
          ownerName: "Roberto",
          action: "create",
          ownerId: 2,
          progress: 25,
          createdById: 3,
          createdBy: "Laura",
          urgent: true,
          type: "task",
          important: true,
          typeid: "123224",
          fechaVencimiento: "2019-06-16",
          taskId: 24,
          createdAt: "2019-11-11 11:33:33",
          name: "Section 21",
          isSection: true,
          order: 1
        },
        {
          ownerName: "Pedro",
          action: "create",
          ownerId: 3,
          progress: 25,
          type: "task",
          important: false,
          createdById: 2,
          createdBy: "Roberto",
          typeid: "12322",
          fechaVencimiento: "2019-06-16",
          taskId: 211,
          createdAt: "2019-11-11 11:33:33",
          name: "task 2 ddkjdsjks jkd jkdjkdsjkdsjkd jkd jk",
          order: 2
        }
      ];

    if (!body.type)
      return this.context.DynamoDB.table(process.env.NODE_ENV + "Tarea")
        .index("estado")
        .select(
          "taskId",
          "id",
          "type",
          "accountTypeId",
          "sortKey",
          "section",
          "important",
          "createdById",
          "urgent",
          "attachment",
          "comentarios",
          "description",
          "ownerId",
          "createdBy",
          "ownerName",
          "name",
          "fechaVencimiento",
          "progress",
          "order",
          "isSection"
        )
        .where("account")
        .eq(this.context.account)
        .where("estadoOwnerId")
        .begins_with("pendiente")
        .descending()
        .query();

    return this.context.DynamoDB.table(process.env.NODE_ENV + "Tarea")
      .index("accountTypeId")
      .select(
        "taskId",
        "id",
        "type",
        "important",
        "accountTypeId",
        "sortKey",
        "createdBy",
        "createdById",
        "description",
        "urgent",
        "comentarios",
        "attachment",
        "section",
        "ownerId",
        "ownerName",
        "name",
        "fechaVencimiento",
        "progress",
        "order",
        "isSection"
      )
      .where("sortKey")
      .eq(`${this.context.account}/${body.type}/${body.id}`)
      .descending()
      .query();
  }
}

module.exports = Audit;
