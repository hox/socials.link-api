module.exports.options = ['get', 'put'];

module.exports.run = packs => {
  packs.res.sendStatus(200);
}