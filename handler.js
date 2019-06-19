/* Config Load */
require('dotenv').config();

/* Function Changing */
console.debug = (str, ...args) => {
  process.env.logging ? console.log(`[DEBUG] ${str}`, ...args) : null;
}

/* Sequelize (postgres db) */
const Sequelize = require('sequelize');

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
const express = require('express');
const fs = require('fs');
const api = express();

fs.readdir('routes', (err, files) => {
  if (err) throw err;

  /* Route loading */
  files.forEach(route => {
    console.debug(`[API] Loading file ~ ${route}`)
    let ex = require(`./routes/${route}`);
    ex.options.forEach(restType => {
      api[restType](`/${route.split('.')[0]}`, (req, res) => {
        console.debug(`[API] ${restType.toUpperCase()} ~ /${route.split('.')[0]}`);
        ex.run({ db: db, req: req, res: res });
      });
    })
  });

  /* Running API */
  api.listen(process.env.API_PORT, () => {
    console.debug('[API] Live on %i', process.env.API_PORT);
  });
});