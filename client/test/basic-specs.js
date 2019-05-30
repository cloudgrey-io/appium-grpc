const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {AppiumDriver} = require('..');
const HOST = 'localhost';
const PORT = 50051;
const APP = path.resolve(__dirname, 'app.xml');

chai.should();
chai.use(chaiAsPromised);

describe('appium-grpc node client', function () {
  it('should create a session', async function () {
    const d = new AppiumDriver({host: HOST, port: PORT});
    await d.createSession({platformName: 'Fake', platformVersion: 'Fake', automationName: 'Fake', deviceName: 'FakeDevice', app: APP});
    await d.source().should.eventually.contain('<MockText');
    await d.deleteSession();
  });
});
