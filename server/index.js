const grpc = require('grpc');
const proto = require('./load');
const {getDefaultArgs} = require('appium/build/lib/parser');
const {AppiumDriver} = require('appium/build/lib/appium');
const log = require('appium/build/lib/logger').default;

const driver = new AppiumDriver(getDefaultArgs());

async function runCommand (call, cb) {
  let {cmdName, sessionId, urlParams, jsonParams} = call.request;
  try {
    jsonParams = JSON.parse(jsonParams.toString('utf-8'));
  } catch (e) {
    return cb(e);
  }

  if (sessionId) {
    urlParams = [sessionId, ...urlParams];
  }
  urlParams.reverse();
  let res;
  try {
    let jsonParamArgs = Object.keys(jsonParams).map(k => jsonParams[k]);
    const args = [...jsonParamArgs, ...urlParams]
    log.info(`Executing command ${cmdName} with args ${JSON.stringify(args)}`);
    res = await driver.executeCommand(cmdName, ...args);
    if (typeof res.value === 'undefined') {
      res.value = null;
    }
    log.info(`Result: ${JSON.stringify(res.value)}`);
    cb(null, {success: {jsonValue: Buffer.from(JSON.stringify(res.value))}});
  } catch (e) {
    log.error(`Encountered error running command: ${e}`);
    cb(null, {error: {error: e.code, msg: e.message}});
  }
}

function main () {
  const server = new grpc.Server();
  server.addService(proto.RunCommand.service, {
    run: runCommand
  });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
  log.info('Server Started');
}

if (module === require.main) {
  main();
}
