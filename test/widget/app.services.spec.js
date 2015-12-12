describe('Unit : loyaltyPluginWidget design services', function () {

  describe('Unit : DataStore Factory', function () {
    var DataStore, Buildfire, $rootScope, TAG_NAMES, STATUS_MESSAGES, STATUS_CODE, q, LoyaltyAPI, $http, $httpBackend, ViewStack;
    beforeEach(module('loyaltyPluginWidget', function ($provide) {
      $provide.service('Buildfire', function () {
        this.LoyaltyAPI = jasmine.createSpyObj('LoyaltyAPI', ['addApplication','getApplication', 'getRewards','getLoyaltyPoints','addLoyaltyPoints','validatePasscode','redeemPoints']);
        //this.LoyaltyAPI.getApplication.and.callFake(function (_tagName, callback) {
        //  if (_tagName) {
        //    callback(null, 'Success');
        //  } else {
        //    callback('Error', null);
        //  }
        //});
        // this.LoyaltyAPI.addApplication.and.callFake(function (item, _tagName, callback) {
        //     if (item, _tagName) {
        //         callback(null, 'Success');
        //     } else {
        //         callback('Error', null);
        //     }
        //});
      });
    }));
    beforeEach(inject(function (_$rootScope_, _DataStore_, _Buildfire_, _TAG_NAMES_, _STATUS_CODE_, _STATUS_MESSAGES_, _LoyaltyAPI_, _$httpBackend_, _$http_,_ViewStack_) {
      $rootScope = _$rootScope_;
      DataStore = _DataStore_;
      Buildfire = _Buildfire_;
      TAG_NAMES = _TAG_NAMES_;
      STATUS_CODE = _STATUS_CODE_;
      STATUS_MESSAGES = _STATUS_MESSAGES_;
      LoyaltyAPI = _LoyaltyAPI_;
      $httpBackend = _$httpBackend_;
        ViewStack = _ViewStack_;
    }));

    it('LoyaltyAPI.getApplication should return success', function () {
        var data ={
           data:"data"
        }
        LoyaltyAPI.getApplication('e22494ec-73ea-44ac-b82b-75f64b8bc535');

        $httpBackend
            .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyApp/e22494ec-73ea-44ac-b82b-75f64b8bc535', {
                //authToken: "test",
                //Accept: "application/json, text/plain, */*"
            })
            .respond(200, { data: 'value' });

        $httpBackend.flush();

     //   $http.expectGET('http://loyalty.kaleoapps.com/api/loyaltyApp/e22494ec-73ea-44ac-b82b-75f64b8bc535')
          //  .respond(data,200);
      $rootScope.$digest();
    });

      it('LoyaltyAPI.getApplication should return success', function () {
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

          //   $http.expectGET('http://loyalty.kaleoapps.com/api/loyaltyApp/e22494ec-73ea-44ac-b82b-75f64b8bc535')
          //  .respond(data,200);
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
          LoyaltyAPI.getApplication('e22494ec-73ea-44ac-b82b-75f64b8bc535');
          var view = {
              template:['Item_Details']
          }
          $httpBackend
              .when('GET', 'http://loyalty.kaleoapps.com/api/loyaltyApp/e22494ec-73ea-44ac-b82b-75f64b8bc535', {
              })
              .respond(500, null);
          ViewStack.push(view.template)
          ViewStack.pop()
          ViewStack.getCurrentView()
          $rootScope.$broadcast('VIEW_CHANGED','POP',view);
          $httpBackend.flush();
          $rootScope.$digest();
      });
  });
});

