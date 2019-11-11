function _standarizeEvent(event) {
  Object.keys(event.headers || []).forEach(headerKey => {
    if (headerKey.toLowerCase) {
      var value = event.headers[headerKey];
      delete event.headers[headerKey];
      event.headers[headerKey.toLowerCase()] = value;
    }
  });
  try {
    if (event.body && event.body.length > 1 && typeof event.body == "string")
      event.body = JSON.parse(event.body);
  } catch (e) {}
  return event;
}

function _parseAccount(event) {
  var account = event.headers["x-account"];
  if (event.queryStringParameters && event.queryStringParameters.account && !account)
    account = event.queryStringParameters.account;
  return account;
}

function _parsePayload(event) {
  return Object.assign(event.body || {}, event.queryStringParameters || {}, {});
}

async function _parseConfig(context) {
  var results = await context.DynamoDB.table(process.env.NODE_ENV + "Config")
    .where("account")
    .eq(context.account)
    .descending()
    .query();
  return results[0];
}

module.exports = {
  _standarizeEvent: _standarizeEvent,
  _parseAccount: _parseAccount,
  _parsePayload: _parsePayload,
  _parseConfig: _parseConfig
};
