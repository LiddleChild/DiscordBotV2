const { Client, Intents } = require("discord.js");

const config = require("../config.json");
const { lists, add, play } = require("./music");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

client.on("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", (message) => {
  let prefix = message.content.slice(0, config.prefix.length);
  let cmd = message.content.slice(config.prefix.length).split(" ")[0].toLowerCase();
  let content = message.content.slice(config.prefix.length + cmd.length + 1);

  let msg = {
    prefix,
    cmd,
    content,
    author: message.author,
    object: message
  };

  if (prefix === config.prefix && !message.author.bot) {
    switch (cmd) {
      case "p":
      case "play":
        if (lists.length === 0) {
          add(msg).then(() => play(msg));
        } else {
          add(msg);
        }
        break;
    }
  }
  
});

client.login(process.env.TOKEN);