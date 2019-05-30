const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const PROTO = path.resolve(__dirname, 'appium.proto');
const packageDef = protoLoader.loadSync(PROTO,
  {keepCase: true, defaults: true, oneofs: true}
);
const protoDesc = grpc.loadPackageDefinition(packageDef);

module.exports = protoDesc;
