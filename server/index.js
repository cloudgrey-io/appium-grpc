const grpc = require('grpc');
const proto = require('./load');
const {getDefaultArgs} = require('appium/build/lib/parser');
const {AppiumDriver} = require('appium/build/lib/appium');

const driver = new AppiumDriver(getDefaultArgs());

async function runCommand (call, cb) {
  const {cmdName, sessionId, urlParams, jsonParams} = call.request;
  let res;
  try {
    const args = [...Array.prototype.keys(jsonParams), ...urlParams]
    res = await driver.executeCommand(cmdName, ...args);
    cb(null, {success: {jsonValue: JSON.stringify(res)}});
  } catch (e) {
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
  console.log('Server Started');
}

if (module === require.main) {
  main();
}
