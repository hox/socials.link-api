module.exports.options = ['get'];

module.exports.run = packs => {
  this.packs = packs;
  switch (packs.restType) {
    case 'get':
      this.get()
      break;
    default:
      break;
  }
}

module.exports.get = () => {
  packs = this.packs;

  class user extends packs.Sequelize.Model { };

  user.init({
    accountId: {
      type: packs.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: packs.Sequelize.STRING,
    path: packs.Sequelize.STRING
  }, {
      sequelize: packs.db
    }
  );

  user.sync({ force: false }).then(() => {
    console.debug('[DB] table `user` synced');
  });

  user.findAll({
    where: {
      username: packs.req.params.username
    },
    limit: 1
  }).then(users => {
    if (users == 0) {
      packs.res.sendStatus(404);
    } else {
      packs.res.sendStatus(200);
    }
  });
}