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

async function runCommand (cmdName, urlParams, jsonParams) {
  const res = await run({
    cmdName: 'getStatus',
    jsonParams: {
      foo: "bar"
    }
  });

  if (res.success) {
    console.log("Success");
    return JSON.parse(res.success.jsonValue);
  } else {
    const e = new Error(`${res.error.error}: ${res.error.msg}`);
    throw e;
  }
}

(async function main() {
  return await runCommand('getStatus');
})().then(console.log).catch(console.log);
