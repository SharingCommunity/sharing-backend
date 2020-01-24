import { createLogger, transports, format } from 'winston';
const { timestamp, combine, printf, colorize } = format;

const errorLogTransport = new transports.File({
  filename: 'error.log',
  level: 'error',
});
const combinedLogTransport = new transports.File({ filename: 'combined.log' });

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'MM/DD/YYYY, hh:mm:ss' }),
    myFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    errorLogTransport,
    combinedLogTransport,
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), timestamp(), myFormat),
    })
  );
  logger.remove(combinedLogTransport);
}

export default logger;
