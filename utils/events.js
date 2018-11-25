const eventsEmiter = require("events").EventEmitter;

const connectionEvents = new eventsEmiter();

module.exports = { connectionEvents };
