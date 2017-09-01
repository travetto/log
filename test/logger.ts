import 'mocha';

import * as process from 'process';
import { expect } from 'chai';
import * as fs from 'fs';
import { Logger } from '../src';
import { nodeToPromise } from '@encore/util';
import { Registry } from '@encore/di';

let name = process.cwd() + '/logs/encore_logging-out.log';

describe('Logging', () => {

  before(async () => {
    try {
      return await nodeToPromise<void>(fs, fs.truncate, name);
    } catch (e) {
      // Do nothing
    }
  });

  it('Should log', async () => {
    let logger = (await Registry.getInstance(Logger)).getLogger();

    logger.info('Hello world');
    let contents = await nodeToPromise(fs, fs.readFile, name);
    expect(contents.toString()).to.contain('Hello world');
  });
});