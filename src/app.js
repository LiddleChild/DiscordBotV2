const { Client, Intents } = require("discord.js");

const config = require("../config.json");
const player = require("./player");
const messenger = require("./messenger");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

client.on("ready", () => {
  console.log("Connected to client");  
});

client.on("messageCreate", async (message) => {
  let prefix = message.content.slice(0, config.prefix.length);
  let cmd = message.content.slice(config.prefix.length).split(" ")[0].toLowerCase();
  let content = message.content.slice(config.prefix.length + cmd.length + 1);
  let voiceChannel = message.member.voice.channel;

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
        if (!voiceChannel) {
          messenger.embed(
            message.channel,
            "Please join voice channel to start playing media.",
            "",
            10 / 60,
            "red"
          );
          break;
        }
        await player.appendQueue(message.channel, msg.content, msg.author);
        player.play(message.channel, voiceChannel);
        break;
      
      case "s":
      case "skip":
        player.skip();
        break;
      
      case "stop":
        player.stop();
        break;

      case "q":
      case "queue":
        let lists = player.getQueue();
        let title = "", text = "";
        if (lists.length) {
            title = `**>** ${lists[0].title}`;
    
            for (let i = 1; i < lists.length; i++) {
                text += `**${i}**. ${lists[i].title}\n`;
            }
        } else text = "**EMPTY**";

        messenger.embed(message.channel, title, text);
        break;
    }
  }
  
});

client.login(process.env.TOKEN);