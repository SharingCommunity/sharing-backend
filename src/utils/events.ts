const eventsEmiter = require('events').EventEmitter;

const connectionEvents = new eventsEmiter();

export default { connectionEvents };
