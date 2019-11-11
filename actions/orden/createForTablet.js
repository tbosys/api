var Errors = require("../../errors");
var BaseAction = require("../../operation/baseAction");
var Slack = require("../../apiHelpers/slack");
var numeral = require("numeral");
module.exports = class DefaultCreateAction extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    try {
      this.cliente = await this.knex
        .table("cliente")
        .first("id", "name", "direccion")
        .where("id", this.body.clienteId);
      await this.reportToSlack();
    } catch (e) {}

    if (this.body.ordenLinea.lenght <= 12) return this.getActionAndInvoke("orden", "create", this.body);

    var pedidoLineas2 = this.body.ordenLinea.slice(12) || [];

    this.body.ordenLinea = this.body.ordenLinea.slice(0, 12);
    await this.getActionAndInvoke("orden", "create", this.body);

    if (pedidoLineas2.length > 0)
      await this.getActionAndInvoke("orden", "create", {
        ...this.body,
        name: (this.body.name || "") + "-1",
        ordenLinea: pedidoLineas2
      });
    return { success: true };
  }
  //g
  async reportToSlack() {
    if (!this.body._metadata) this.body._metadata = {};

    var blocks = [
      {
        type: "section",
        text: {
          type: "plain_text",
          emoji: true,
          text: `Resumen de ${this.body._metadata.canal}-${this.body._metadata.iniciador} ₡${numeral(
            this.body._metadata.total
          ).format(0, 0.0)} (${this.body._metadata.total6013}Kg Hilco) - ${this.user.name}`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<fakeLink.toUserProfiles.com|${this.cliente.name}>*\n${
            this.cliente.direccion
          }\nNivel Hilco: ${this.body._metadata.totalCicloUnidadG1}Kg (+${this.body._metadata.ajuste6013}Kg)`
        },
        accessory: {
          type: "image",
          image_url: "https://api.slack.com/img/blocks/bkb_template_images/notifications.png",
          alt_text: "calendar thumbnail"
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "image",
            image_url: "https://api.slack.com/img/blocks/bkb_template_images/notificationsWarningIcon.png",
            alt_text: "notifications warning icon"
          },
          {
            type: "mrkdwn",
            text: `${this.body._metadata.priceGroups
              .map(pg => `${pg.name} ${pg.tipoNegociacion || ""}`)
              .join(" & ")} *${(this.body._metadata.oferta || "").replace("Faltan", "Faltaron")}*`
          }
        ]
      },
      {
        type: "divider"
      },

      this.body._metadata.location
        ? {
            type: "image",
            title: {
              type: "plain_text",
              text: "Lugar de creación del pedido"
            },
            image_url: `https://maps.googleapis.com/maps/api/staticmap?center=${
              this.body._metadata.location.latitude
            }+${
              this.body._metadata.location.longitude
            }&zoom=9&scale=2&size=500x250&maptype=roadmap&key=AIzaSyAhYbaA74wTMbVjvqsxVXYCAthpsiTOY2w&format=png&visual_refresh=true&markers=size:mid%7Ccolor:0xff0000%7Clabel:1%7C${
              this.body._metadata.location.latitude
            }+${this.body._metadata.location.longitude}`,
            alt_text: "Mapa"
          }
        : {
            type: "divider"
          }
    ];
    //s
    var message = [
      {
        fallback: "",
        text: "",
        fields: this.body.ordenLinea.map(item => {
          return {
            title: item.__productoId,
            value: `${item.cantidad}@${item.descuentoUnitario}% ${item.tipoNegociacion}`
          };
        }),
        footer: `eFactura ${process.env.NODE_ENV}`
      }
    ];
    await Slack.postMessage(
      this.context.config.slack.bot.bot_access_token,
      "CLZQ7TDEE",
      "Nuevo Pedido",
      message,
      blocks
    );
  }
  // }
};
