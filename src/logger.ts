import * as log4js from 'log4js';
import * as mkdirp from 'mkdirp';
import { addLayout } from 'log4js/lib/layouts';
import { Injectable, Registry } from '@encore/di';
import { LoggerConfig } from './config';
import { Layouts } from './layout';
import { isFileAppender } from './types';
import { AppInfo } from '@encore/base';
import { nodeToPromise } from '@encore/util';

@Injectable({
  autoCreate: { create: true, priority: 0 }
})
export class Logger {

  logger: log4js.Logger;

  constructor(private config: LoggerConfig) { }

  getLogger() {
    return this.logger;
  }

  async postConstruct() {

    for (let layout of Object.keys(Layouts)) {
      addLayout(layout, Layouts[layout]);
    }

    if (this.config.appenders.console) {
      this.bindToConsole();
    }

    log4js.configure({
      appenders: await this.buildAppenders(),
      categories: await this.buildCategories()
    });

    this.logger = log4js.getLogger();
  }

  private async buildAppenders() {
    let appenders = {} as { [key: string]: log4js.Appender };

    for (let name of Object.keys(this.config.appenders)) {
      let conf = (this.config.appenders as any)[name];
      if (!conf.hasOwnProperty('enabled') || conf.enabled) {
        if (isFileAppender(conf)) {
          if (!conf.filename) {
            conf.filename = AppInfo.SIMPLE_NAME;
            if (conf.name) {
              conf.filename += `-${conf.name}`;
            }
            conf.filename += '.log';
          }
          if (!conf.filename!.startsWith('/')) {
            conf.filename = `${process.cwd()}/logs/${conf.filename}`;
            conf.absolute = true;
          }

          // Setup folder for logging
          await nodeToPromise(null, mkdirp, conf.filename!.substring(0, conf.filename!.lastIndexOf('/')));
        }

        if (conf.level) {
          appenders[`_${name}`] = conf;
          conf = {
            type: 'logLevelFilter',
            appender: `_${name}`,
            level: conf.level,
            maxLevel: conf.maxLevel || 'fatal'
          }
        }

        appenders[name] = conf!;
      }
    }

    return appenders;
  }

  private async buildCategories() {
    let categories = Object
      .keys(this.config.categories)
      .reduce((acc, name) => {
        acc[name] = (this.config.categories as any)[name];
        if (typeof acc[name].appenders === 'string') {
          acc[name].appenders = (acc[name].appenders as any as string).split(',').map(x => x.trim())
        }
        return acc;
      }, {} as { [key: string]: log4js.Category })

    return categories;
  }

  private bindToConsole() {
    let override: boolean | null = this.config.appenders.console.replaceConsole;

    if (override === null ? process.env.env !== 'test' : !!override) {
      const logger = log4js.getLogger('console');
      for (let key of ['info', 'warn', 'error', 'debug']) {
        if (key in console && key in logger) {
          (console as any)[key] = (logger as any)[key].bind(logger);

        }
      }
      console.log = logger.info.bind(logger);
    }
  }
}