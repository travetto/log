import { Config } from '@encore2/config';

@Config('logging')
export class LoggerConfig {

  appenders = {
    console: {
      type: 'console',
      enabled: true,
      replaceConsole: null,
      level: 'info',
      layout: {
        type: 'standard',
        timestamp: true,
        colorize: true,
        align: true,
        prettyPrint: true
      },
    },
    log: {
      name: 'out',
      type: 'file',
      enabled: true,
      filename: '',
      layout: { type: 'json' },
      level: 'info'
    },
    error: {
      name: 'error',
      type: 'file',
      enabled: true,
      filename: '',
      layout: { type: 'json' },
      level: 'error'
    }
  };

  categories = {
    default: {
      appenders: 'console,log,error',
      level: 'trace'
    },
    console: {
      appenders: 'console',
      level: 'trace'
    }
  };

}