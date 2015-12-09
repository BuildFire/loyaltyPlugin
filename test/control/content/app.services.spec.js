describe('Unit : loyaltyPluginContent content services', function () {
  describe('Unit: Buildfire Provider', function () {
    var Buildfire;
    beforeEach(module('loyaltyPluginContent'));

    beforeEach(inject(function (_Buildfire_) {
      Buildfire = _Buildfire_;
    }));

    it('Buildfire should exist and be an object', function () {
      expect(typeof Buildfire).toEqual('object');
    });
  });
  describe('Unit : DataStore Factory', function () {
    var Buildfire, STATUS_MESSAGES, STATUS_CODE, q;
    beforeEach(module('loyaltyPluginContent'));
    beforeEach(inject(function (_STATUS_CODE_, _STATUS_MESSAGES_) {
       STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      Buildfire = {
        datastore: {}
      };
      Buildfire.datastore = jasmine.createSpyObj('Buildfire', ['LoyaltyAPI']);
    }));

    it('Buildfire should exist and be an object', function () {
      expect(typeof Buildfire).toEqual('object');
    });

  });
});

