const { createAudioPlayer, getNextResource, createAudioResource, AudioPlayerStatus, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior } = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const search = require("youtube-search");

let lists = [];

const option = {
  maxResults: 1,
  key: process.env.YOUTUBE_API_KEY
}

const add = async (msg) => {
  let result = await search(msg.content, option);

  let video = {
    link: result.results[0].link,
    title: result.results[0].title,
    channel: result.results[0].channelTitle,
    requestor: msg.author
  };

  lists.push(video);
}

const play = async (msg) => {
  let channel = msg.object.member.voice.channel;

  let connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  const resource = createAudioResource(ytdl(lists[0].link));
  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Playing, () => {
    console.log('The audio player has started playing!');
  });
}

module.exports = { lists, add, play };