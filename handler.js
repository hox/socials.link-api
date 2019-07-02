/* Config Load */
require('dotenv').config();

/* Function Changing */
console.debug = (str, ...args) => {
  process.env.logging ? console.log(`[DEBUG] ${str}`, ...args) : null;
}

/* Sequelize (postgres db) */
const Sequelize = require('sequelize');
const rtg = require('rand-token');
const bcrypt = require('bcrypt');

const db = new Sequelize('socialslink', process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false
});

db.authenticate().then(() => {
  console.log('[DB] Connected');
}).catch(err => {
  console.error('[DB] Errored: ', err);
  process.exit(1);
});

/* API Service */
const body_parser = require('body-parser');
const express = require('express');
const fs = require('fs');
const api = express();

api.use(body_parser.json());
api.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

api.disable('x-provided-by');

fs.readdir('routes', (err, files) => {
  if (err) throw err;

  /* Route loading */
  files.forEach(route => {
    console.debug(`[API] Loading file ~ ${route}`)
    let ex = require(`./routes/${route}`);
    ex.options.forEach(restType => {
      api[restType](`/${route.split('.')[0]}`, (req, res) => {
        console.debug(`[API] ${restType.toUpperCase()} ~ /${route.split('.')[0]}`);
        ex.run({
          restType: req.method.toLowerCase(),
          Sequelize: Sequelize,
          bcrypt: bcrypt,
          req: req,
          res: res,
          rtg: rtg,
          db: db,
          fs: fs
        });
      });
    })
  });

  /* Running API */
  api.listen(process.env.API_PORT, () => {
    console.debug('[API] Live on %i', process.env.API_PORT);
  });
});