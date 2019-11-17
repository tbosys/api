var errors = require("../errors");
var Parser = require("ua-parser-js");

module.exports = opts => {
  const defaults = {};

  const options = Object.assign({}, defaults, opts);

  return {
    before: (handler, next) => {
      let { event } = handler;
      //console.log("event ", JSON.stringify(event));
      Object.keys(event.headers || []).forEach(headerKey => {
        if (headerKey.toLowerCase) {
          var value = event.headers[headerKey];
          delete event.headers[headerKey];
          event.headers[headerKey.toLowerCase()] = value;
        }
      });
      handler.context.headers = event.headers;

      if (handler.context.headers["user-agent"]) {
        var ua = new Parser(handler.context.headers["user-agent"]);
        handler.context.userAgent = {
          browser: ua.getBrowser(),
          device: ua.getDevice(),
          os: ua.getOS()
        };
      }

      handler.context.userAgent = {};

      if (handler.context.headers["x-forwarded-for"]) {
        var ipValues = handler.context.headers["x-forwarded-for"].split(",");
        handler.context.headers.ip = (ipValues.pop() || "").trim();
      } else {
        handler.context.headers.ip = event.requestContext.identity.sourceIp;
      }

      handler.context.parts = getParts(event.path);

      try {
        if (
          event.body &&
          event.body.length > 1 &&
          typeof event.body == "string"
        )
          event.body = JSON.parse(event.body);
      } catch (e) {}

      const body = Object.assign(
        event.body || {},
        event.queryStringParameters || {},
        {}
      );
      //console.log("payload", JSON.stringify(body));
      event.payload = body;
      handler.event = event;

      console.log("PAYLOAD", JSON.stringify(event.payload, null, 4));

      next();
    },
    after: null,
    onError: null
  };
};

function getParts(path) {
  var parts = path.split("/"); //Parts of the URL
  var last = -1;
  if (
    !parts[parts.length + last] ||
    parts[parts.length + last] == "/" ||
    parts[parts.length + last].length == 0
  )
    last--;

  var method = parts[parts.length + last];
  var operation = parts[parts.length + last - 1];

  return {
    methodName: method,
    operationName: operation
  };
}
