var JWT = require("../apiHelpers/jwt");
var errors = require("../errors");
var moment = require("moment");

module.exports = opts => {
  const defaults = {};

  const options = Object.assign({}, defaults, opts);

  return {
    before: (handler, next) => {
      let { context } = handler;

      const User = new UserModel(handler.context);
      return User.check(handler.context.headers)
        .then(userResponse => {
          context.user = userResponse.user;
          context.users = userResponse.users;
          context.userMap = userResponse.usersMap;
          handler.context = context;
          console.log("USER", JSON.stringify(context.user));
          return;
        })
        .catch(e => {
          console.log("Auth Exception", e.stack);
          throw new errors.AUTH_ERROR(e.label || e.message);
        });
    },
    after: null,
    onError: null
  };
};

class UserModel {
  constructor(context) {
    this.context = context;
    this.check = this.check.bind(this);
  }

  async getProfiles(account) {
    return await this.context.DynamoDB.table(process.env.NODE_ENV + "Profile")
      .select("id", "name", "roles")
      .where("account")
      .eq(account)
      .descending()
      .query();
  }

  async getUsers(account) {
    let profiles = await this.getProfiles(account);
    let users = await this.context.DynamoDB.table(process.env.NODE_ENV + "Usuario")
      .select(
        "email",
        "id",
        "roles",
        "profiles",
        "avatar",
        "roles_off",
        "name",
        "account",
        "profile",
        "activo",
        "nivel",
        "comisiona"
      )
      .where("account")
      .eq(account)
      .descending()
      .query();

    var profileMap = {};
    profiles.forEach(profile => {
      if (profile.roles) profileMap[profile.name] = profile.roles.split(",");
    });

    users.forEach(user => {
      if (!user.profiles) user.profiles = "";
      if (!user.roles) user.roles = "";
      if (!user.roles_off) user.roles_off = "";
      user.roles = user.roles.split(",");
      user.profiles = user.profiles.split(",");
      user.roles_off = user.roles_off.split(",");

      user.profiles.forEach(profile => {
        var profileRoles = profileMap[profile];
        if (profileRoles) user.roles = user.roles.concat(profileRoles);
      });
      user.roles.forEach((rol, index) => {
        if (user.roles_off.indexOf(rol) > -1) user.roles.splice(index, 1);
      });
      user.roles = user.roles.join(",");
    });

    return users;
  }

  async getDbUser(users, user, returnSystem) {
    var foundUser = users.filter(loopUser => {
      if (returnSystem && loopUser.name == "Sistema") return true;
      if (user.id == loopUser.id) return true;
      return false;
    });

    //console.log(foundUser);
    if (!foundUser[0] || foundUser[0].activo === false || foundUser[0].activo === 0)
      throw new errors.AUTH_ERROR("El usuario no esta activo.");
    return foundUser[0];
  }

  async check(headers) {
    var user;
    var dbUser;
    var account = headers["x-account"];
    let users = await this.getUsers(account);

    if (headers["x-authorization"]) {
      user = JWT.decode(headers["x-authorization"]);

      dbUser = await this.getDbUser(users, user);

      if (!user.timestamp || !moment().isSame(user.timestamp, "day"))
        throw new errors.AUTH_ERROR("Token Vencido, login de nuevo");

      user.roles = dbUser.roles;
      user.nivel = dbUser.nivel;
      user.account = dbUser.account;

      if (user.account != account) throw new errors.AUTH_ERROR("Account mismatch");
      user.account = headers["x-account"];
    } else if (headers["x-token"]) {
      //console.log("using x-token");
      user = JWT.decode(headers["x-token"]);

      dbUser = await this.getDbUser(users, user, true);
      user.roles = dbUser.roles;
      user.nivel = dbUser.nivel;
      user.account = dbUser.account;
      if (user.account != account) throw new errors.AUTH_ERROR("Account mismatch");
    }

    var userMap = {};
    users.forEach(user => {
      userMap[user.id + ""] = user;
    });
    return { user: dbUser, users: users, usersMap: userMap };
  }
}
