import {
    AutojoinRoomsMixin,
    LogLevel,
    LogService,
    MatrixClient,
    RichConsoleLogger,
    SimpleFsStorageProvider
} from "matrix-bot-sdk";
import * as path from "path";
import config from "./config";
import CommandHandler from "./commands/handler";
import web from "./web";

// First things first: let's make the logs a bit prettier.
LogService.setLogger(new RichConsoleLogger());

// For now let's also make sure to log everything (for debugging)
LogService.setLevel(LogLevel.INFO);

// Print something so we know the bot is working
LogService.info("index", "Bot starting...");

// Prepare the storage system for the bot
const storage = new SimpleFsStorageProvider(path.join(config.dataPath, "bot.json"));

// Create the client
const client = new MatrixClient(config.homeserverUrl, config.accessToken, storage);

// Setup the autojoin mixin (if enabled)
if (config.autoJoin) {
    AutojoinRoomsMixin.setupOnClient(client);
}

// Prepare the command handler
const commands = new CommandHandler(client);

client.on("room.message", onMessage);

let handledEvents = {};

function onMessage(roomId, event) {
    if (event.sender !== config.pollbot) {
        return;
    }
    handledEvents[event.event_id] = {roomId: roomId};
    console.log("onMessage");
    
    let formattedBodyLines = event.content.formatted_body.split('\n');
    console.log(JSON.stringify(formattedBodyLines[5]).split("<br>"));
}

let interval = setInterval(async function() {
    console.log(handledEvents);
    Object.keys(handledEvents).forEach(async function(eventId) {
        let roomId = handledEvents[eventId].roomId;
        let event = await getEvent(roomId, eventId);

        let bodyLines = event.content.body.split('\n');
        handledEvents[eventId].question = 
            bodyLines[2].replace("Question: ", "").trim();

        let formattedBodyLines = event.content.formatted_body.split('\n');
        let line5 = formattedBodyLines[5].split("<br>");
        line5.pop();
        let options = {};
        line5.forEach(option => {
            option.replace('\t', '');
            option = option.split(": ");
            options[option[0].trim()] = {name: option[1].trim()};
        });

        let votes = event.unsigned['m.relations']['m.annotation'].chunk
        
        votes.forEach(vote => {
            if (vote.type !== "m.reaction") {
                return;
            }
            options[vote.key].count = vote.count;
        });
        handledEvents[eventId].votes = options;
        //[ '\t🌊: option 2', '❤: ️ option 1', '' ]

    })
}, 2000);

async function getEvent(roomId, eventId) {
    var event = await client.getEvent(roomId, eventId);
    return event;
}

// This is the startup closure where we give ourselves an async context
(async function () {
    await commands.start();
    LogService.info("index", "Starting sync...");
    await client.start(); // This blocks until the bot is killed
    web(handledEvents);
})();
