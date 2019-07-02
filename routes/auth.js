module.exports.options = ['put'];

module.exports.run = packs => {
  module.exports.packs = packs;
  switch (packs.restType) {
    case 'put':
      this.put()
      break;
    default:
      break;
  }
}

module.exports.put = () => {
  packs = this.packs;

  class auth extends packs.Sequelize.Model { };
  class user extends packs.Sequelize.Model { };

  auth.init({
    accountId: {
      type: packs.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: packs.Sequelize.STRING,
    password: packs.Sequelize.STRING,
    token: packs.Sequelize.STRING
  }, {
      sequelize: packs.db
    }
  );

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

  auth.sync({ force: false }).then(() => {
    console.debug('[DB] table `auth` synced');
  });

  user.sync({ force: false }).then(() => {
    console.debug('[DB] table `user` synced');
  });

  if (packs.req.body.type == 'login') {
    auth.findAll({
      where: {
        email: packs.req.body.email
      },
      limit: 1
    }).then(values => {
      if (values == 0) {
        packs.res.json({
          error: {
            message: 'The email or password you provided is invalid'
          }
        });
      } else {
        packs.bcrypt.compare(packs.req.body.password, values[0].password, function (err, res) {
          if (res) {
            user.findAll({
              where: {
                accountId: values[0].accountId
              }
            }).then(user => {
              packs.res.json({
                token: values[0].token,
                username: user[0].username
              })
            })
          } else {
            packs.res.json({
              error: {
                message: 'The email or password you provided is invalid'
              }
            });
          }
        });
      }
    });
  } else
    if (packs.req.body.type == 'signup') {
      packs.bcrypt.hash(packs.req.body.password, 10, function (err, hashedPass) {
        auth.findAll({
          where: {
            email: packs.req.body.email
          },
          limit: 1
        }).then(values => {
          if (values.length == 0) {
            let banned_usernames = packs.fs.readFileSync('banned_usernames.txt', 'utf8').split('\n');
            user.findAll({
              where: {
                username: packs.req.body.username
              },
              limit: 1
            }).then(users => {
              if (users.length == 0) {
                if (banned_usernames.includes(packs.req.body.username))
                  return packs.res.json({
                    error: {
                      message: 'The username you provided is not available',
                      reason: 'banned_username'
                    }
                  });

                let token = packs.rtg.generate(32);

                auth.create({
                  email: packs.req.body.email,
                  password: hashedPass,
                  token: token,
                  createdAt: Date.now(),
                  updatedAt: Date.now()
                });

                user.create({
                  username: packs.req.body.username,
                  path: packs.req.body.username,
                  createdAt: Date.now(),
                  updatedAt: Date.now()
                });

                packs.res.json({
                  token: token,
                  username: packs.req.body.username
                });
              } else {
                packs.res.json({
                  error: {
                    message: 'The username you provided is not available',
                    reason: 'taken'
                  }
                });
              }
            });
          } else {
            packs.res.json({
              error: {
                message: 'That email is already in use.'
              }
            });
          }
        });
      });
    }
}