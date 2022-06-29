const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  joinVoiceChannel
} = require("@discordjs/voice");

const messenger = require("./messenger");
const ytdl = require("ytdl-core");
const search = require("youtube-search");
const config = require("../config.json");

let queue = [];
let voiceConnection;
let player;
let leaveTimeout;


/*
 * =========================================================
 *                         GETTERS
 * =========================================================
 */

const getQueue = () => queue;
const hasVoiceConnection = () => !!voiceConnection;
const hasPlayer = () => !!player;

/*
 * =========================================================
 *                        APPEND QUEUE
 * =========================================================
 */
const appendQueue = async (channel, query, requestor) => {
  let element;
  const option = {
    maxResults: 1,
    key: process.env.YOUTUBE_API_KEY
  };

  if (query.match("www.youtube.com")) {
    /*
     * FROM URL
     */
    let result = await ytdl.getInfo(query);
    element = {
      title: result.videoDetails.title,
      url: result.videoDetails.video_url,
    };
  } else {
    /*
     * FROM TITLE
     */
    let result = await search(query, option);
    element = {
      title: result.results[0].title,
      url: result.results[0].link,
    };
  }
  
  queue.push({
    ...element,
    requestor
  });

  messenger.embed(
    channel,
    `Added media \`${element.title}\``,
    "",
    10 / 60,
    "green"
  );
  // console.log(`Appended ${element.title}`);
};


/*
 * =========================================================
 *                           PLAY
 * =========================================================
 */
const play = (channel, voiceChannel) => {
  /*
   * Create audio player
   */
  if (!player) {
    player = createAudioPlayer();
    player.on(AudioPlayerStatus.Idle, () => {
      console.log(`Idle`);

      queue.shift();
      if (queue.length) play(channel, voiceChannel);

      if (!queue.length) {
        console.log("Setting timout...");

        leaveTimeout = setTimeout(() => {
          player = undefined;
          voiceConnection.destroy();
        console.log("Leaving");
        }, config.timeout * 60 * 1000);
      }
    });

    player.on(AudioPlayerStatus.Playing, () => {
      // console.log(`Playing ${queue[0].title}`);
    });
  }

  /*
   * Create voice connection
   */
  if (!voiceConnection) {
    voiceConnection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    voiceConnection.subscribe(player);
  }
  
  clearTimeout(leaveTimeout);

  if (player.state.status === "idle") {
    messenger.embed(
      channel,
      `Now playing \`${queue[0].title}\``,
      "",
      10 / 60
    );

    let stream = ytdl(queue[0].url, { filter: "audioonly" });
    player.play(createAudioResource(stream));
  }
};


/*
 * =========================================================
 *                           SKIP
 * =========================================================
 */
const skip = () => player.stop();


/*
 * =========================================================
 *                           STOP
 * =========================================================
 */
const stop = () => {
  queue = [];
  player.stop();
}

module.exports = {
  appendQueue,
  getQueue,

  play,
  skip,
  stop,
  
  hasVoiceConnection,
  hasPlayer,
};

/*

node:events:505
      throw er; // Unhandled 'error' event
      ^

AudioPlayerError: aborted
    at connResetException (node:internal/errors:692:14)
    at TLSSocket.socketCloseListener (node:_http_client:414:19)
    at TLSSocket.emit (node:events:539:35)
    at node:net:709:12
    at TCP.done (node:_tls_wrap:582:7)
Emitted 'error' event on AudioPlayer instance at:
    at OggDemuxer.onStreamError (D:\PROGRAMMING\Nodejs\DiscordBotV2\node_modules\@discordjs\voice\dist\index.js:956:14)
    at Object.onceWrapper (node:events:642:26)
    at OggDemuxer.emit (node:events:539:35)
    at emitErrorNT (node:internal/streams/destroy:157:8)
    at emitErrorCloseNT (node:internal/streams/destroy:122:3)
    at processTicksAndRejections (node:internal/process/task_queues:83:21) {
  resource: <ref *3> AudioResource {
    playStream: OggDemuxer {
      _readableState: ReadableState {
        objectMode: true,
        highWaterMark: 16,
        buffer: BufferList {
          head: { data: [Buffer [Uint8Array]], next: [Object] },
          tail: { data: [Buffer [Uint8Array]], next: null },
          length: 312
        },
        length: 312,
        pipes: [],
        flowing: null,
        ended: false,
        endEmitted: false,
        reading: false,
        constructed: true,
        sync: false,
        needReadable: false,
        emittedReadable: false,
        readableListening: false,
        resumeScheduled: false,
        errorEmitted: true,
        emitClose: true,
        autoDestroy: true,
        destroyed: true,
        errored: Error: aborted
            at connResetException (node:internal/errors:692:14)
            at TLSSocket.socketCloseListener (node:_http_client:414:19)
            at TLSSocket.emit (node:events:539:35)
            at node:net:709:12
            at TCP.done (node:_tls_wrap:582:7) {
          code: 'ECONNRESET'
        },
        closed: true,
        closeEmitted: false,
        defaultEncoding: 'utf8',
        awaitDrainWriters: null,
        multiAwaitDrain: false,
        readingMore: false,
        dataEmitted: true,
        decoder: null,
        encoding: null,
        [Symbol(kPaused)]: null
      },
      _events: [Object: null prototype] {
        prefinish: [Function: prefinish],
        close: [ [Function (anonymous)], [Function: onclose] ],
        end: [Function: onend],
        finish: [Function: onfinish],
        error: [Function: onerror]
      },
      _eventsCount: 5,
      _maxListeners: undefined,
      _writableState: WritableState {
        objectMode: false,
        highWaterMark: 16384,
        finalCalled: false,
        needDrain: true,
        ending: false,
        ended: false,
        finished: false,
        destroyed: true,
        decodeStrings: true,
        defaultEncoding: 'utf8',
        length: 73780,
        writing: true,
        corked: 0,
        sync: false,
        bufferProcessing: false,
        onwrite: [Function: bound onwrite],
        writecb: [Function: nop],
        writelen: 73780,
        afterWriteTickInfo: null,
        buffered: [],
        bufferedIndex: 0,
        allBuffers: true,
        allNoop: true,
        pendingcb: 1,
        constructed: true,
        prefinished: false,
        errorEmitted: true,
        emitClose: true,
        autoDestroy: true,
        errored: Error: aborted
            at connResetException (node:internal/errors:692:14)
            at TLSSocket.socketCloseListener (node:_http_client:414:19)
            at TLSSocket.emit (node:events:539:35)
            at node:net:709:12
            at TCP.done (node:_tls_wrap:582:7) {
          code: 'ECONNRESET'
        },
        closed: true,
        closeEmitted: false,
        [Symbol(kOnFinished)]: []
      },
      allowHalfOpen: true,
      _remainder: null,
      _head: null,
      _bitstream: null,
      [Symbol(kCapture)]: false,
      [Symbol(kCallback)]: [Function: bound onwrite]
    },
    edges: [
      <ref *1> {
        type: 'ffmpeg ogg',
        to: Node {
          edges: [ [Object], [Object], [Object] ],
          type: 'ogg/opus'
        },
        cost: 2,
        transformer: [Function: transformer],
        from: Node { edges: [ [Object], [Circular *1] ], type: 'arbitrary' }
      },
      <ref *2> {
        type: 'ogg/opus demuxer',
        to: Node { edges: [ [Object] ], type: 'opus' },
        cost: 1,
        transformer: [Function: transformer],
        from: Node {
          edges: [ [Circular *2], [Object], [Object] ],
          type: 'ogg/opus'
        }
      }
    ],
    metadata: null,
    volume: undefined,
    encoder: undefined,
    audioPlayer: <ref *4> AudioPlayer {
      _events: [Object: null prototype] {
        idle: [Function (anonymous)],
        playing: [Function (anonymous)]
      },
      _eventsCount: 2,
      _maxListeners: undefined,
      _state: {
        status: 'playing',
        missedFrames: 0,
        playbackDuration: 151840,
        resource: [Circular *3],
        onStreamError: [Function: onStreamError],
        silencePacketsRemaining: 1
      },
      subscribers: [
        PlayerSubscription {
          connection: VoiceConnection {
            _events: [Object: null prototype] {},
            _eventsCount: 0,
            _maxListeners: undefined,
            rejoinAttempts: 0,
            _state: [Object],
            joinConfig: [Object],
            packets: [Object],
            receiver: [VoiceReceiver],
            debug: null,
            onNetworkingClose: [Function: bound onNetworkingClose],
            onNetworkingStateChange: [Function: bound onNetworkingStateChange],
            onNetworkingError: [Function: bound onNetworkingError],
            onNetworkingDebug: [Function: bound onNetworkingDebug],
            [Symbol(kCapture)]: false
          },
          player: [Circular *4]
        }
      ],
      behaviors: { noSubscriber: 'pause', maxMissedFrames: 5 },
      debug: [Function (anonymous)],
      [Symbol(kCapture)]: false
    },
    playbackDuration: 151760,
    started: true,
    silencePaddingFrames: 5,
    silenceRemaining: -1
  }
}

*/