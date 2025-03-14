const express = require('express');
const http = require("node:http");
const zlib = require("node:zlib");
const app = express();
const server = http.createServer(app);
const path = require('node:path');
const socketDotio = require("socket.io");
const fs = require("fs");
const socketio = socketDotio(server);
const eventNames = require("./eventNames"); // Freedeck 6.0.0d-rc3

/**
 * These are your settings to change. How do you want Freedeck Lite to appear?
 */
const branding = {
  app_title: "Lite",
  ip: "Ip lol",
  iconCountPerPage: 12,
  mobileDevice: {
    forcedState: false,
    message: "Lite lite lite."
  },
  server_identifier: "freedeck-lite-live",
  versioning: {
    raw: "1.0.0",
    human: "Lite v1.0.0"
  }
}

const overrideCtxlView = {
  view: "library.html",
  data: fs.readFileSync(path.resolve("src/overwrittenView.html"))
}

app.use((req, res, next) => {
  console.log(req.path)
  next()
})

app.get("/companion/views/" + overrideCtxlView.view, (req,res) => {
  res.send(overrideCtxlView.data)
})

// First, we need to provide the status of the webpack compiler
app.get("/connect/webpack", (req,res) => {
  res.send({compiled: 1})
})

app.get("/connect/event-bus", (req,res) => {
  res.send(frequencyMap)
})

app.get("/connect/dev-status", (req,res) => {
  res.send({
    message: branding.mobileDevice.message,
    state: branding.mobileDevice.forcedState
  })
})

app.get("/connect/local-ip", (req, res) => {
  res.send({
    ip: [branding.ip]
  })
});

// Expose the webui
app.use("/companion", express.static("webui/companion"))
app.use("/", express.static("webui/client"))
app.use("/common", express.static("webui/common"))
app.use("/app", express.static("webui/app"))
app.use("/app/shared", express.static("webui/shared"))

const serverInfo = {
  events: eventNames, // This is so the client can align with our events
  id: 1,
  tempLoginID: -1, // Not using auth, so we don't need to do this
  NotificationManager: {},
  hostname: branding.server_identifier,
  soundpacks: ['Futuristic'],
  themes: ['default'],
  mobileConnected: false,
  style: {iconCountPerPage:branding.iconCountPerPage},
  plugins: [],
  disabled: [],
  nbws: true, // Block Companion from trying to open the launcher
  version: {
    raw: branding.versioning.raw,
    human: branding.versioning.human
  },
  config: {profiles:{fdl:[]},profile:"fdl",useAuthentication:false},
};
let serverInfoBuffer;

const frequencyMap = [];
const os = require("os");
socketio.on("connection", (socket) => {
  console.log("SOCKET CONNECTED")
  socket.onAny((e, ...args) => {
    console.log(`Received event ${e} with args ${args}`)
    const event = {
      event: e, 
      recv: Date.now(),
      preParse: {
        loadavg: os.loadavg(),
        freemem: os.freemem(),
        totalmem: os.totalmem()
      },
      postParse: {
        loadAvg: [-1,-1,-1],
        freemem: -1,
        totalmem: -1,
      },
      finishParse: -1,
      deltaParse: 0,
      args
    };
    switch(e) {
      case eventNames.client_greet: {
        // First thing a client will ever send us according to spec
        // We need to identify ourselves as the server by sending a gzipped packet
        socket.username = args;
        if(!serverInfoBuffer) {
          zlib.gzip(JSON.stringify(serverInfo), (err, buffer) => {
            if (err) {
              console.error("Compression error:", err);
              return;
            }
            console.log("Identifying")
            serverInfoBuffer = buffer;
            socket.emit(eventNames.information, buffer);
          });
        } else {
          socket.emit(eventNames.information, serverInfoBuffer);
        }
        break;
      }
      case eventNames.companion.new_tile: {
        require("./impl/createNewTile")({socket,io:socketio,args,eventNames})
        break;
      }
    }
    event.finishParse = Date.now();
    event.deltaParse = Math.abs(event.recv - event.finishParse);
    event.postParse = {
      loadavg: os.loadavg(),
      freemem: os.freemem(),
      totalmem: os.totalmem()
    };
    frequencyMap.push(event)
  })
})

server.listen(5754, () => {
  console.log("Listening on :5754")
})