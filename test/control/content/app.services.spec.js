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

    /*LoyaltyAPI.addEditApplication test case*/
    it('LoyaltyAPI.addEditApplication should return success', function () {
      var data ={
          data:"data"
      }

      LoyaltyAPI.addEditApplication(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyApp')
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

    it('LoyaltyAPI.addEditApplication should return null response', function () {
      var data ={
        data:"data"
      }

      LoyaltyAPI.addEditApplication(data);


      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyApp')
          .respond(null);
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.addEditApplication).toEqual('function')

      spyOn(LoyaltyAPI, "addEditApplication").and.callThrough();;
      LoyaltyAPI.addEditApplication(data);
      expect(LoyaltyAPI.addEditApplication).toHaveBeenCalled();
    });

    it('LoyaltyAPI.addEditApplication should return error', function () {
      var data =null;
      LoyaltyAPI.addEditApplication(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyApp')
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

    /*LoyaltyAPI.getApplication test case*/
    it('LoyaltyAPI.getApplication should return success', function () {
      var data = {
        data: "data"
          }, id = "testAppId";
      LoyaltyAPI.getApplication(id);

      $httpBackend
          .when('GET', 'https://loyalty.buildfire.com/api/loyaltyApp/'+id)
          .respond(200, {
            status: "success"
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.getApplication).toEqual('function')

      spyOn(LoyaltyAPI, "getApplication").and.callThrough();;
      LoyaltyAPI.getApplication(id);
      expect(LoyaltyAPI.getApplication).toHaveBeenCalled();
    });

    it('LoyaltyAPI.getApplication should return null response', function () {
      var data = {
        data: "data"
      }, id = "testAppId";
      LoyaltyAPI.getApplication(id);

      $httpBackend
          .when('GET', 'https://loyalty.buildfire.com/api/loyaltyApp/'+id)
          .respond(null);
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.getApplication).toEqual('function')

      spyOn(LoyaltyAPI, "getApplication").and.callThrough();;
      LoyaltyAPI.getApplication(id);
      expect(LoyaltyAPI.getApplication).toHaveBeenCalled();
    });

    it('LoyaltyAPI.getApplication should return error', function () {
      var data = {
        data: "data"
      }, id = null;
      LoyaltyAPI.getApplication(id);

      $httpBackend
          .when('GET', 'https://loyalty.buildfire.com/api/loyaltyApp/'+id)
          .respond(500, {
            status: null
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.getApplication).toEqual('function')

      spyOn(LoyaltyAPI, "getApplication").and.callThrough();;
      LoyaltyAPI.getApplication(id);
      expect(LoyaltyAPI.getApplication).toHaveBeenCalled();
    });

    /*LoyaltyAPI.addReward test case*/
    it('LoyaltyAPI.addReward should return success', function () {
      var data = {
        data:"data  "
      }, id = "testAppId";
      LoyaltyAPI.addReward(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyRewards',data)
          .respond(200, {
            status: "success"
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.addReward).toEqual('function')

      spyOn(LoyaltyAPI, "addReward").and.callThrough();;
      LoyaltyAPI.addReward(data);
      expect(LoyaltyAPI.addReward).toHaveBeenCalled();
    });

    it('LoyaltyAPI.addReward should return null response', function () {
      var data = {
        data:"data  "
      }, id = "testAppId";
      LoyaltyAPI.addReward(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyRewards',data)
          .respond(null);
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.addReward).toEqual('function')

      spyOn(LoyaltyAPI, "addReward").and.callThrough();;
      LoyaltyAPI.addReward(data);
      expect(LoyaltyAPI.addReward).toHaveBeenCalled();
    });

    it('LoyaltyAPI.addReward should return error', function () {
      var data = null, id = "testAppId";
      LoyaltyAPI.addReward(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyRewards',data)
          .respond(500, {
            status: null
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.addReward).toEqual('function')

      spyOn(LoyaltyAPI, "addReward").and.callThrough();;
      LoyaltyAPI.addReward(data);
      expect(LoyaltyAPI.addReward).toHaveBeenCalled();
    });

    /*LoyaltyAPI.getRewards test case*/
    it('LoyaltyAPI.getRewards should return success', function () {
      var data = {
        data:"data  "
      }, id = "testAppId";
      LoyaltyAPI.getRewards(id);

      $httpBackend
          .when('GET', 'https://loyalty.buildfire.com/api/loyaltyRewards/'+id)
          .respond(200, {
            status: "success"
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.getRewards).toEqual('function')

      spyOn(LoyaltyAPI, "getRewards").and.callThrough();;
      LoyaltyAPI.getRewards(id);
      expect(LoyaltyAPI.getRewards).toHaveBeenCalled();
    });

    it('LoyaltyAPI.getRewards should return error', function () {
      var data = {
        data:"data  "
      }, id = null;
      LoyaltyAPI.getRewards(id);

      $httpBackend
          .when('GET', 'https://loyalty.buildfire.com/api/loyaltyRewards/'+id)
          .respond(500, {
            status: null
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.getRewards).toEqual('function')

      spyOn(LoyaltyAPI, "getRewards").and.callThrough();;
      LoyaltyAPI.getRewards(id);
      expect(LoyaltyAPI.getRewards).toHaveBeenCalled();
    });

    /*LoyaltyAPI.updateReward test case*/
    it('LoyaltyAPI.updateReward should return success', function () {
      var data = {
        data:"data  "
      }, id = "testAppId";
      LoyaltyAPI.updateReward(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyRewards',data)
          .respond(200, {
            status: "success"
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.updateReward).toEqual('function')

      spyOn(LoyaltyAPI, "updateReward").and.callThrough();;
      LoyaltyAPI.updateReward(data);
      expect(LoyaltyAPI.updateReward).toHaveBeenCalled();
    });

    it('LoyaltyAPI.updateReward should return error', function () {
      var data = {
        data:null
      }, id = "testAppId";
      LoyaltyAPI.updateReward(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyRewards',data)
          .respond(500, {
            status: null
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.updateReward).toEqual('function')

      spyOn(LoyaltyAPI, "updateReward").and.callThrough();;
      LoyaltyAPI.updateReward(data);
      expect(LoyaltyAPI.updateReward).toHaveBeenCalled();
    });

    /*LoyaltyAPI.removeReward test case*/
    it('LoyaltyAPI.removeReward should return success', function () {
      var data = {
        data:"data",
        appId: "testAppID",
        userToken:"testUserToken",
        auth:"testAuth"
      }, id = "testAppId";
      LoyaltyAPI.removeReward(id,data);

      $httpBackend
          .when('DELETE', 'https://loyalty.buildfire.com/api/loyaltyRewards/'+id+'?appId='+data.appId+'&userToken='+data.userToken+'&auth='+data.auth)
          .respond(200, {
            status: "success"
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.removeReward).toEqual('function')

      spyOn(LoyaltyAPI, "removeReward").and.callThrough();;
      LoyaltyAPI.removeReward(id,data);
      expect(LoyaltyAPI.removeReward).toHaveBeenCalled();
    });

    it('LoyaltyAPI.removeReward should return null response', function () {
      var data = {
        data:"data",
        appId: "testAppID",
        userToken:"testUserToken",
        auth:"testAuth"
      }, id = "testAppId";
      LoyaltyAPI.removeReward(id,data);

      $httpBackend
          .when('DELETE', 'https://loyalty.buildfire.com/api/loyaltyRewards/'+id+'?appId='+data.appId+'&userToken='+data.userToken+'&auth='+data.auth)
          .respond(null);
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.removeReward).toEqual('function')

      spyOn(LoyaltyAPI, "removeReward").and.callThrough();;
      LoyaltyAPI.removeReward(id,data);
      expect(LoyaltyAPI.removeReward).toHaveBeenCalled();
    });

    it('LoyaltyAPI.removeReward should return error', function () {
      var data = {
        data:"data",
        appId: "testAppID",
        userToken:"testUserToken",
        auth:"testAuth"
      }, id = null;
      LoyaltyAPI.removeReward(id,data);

      $httpBackend
          .when('DELETE', 'https://loyalty.buildfire.com/api/loyaltyRewards/'+id+'?appId='+data.appId+'&userToken='+data.userToken+'&auth='+data.auth)
          .respond(500, {
            status: null
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.removeReward).toEqual('function')

      spyOn(LoyaltyAPI, "removeReward").and.callThrough();;
      LoyaltyAPI.removeReward(id,data);
      expect(LoyaltyAPI.removeReward).toHaveBeenCalled();
    });

    /*LoyaltyAPI.sortRewards test case*/
    it('LoyaltyAPI.sortRewards should return success', function () {
      var data = {
        data:"data"
      }, id = "testAppId";
      LoyaltyAPI.sortRewards(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyRewardsSort',data)
          .respond(200, {
            status: "success"
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.sortRewards).toEqual('function')

      spyOn(LoyaltyAPI, "sortRewards").and.callThrough();;
      LoyaltyAPI.sortRewards(data);
      expect(LoyaltyAPI.sortRewards).toHaveBeenCalled();
    });

    it('LoyaltyAPI.sortRewards should return error', function () {
      var data = {
        data:null
      }, id = "testAppId";
      LoyaltyAPI.sortRewards(data);

      $httpBackend
          .when('POST', 'https://loyalty.buildfire.com/api/loyaltyRewardsSort',data)
          .respond(500, {
            status: null
          });
      $httpBackend.flush();
      $rootScope.$digest();

      expect(typeof LoyaltyAPI.sortRewards).toEqual('function')

      spyOn(LoyaltyAPI, "sortRewards").and.callThrough();;
      LoyaltyAPI.sortRewards(data);
      expect(LoyaltyAPI.sortRewards).toHaveBeenCalled();

    });

    /*Context.getContext test case*/
    it('it should pass when Context.getContext is called', function () {
      Context.getContext();
    });
  });

});

