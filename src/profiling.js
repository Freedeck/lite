const os = require("os");

const prof = {
  _map: {},
  _finished: [],
  received: (e, args) => {
    const randomId = Math.random().toString(36).substring(2, 15);
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
    prof._map[randomId] = event;
    return randomId;
  },
  finish: (id) => {
    const event = prof._map[id];
    event.finishParse = Date.now();
    event.deltaParse = Math.abs(event.recv - event.finishParse);
    event.postParse = {
      loadavg: os.loadavg(),
      freemem: os.freemem(),
      totalmem: os.totalmem()
    };
    prof._finished.push(event)
  }
}

module.exports = prof;