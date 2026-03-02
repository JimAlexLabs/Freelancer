// src/utils/logger.js
'use strict';

const { createLogger, format, transports } = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}] ${stack || message}`;
  if (Object.keys(meta).length) {
    log += ` ${JSON.stringify(meta)}`;
  }
  return log;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), logFormat),
      silent: process.env.NODE_ENV === 'test',
    }),
    ...(process.env.NODE_ENV === 'production' ? [
      new DailyRotateFile({
        filename:  path.join('logs', 'app-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize:   '20m',
        maxFiles:  '14d',
        zippedArchive: true,
      }),
      new DailyRotateFile({
        filename:  path.join('logs', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level:     'error',
        maxSize:   '20m',
        maxFiles:  '30d',
        zippedArchive: true,
      }),
    ] : []),
  ],
});

module.exports = logger;
