module.exports.options = ['get', 'put'];

module.exports.run = packs => {
  this.packs = packs;
  switch (packs.restType) {
    case 'get':
      this.get()
      break;
    case 'put':
      this.put()
      break;
    default:
      break;
  }
}

module.exports.get = () => {
  this.packs.res.json({ 'type': this.packs.restType });
}

module.exports.put = () => {
  this.packs.res.json({ 'type': this.packs.restType });
}