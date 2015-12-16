describe('Unit : loyaltyPluginWidget design services', function () {

  describe('Unit : DataStore Factory', function () {
    var DataStore, Buildfire, $rootScope, TAG_NAMES, STATUS_MESSAGES, STATUS_CODE, q, LoyaltyAPI, $http, $httpBackend, ViewStack, RewardCache, Context;
    beforeEach(module('loyaltyPluginWidget', function ($provide) {
      $provide.service('Buildfire', function () {
        this.LoyaltyAPI = jasmine.createSpyObj('LoyaltyAPI', ['addApplication','getApplication', 'getRewards','getLoyaltyPoints','addLoyaltyPoints','validatePasscode','redeemPoints']);
      });
    }));
    beforeEach(inject(function (_$rootScope_, _DataStore_, _Buildfire_, _TAG_NAMES_, _STATUS_CODE_, _STATUS_MESSAGES_, _LoyaltyAPI_, _$httpBackend_, _$http_,_ViewStack_,_RewardCache_, _Context_) {
      $rootScope = _$rootScope_;
      DataStore = _DataStore_;
      Buildfire = _Buildfire_;
      TAG_NAMES = _TAG_NAMES_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      LoyaltyAPI = _LoyaltyAPI_;
      $httpBackend = _$httpBackend_;
        ViewStack = _ViewStack_;
        RewardCache = _RewardCache_;
        Context = _Context_;
    }));


      it('LoyaltyAPI.addApplication should return success', function () {
          var data ={
              data:"data"
          }
          LoyaltyAPI.addApplication(data);

          $httpBackend
              .when('POST', 'http://loyalty.kaleoapps.com/api/loyaltyApp')
              .respond(200, {
                  status: "success"
              });

          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.addApplication should return success', function () {
          var data =null;
          LoyaltyAPI.addApplication(data);

          $httpBackend
              .when('POST', 'http://loyalty.kaleoapps.com/api/loyaltyApp')
              .respond(500, {
                  status: null
              });

          $httpBackend.flush();
          $rootScope.$digest();
      });

    it('LoyaltyAPI.getApplication should return success', function () {
        LoyaltyAPI.getApplication('');

        $httpBackend
            .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyApp/', {
        })
            .respond(200, { data: 'value' });

    $httpBackend.flush();
    $rootScope.$digest();
    });

      it('LoyaltyAPI.getApplication should return success', function () {
          LoyaltyAPI.getApplication('');

          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyApp/', {
              })
              .respond(500, { data: null });

          $httpBackend.flush();
          $rootScope.$digest();
      });


      it('LoyaltyAPI.getRewards should return success', function () {
          LoyaltyAPI.getRewards('e22494ec-73ea-44ac-b82b-75f64b8bc535');
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyRewards/e22494ec-73ea-44ac-b82b-75f64b8bc535', {
              })
              .respond(200, {
                  status: "success"
              });
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.getRewards should return fail', function () {
          LoyaltyAPI.getRewards('');
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyRewards/', {
              })
              .respond(500, {
                  status: null
              });

          /*Some anonymous functions call*/
          ViewStack.push(view.template)
          ViewStack.pop()
          ViewStack.getCurrentView()
          RewardCache.getReward();
          RewardCache.setApplication(view);
          RewardCache.getApplication();
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('Context.getContext should return success', function () {
          Context.getContext();
          var event = null;
          $rootScope.$digest();
           });

      it('LoyaltyAPI.getLoyaltyPoints should return success', function () {
          LoyaltyAPI.getLoyaltyPoints("557c6567c8faa5ec0f003728","EqrMk/nVWw3Qqwjikn277vxqp2JNTSreFbQdrq+zqEo=",'1450083424880-07702731736935675');
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyUser/557c6567c8faa5ec0f003728?userToken=EqrMk%2FnVWw3Qqwjikn277vxqp2JNTSreFbQdrq%2BzqEo%3D&loyaltyUnqiueId=1450083424880-07702731736935675', {
              })
              .respond(200, {
                  status: "success"
              });
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.getLoyaltyPoints should return fail', function () {
          var userid = null;
          LoyaltyAPI.getLoyaltyPoints(userid,"EqrMk/nVWw3Qqwjikn277vxqp2JNTSreFbQdrq+zqEo=",'1450083424880-07702731736935675');
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyUser/'+userid+'?userToken=EqrMk%2FnVWw3Qqwjikn277vxqp2JNTSreFbQdrq%2BzqEo%3D&loyaltyUnqiueId=1450083424880-07702731736935675', {
              })
              .respond(500, {
                  status: null
              });
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.addLoyaltyPoints should return success', function () {
          LoyaltyAPI.addLoyaltyPoints("557c6567c8faa5ec0f003728","RxkOcyDzsgXq0AqpzI8v5557D41sd56NiK+5/1Ef07A=",'1450083424880-07702731736935675', 12345, 1000);
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyUserAddPoint/557c6567c8faa5ec0f003728?userToken=RxkOcyDzsgXq0AqpzI8v5557D41sd56NiK%2B5%2F1Ef07A%3D&loyaltyUnqiueId=1450083424880-07702731736935675&redemptionPasscode=12345&purchaseAmount=1000', {
              })
              .respond(200, {
                  status: "success"
              });
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.addLoyaltyPoints should return fail', function () {
          var loyalityUniqueId = null;
          LoyaltyAPI.addLoyaltyPoints("557c6567c8faa5ec0f003728","RxkOcyDzsgXq0AqpzI8v5557D41sd56NiK+5/1Ef07A=",loyalityUniqueId, 12345, 1000);
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyUserAddPoint/557c6567c8faa5ec0f003728?userToken=RxkOcyDzsgXq0AqpzI8v5557D41sd56NiK%2B5%2F1Ef07A%3D&loyaltyUnqiueId='+loyalityUniqueId+'&redemptionPasscode=12345&purchaseAmount=1000', {
              })
              .respond(500, {
                  status: null
              });
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.validatePasscode should return success', function () {
          LoyaltyAPI.validatePasscode("RxkOcyDzsgXq0AqpzI8v5557D41sd56NiK+5/1Ef07A=",'1450083424880-07702731736935675', 12345);
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyAppPassCode/1450083424880-07702731736935675?userToken=RxkOcyDzsgXq0AqpzI8v5557D41sd56NiK%2B5%2F1Ef07A%3D&redemptionPasscode=12345', {
              })
              .respond(200);
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.validatePasscode should return fail', function () {
          var loyalityUniqueId = null;
          LoyaltyAPI.validatePasscode("RxkOcyDzsgXq0AqpzI8v5557D41sd56NiK+5/1Ef07A=",null, 12345);
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyAppPassCode/'+null+'?userToken=RxkOcyDzsgXq0AqpzI8v5557D41sd56NiK%2B5%2F1Ef07A%3D&redemptionPasscode=12345', {
              })
              .respond(500, {
                  status: null
              });
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.redeemPoints should return success', function () {
          LoyaltyAPI.redeemPoints("557c6567c8faa5ec0f003728","3paSyI1VnmWrRfrpnclagflkLezdxaQTHcskZBetTlw=","1450237043026-01417660885490477", '5671028609db81b815000002');
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyUserRedeem/557c6567c8faa5ec0f003728?loyaltyUnqiueId=1450237043026-01417660885490477&userToken=3paSyI1VnmWrRfrpnclagflkLezdxaQTHcskZBetTlw%3D&redeemId=5671028609db81b815000002', {
              })
              .respond(200);
          $httpBackend.flush();
          $rootScope.$digest();
      });

      it('LoyaltyAPI.redeemPoints should return fail', function () {
          var userToken = null;
          LoyaltyAPI.redeemPoints("557c6567c8faa5ec0f003728",userToken,"1450237043026-01417660885490477", '5671028609db81b815000002');
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyUserRedeem/557c6567c8faa5ec0f003728?loyaltyUnqiueId=1450237043026-01417660885490477&userToken='+userToken+'&redeemId=5671028609db81b815000002', {
              })
              .respond(500, {
                  status: null
              });
          $httpBackend.flush();
          $rootScope.$digest();
      });
  });
    describe('Unit : DataStore Factory', function () {
        var DataStore, Buildfire, $rootScope, TAG_NAMES, STATUS_MESSAGES, STATUS_CODE, q, RewardCache;
        beforeEach(module('loyaltyPluginWidget', function ($provide) {
            $provide.service('Buildfire', function () {
                this.datastore = jasmine.createSpyObj('datastore', ['get', 'save', 'onUpdate']);
                this.datastore.get.and.callFake(function (_tagName, callback) {
                    if (_tagName) {
                        callback(null, 'Success');
                    } else {
                        callback('Error', null);
                    }
                });
                this.datastore.save.and.callFake(function (item, _tagName, callback) {
                    if (item, _tagName) {
                        callback(null, 'Success');
                    } else {
                        callback('Error', null);
                    }
                });
                this.datastore.onUpdate.and.callFake(function (callback) {
                        callback('Success');
                });
            });
        }));
        beforeEach(inject(function (_$rootScope_, _DataStore_, _Buildfire_, _TAG_NAMES_, _STATUS_CODE_, _STATUS_MESSAGES_) {
            $rootScope = _$rootScope_;
            DataStore = _DataStore_;
            Buildfire = _Buildfire_;
            TAG_NAMES = _TAG_NAMES_;
            STATUS_CODE = _STATUS_CODE_;
            STATUS_MESSAGES = _STATUS_MESSAGES_;
        }));
        it('DataStore should exist and be an object', function () {
            expect(typeof DataStore).toEqual('object');
        });
        it('DataStore.get should exist and be a function', function () {
            expect(typeof DataStore.get).toEqual('function');
        });
        it('DataStore.save should exist and be a function', function () {
            expect(typeof DataStore.save).toEqual('function');
        });
        it('DataStore should exist and be an object', function () {
            expect(typeof DataStore).toEqual('object');
        });
        it('DataStore.get should return error', function () {
            var result = ''
                , success = function (response) {
                    result = response;
                }
                , error = function (err) {
                    result = err;
                };
            DataStore.get(null).then(success, error);
            $rootScope.$digest();
            expect(result).toEqual('Error');
        });
        it('DataStore.get should return success', function () {
            var result = ''
                , success = function (response) {
                    result = response;
                }
                , error = function (err) {
                    result = err;
                };
            DataStore.get(TAG_NAMES.LOYALTY_INFO).then(success, error);
            $rootScope.$digest();
            expect(result).toEqual('Success');
        });
        it('DataStore.save should called with success', function () {
            DataStore.save();
            var item = {};
            $rootScope.$digest();
            var result = ''
                , success = function (response) {
                    result = response;
                }
                , error = function (err) {
                    result = err;
                };
            DataStore.save(TAG_NAMES.LOYALTY_INFO,item).then(success, error);
        });
        it('DataStore.save should called with error', function () {
            DataStore.save();
            var item = null;
            $rootScope.$digest();
            var result = ''
                , success = function (response) {
                    result = response;
                }
                , error = function (err) {
                    result = err;
                };

            DataStore.save(null,null).then(success, error);

        });
        it('DataStore.onUpdate should called with success', function () {
            DataStore.onUpdate();
            var item = {};
            $rootScope.$digest();
            var result = ''
                , success = function (response) {
                    result = response;
                }
                , error = function (err) {
                    result = err;
                };
            DataStore.onUpdate().then(success, error);
            $rootScope.$digest();
            //expect(result).toEqual('Success');
        });
        it('DataStore.onUpdate should called with error', function () {
            DataStore.onUpdate();
            var event = null;
            $rootScope.$digest();
            var result = ''
                , success = function (response) {
                    result = response;
                }
                , error = function (err) {
                    result = err;
                };
            DataStore.onUpdate().then(success, error);
            $rootScope.$digest();
        });
    });
});

