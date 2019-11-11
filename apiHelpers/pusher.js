var Pusher = require("pusher");
var AWS = require("aws-sdk");
var ssm = new AWS.SSM({ apiVersion: "2014-11-06" });
var errors = require("../errors");

const LoadEnv = async function() {
  if (process.env.NODE_ENV == "development") return process.env;

  var params = {
    Names: [
      `/${process.env.NODE_ENV}/PUSHER_APPID`,
      `/${process.env.NODE_ENV}/PUSHER_KEY`,
      `/${process.env.NODE_ENV}/PUSHER_SECRET`
    ],
    WithDecryption: false
  };

  var result = await ssm.getParameters(params).promise();

  var keyMap = {};
  var keys = result.Parameters.forEach(keyItem => {
    var key = keyItem.Name.replace(`/${process.env.NODE_ENV}/`, "");
    keyMap[key] = keyItem.Value;
  });

  return keyMap;
};

module.exports = async function(channel, event, message) {
  const keyMap = await LoadEnv();

  if (!keyMap["PUSHER_APPID"]) return Promise.resolve({});
  //throw new errors.SERVER_ERROR("No se encontro la configuración de PUSHER_APPID");

  var pusher = new Pusher({
    appId: keyMap["PUSHER_APPID"],
    key: keyMap["PUSHER_KEY"],
    secret: keyMap["PUSHER_SECRET"],
    cluster: "us2",
    encrypted: true
  });
  var promise = function(resolve, reject) {
    pusher.trigger(channel, event, message, function() {
      resolve({});
    });
  };

  return new Promise(promise);
};
