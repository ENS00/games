const phrases = ['Stealing blocks from the market...']
module.exports.getRandomPhrase = _=>{
  let dim=phrases.length-1;
  return phrases[Math.round(Math.random()*dim)]
}