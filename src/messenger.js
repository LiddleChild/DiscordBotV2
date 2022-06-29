const { MessageEmbed } = require('discord.js');

const config = require("../config.json");

const embed = (channel, title, content="", time=config.messageTimeout, color="") => {
  c = "";
  switch(color) {
    case "green": c = "#42f57e"; break;
    case "red": c = "#f54242"; break;
    default: c = "#4287f5"; break;
  }

  const msg = new MessageEmbed()
    .setTitle(title)
    .setDescription(content)
    .setColor(c);
  
  channel.send({ embeds: [msg] })
    .then(m => {
      setTimeout(() => {
        m.delete();
      }, time * 1000 * 60);
    });
};

module.exports = {
  embed
};