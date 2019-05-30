const path = require('path');
const B = require('bluebird');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const PROTO = path.resolve(__dirname, '..', 'server', 'appium.proto');

const packageDef = protoLoader.loadSync(PROTO,
  {keepCase: true, defaults: true, oneofs: true}
);
const protoDesc = grpc.loadPackageDefinition(packageDef);
const runClient = new protoDesc.RunCommand('localhost:50051', grpc.credentials.createInsecure());
const run = B.promisify(runClient.run, {context: runClient});

const DEF_HOST = "localhost";
const DEF_PORT = 50051;


class AppiumDriver {
  constructor ({host = DEF_HOST, port = DEF_PORT}) {
    this.host = host;
    this.port = port;
    this.sessionId = null;
  }

  async runCommand (cmdName, urlParams = [], jsonParams = {}) {
    jsonParams = JSON.stringify(jsonParams);
    const res = await run({
      cmdName,
      sessionId: this.sessionId || "",
      urlParams,
      jsonParams: Buffer.from(jsonParams),
    });

    if (res.success) {
      return JSON.parse(res.success.jsonValue.toString('utf8'));
    } else {
      const e = new Error(`${res.error.error}: ${res.error.msg}`);
      throw e;
    }
  }

  async createSession (caps) {
    const res = await this.runCommand('createSession', [], {
      desiredCapabilities: {},
      requiredCapabilities: {},
      capabilities: {
        alwaysMatch: caps,
        firstMatch: [],
      }
    });
    this.sessionId = res[0];
  }

  async source () {
    return await this.runCommand('getPageSource');
  }

  async deleteSession () {
    await this.runCommand('deleteSession');
  }
}

module.exports = {AppiumDriver};
