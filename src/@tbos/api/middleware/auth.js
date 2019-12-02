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
          throw new errors.AUTH_ERROR(e.label || e.message, 2);
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

  async getUserData(ownerId) {
    let users = await this.context.knex
      .table("owner")
      .select(
        "owner.email",
        "owner.id",
        "owner.avatar",
        "owner.name",
        "owner.active",
        "owner.shareLevel"
      )
      .where("active", true);

    const lineProfiles = await this.context.knex
      .table("profile")
      .select("profile.id", "profile.roles", "profile.name")
      .innerJoin("profileOwner", "profileOwner.profileId", "profile.id")
      .where({ "profileOwner.ownerId": ownerId });

    const user = users.filter(item => {
      return item.id == ownerId;
    })[0];

    user.roles = [];

    lineProfiles.forEach(item => {
      user.roles = user.roles.concat(item.roles);
    });

    return { users, user };
  }

  async check(headers) {
    if (headers["authorization"]) {
      var userToken = JWT.decode(headers["authorization"]);
      const { user, users } = await this.getUserData(userToken.id);
      if (!user) throw new errors.AUTH_ERROR("USER_NOT_FOUND", [userToken.id]);
      if (!userToken.timestamp || !moment().isSame(userToken.timestamp, "day"))
        throw new errors.AUTH_ERROR("EXPIRED_TOKEN");

      const usersMap = users.reduce(function(map, obj) {
        map[obj.id] = obj.val;
        return map;
      }, {});
      return { user, users, usersMap };
    }
    return {};
  }
}
