'use strict';

const expect = require('expect.js');
const RamRoleArnCredential = require('../lib/ram_role_arn_credential');
const mm = require('mm');
const utils = require('../lib/util/utils');
const httpUtil = require('../lib/util/http');
const defaultConfig = {
  type: 'ram_role_arn',
  role_arn: 'role_arn',
  access_key_id: 'access_key_id',
  access_key_secret: 'access_key_secret'
};

describe('RamRoleArnCredential with correct config', function () {
  const cred = new RamRoleArnCredential(defaultConfig);
  before(function () {
    mm(httpUtil, 'request', function () {
      return {
        RequestId: '76C9056D-0E40-4ED9-A82E-D69B30E733C8',
        Credentials: {
          AccessKeySecret: 'AccessKeySecret',
          AccessKeyId: 'AccessKeyId',
          Expiration: utils.timestamp(new Date(), 1000 * 3600),
          SecurityToken: 'SecurityToken'
        }
      };
    });
  });
  after(function () {
    mm.restore();
  });
  it('should success', async function () {
    let id = await cred.getAccessKeyId();
    expect(id).to.be('AccessKeyId');
    let secret = await cred.getAccessKeySecret();
    expect(secret).to.be('AccessKeySecret');
    let token = await cred.getSecurityToken();
    expect(token).to.be('SecurityToken');
    let type = cred.getType();
    expect(type).to.be('ram_role_arn');
  });
  it('should refresh credentials with  sessionCredential expired', async function () {
    cred.sessionCredential.Expiration = utils.timestamp(cred.sessionCredential.Expiration, -1100 * 3600);
    let needRefresh = cred.needUpdateCredential();
    expect(needRefresh).to.be(true);
    let token = await cred.getSecurityToken();
    expect(token).to.be('SecurityToken');
  });
  it('should refresh credentials with no sessionCredential', async function () {
    cred.sessionCredential = null;
    let needRefresh = cred.needUpdateCredential();
    expect(needRefresh).to.be(true);
    let secret = await cred.getAccessKeySecret();
    expect(secret).to.be('AccessKeySecret');
    let id = await cred.getAccessKeyId();
    expect(id).to.be('AccessKeyId');
  });
});
describe('RamRoleArnCredential should filed with invalid config ', function () {
  it('should failed when config has no access_key_id', async function () {
    expect(function () {
      new RamRoleArnCredential({
        type: 'ram_role_arn',
        role_arn: 'role_arn',
        access_key_secret: 'access_key_secret',
      });
    }).throwException(/Missing required access_key_id option in config for ram_role_arn/);
  });
  it('should failed when config has no access_key_secret', async function () {
    expect(function () {
      new RamRoleArnCredential({
        type: 'ram_role_arn',
        role_arn: 'role_arn',
        access_key_id: 'access_key_id'
      });
    }).throwException(/Missing required access_key_secret option in config for ram_role_arn/);
  });
  it('should failed when config has no role_arn', async function () {
    expect(function () {
      new RamRoleArnCredential({
        type: 'ram_role_arn',
        access_key_id: 'access_key_id',
        access_key_secret: 'access_key_secret'
      });
    }).throwException(/Missing required role_arn option in config for ram_role_arn/);
  });
});


