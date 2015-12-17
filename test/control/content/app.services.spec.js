describe('Unit : loyaltyPluginContent content services', function () {
  describe('Unit: Buildfire Provider', function () {

    var DataStore, Buildfire, $rootScope, TAG_NAMES, STATUS_MESSAGES, STATUS_CODE, q, LoyaltyAPI, $http, $httpBackend, ViewStack, RewardCache, Context;
    beforeEach(module('loyaltyPluginContent', function ($provide) {
      $provide.service('Buildfire', function () {
        this.LoyaltyAPI = jasmine.createSpyObj('LoyaltyAPI', ['addEditApplication','getApplication', 'getRewards','getLoyaltyPoints','addLoyaltyPoints','validatePasscode','redeemPoints']);
      });
    }));

    beforeEach(inject(function (_Buildfire_) {
      Buildfire = _Buildfire_;
    }));

    it('Buildfire should exist and be an object', function () {
      expect(typeof Buildfire).toEqual('object');
    });

    beforeEach(inject(function (_$rootScope_, _Buildfire_, _LoyaltyAPI_, _$httpBackend_, _$http_,_RewardCache_, _Context_) {
      $rootScope = _$rootScope_;
      Buildfire = _Buildfire_;
      LoyaltyAPI = _LoyaltyAPI_;
      $httpBackend = _$httpBackend_;
      RewardCache = _RewardCache_;
      Context = _Context_;
    }));

    it('LoyaltyAPI.addEditApplication should return success', function () {
      var data ={
    data:"data"
      }

      LoyaltyAPI.addEditApplication(data);

      $httpBackend
          .when('POST', 'http://loyalty.kaleoapps.com/api/loyaltyApp')
          .respond(200, {
            status: "success"
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.addEditApplication).toEqual('function')

      spyOn(LoyaltyAPI, "addEditApplication").and.callThrough();;
      LoyaltyAPI.addEditApplication(data);
      expect(LoyaltyAPI.addEditApplication).toHaveBeenCalled();
    });
    it('LoyaltyAPI.addEditApplication should return success', function () {
      var data =null;
      LoyaltyAPI.addEditApplication(data);

      $httpBackend
          .when('POST', 'http://loyalty.kaleoapps.com/api/loyaltyApp')
          .respond(500, {
            status: null
          });

      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.addEditApplication).toEqual('function')

      spyOn(LoyaltyAPI, "addEditApplication").and.callThrough();;
      LoyaltyAPI.addEditApplication(data);
      expect(LoyaltyAPI.addEditApplication).toHaveBeenCalled();

    });
  });
});

