module.exports = {
  TIMEOUT_ERROR: class SERVER_ERROR extends Error {
    constructor() {
      super();
      this.title = "Operation took too long";
      this.message =
        "The operation took to long and the server had to cancel. Please refresh you data";
      this.solution = "RELOAD";
      this.type = "TIMEOUT_ERROR";
      this.status = 508;
    }
  },

  SERVER_ERROR: class SERVER_ERROR extends Error {
    constructor(message, title) {
      super();
      this.message = message;
      this.title = title || "Server Error";
      this.solution = "RETRY";
      this.type = "SERVER_ERROR";
      this.status = 504;
    }
  },

  DUPLICATE_ERROR: class DUPLICATE_ERROR extends Error {
    constructor(sqlError) {
      super();
      this.message = sqlError.sqlMessage;
      this.title = "Duplicate or Conflict";
      this.type = "DUPLICATE_ERROR";
      this.status = 409;
    }
  },

  INVALID_ERROR: class VALIDATION_ERROR extends Error {
    constructor(message) {
      super();
      this.message = message;
      this.title = "Operation is not valid";
      this.type = "INVALID_OPERATION";
      this.status = 400;
    }
  },

  VALIDATION_ERROR: class VALIDATION_ERROR extends Error {
    constructor(fields) {
      super();
      this.message = "Error in " + fields.join(" ");
      this.title = "Validation Error";
      this.errors = fields;
      this.type = "VALIDATION_ERROR";
      this.status = 400;
    }
  },

  VALIDATION_WITH_FIELDS_ERROR: class VALIDATION_WITH_FIELDS_ERROR extends Error {
    constructor(errorArray, errorsText, body) {
      super();
      this.message = errorsText(errorArray, {
        separator: ","
      }).replace(new RegExp("data.", "g"), "");
      this.title = "Validation Error";
      this.errors = errorArray;
      this.type = "VALIDATION_WITH_FIELDS_ERROR";
      this.status = 400;
    }
  },

  UPDATE_WITHOUT_RESULT: class UPDATE_WITHOUT_RESULT extends Error {
    constructor(table, id) {
      super();
      this.message = `${id} not found on ${table} to update`;
      this.title = "Update Error";
      this.type = "UPDATE_WITHOUT_RESULT";
      this.status = 400;
    }
  },

  ITEM_NOT_FOUND: class ITEM_NOT_FOUND extends Error {
    constructor(table, id = "") {
      super();
      this.message = `${id} not found on ${table}`;
      this.title = "Id not found";
      this.type = "ITEM_NOT_FOUND";
      this.status = 404;
    }
  },

  INTEGRATION_ERROR: class INTEGRATION_ERROR extends Error {
    constructor(message) {
      super();
      this.title = "Developer or Code Error";
      this.message = message;
      this.type = "INTEGRATION_ERROR";
      this.status = 500;
    }
  },

  PERMISSION_ERROR: class PERMISSION_ERROR extends Error {
    constructor(type, key) {
      super();
      this.title = "No Permission";
      this.message = `No ${type} permission for ${key}`;
      this.type = "PERMISSION_ERROR";
      this.status = 403;
    }
  },

  AUTH_ERROR: class AUTH_ERROR extends Error {
    constructor(message, fields) {
      super();

      this.title = "Authentication Error";
      this.message = message;
      this.solution = "ADMIN";
      this.type = "AUTH_ERROR";
      this.status = 401;
    }
  }
};

var errorCodeMap = {
  ACTION_NO_CONTEXT: "Trying to create an action without context",
  RELATION_NOT_FOUND:
    "Relation {relation} can't find property {relation}Id in {table}",
  TOO_BIG_REFERENCE: "Two levels max on query {table}",
  ROW_IS_ARCHIVED: "{id} on {table} is archived, it can't change.",
  VALIDATION_ERROR: "Error in {fields}",
  OPERATION_SECURED_NO_AUTH:
    "Operation {operation} is secure and user is not authenticated",
  EXPIRED_TOKEN: "Token is expired, login again",
  USER_NOT_FOUND: "User {id} not found",
  ENFORCE_SINGLE_ROW: "Select only one row",
  CANT_DELETE_IN_STATE: "Can't delete object in current state",
  WRONG_STATUS: "Unexpected {expectedEstado} status"
};
