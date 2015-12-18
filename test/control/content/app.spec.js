describe('Unit: loyaltyPluginContent content app', function () {
  //describe('Unit: app routes', function () {
  //  beforeEach(module('loyaltyPluginContent'));
  //  var location, route, rootScope;
  //  beforeEach(inject(function (_$location_, _$route_, _$rootScope_) {
  //    location = _$location_;
  //    route = _$route_;
  //    rootScope = _$rootScope_;
  //
  //  }));

    //describe('Home route', function () {
    //  beforeEach(inject(
    //    function ($httpBackend) {
    //      $httpBackend.expectGET('templates/home.html')
    //        .respond(200);
    //      $httpBackend.expectGET('/')
    //        .respond(200);
    //    }));
    //  var mockService;
    //
    //  it('it should pass if home routing is there', function () {
    //    mockService = {
    //      getContext: jasmine.createSpy('getContext').and.returnValue('context')
    //    };
    //    //module(function($provide){
    //    //  $provide.value('Context', mockService);
    //    //});
    //  });
    //});

  describe("Unit Testing: config - ", function() {

    var appModule;
    var mockService;

    beforeEach(function() {
      appModule = angular.mock.module("loyaltyPluginContent");
    });

    it('should test routeProvider resolve', function() {

      mockService = {
        getContext: jasmine.createSpy('getContext').and.returnValue('context')
      };

      module(function($provide){
        $provide.value('Context', mockService);
      });

      inject(function($route, $location, $rootScope, $httpBackend) {
        $httpBackend.expectGET('templates/home.html').respond({});
        $location.path('/');
        $rootScope.$digest();
        expect($route.current).toBeDefined();

      });

      inject(function($route, $location, $rootScope, $httpBackend) {
        $httpBackend.expectGET('templates/reward.html').respond({});
        $location.path('/reward');
        $rootScope.$digest();
        expect($route.current).toBeDefined();

      });

      inject(function($route, $location, $rootScope, $httpBackend) {
        $httpBackend.expectGET('templates/reward.html').respond({});
        $location.path('/reward/:id');
        $rootScope.$digest();
        expect($route.current).toBeDefined();

      });
    });


    describe('The test filter', function () {
      'use strict';

      var $filter;

      beforeEach(function () {
        module('loyaltyPluginContent');

        inject(function (_$filter_) {
          $filter = _$filter_;
        });
      });

      it('should Crop the Image', function () {
        // Arrange.
        var url = 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150', result;
        var updatedUrl = 'http://s7obnu.cloudimage.io/s/crop/250x250/https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150';
        // Act.
        result = $filter('getImageUrl')(url, '250','250','no');

        // Assert.
        expect(result).toEqual(updatedUrl);
      });
      it('should Crop the Image when url', function () {
        // Arrange.
        var url = 'http://s7obnu.cloudimage.io/s/resizenp/250x250', result,
            updatedUrl = 'http://s7obnu.cloudimage.io/s/resizenp/250x250/http://s7obnu.cloudimage.io/s/resizenp/250x250';
        // Act.
        result = $filter('getImageUrl')(url, '250','250','resize');

        // Assert.
        expect(result).toEqual(updatedUrl);
      });
    });
  });

    describe('Create reward route', function () {
      beforeEach(inject(
        function ($httpBackend) {
          $httpBackend.expectGET('templates/reward.html')
            .respond(200);
          $httpBackend.expectGET('/reward')
            .respond(200);
        }));
    });

    describe('Edit reward route', function () {
      beforeEach(inject(
        function ($httpBackend) {
          $httpBackend.expectGET('templates/reward.html')
            .respond(200);
          $httpBackend.expectGET('/reward/:id')
            .respond(200);
        }));
    });
  //});
  describe('calling the buildfire.messaging.onReceivedMessage for OpenItem condition', function () {
    var RewardCache, $rootScope;
    beforeEach(module('loyaltyPluginContent'));
    beforeEach(inject(function (_RewardCache_, _$rootScope_) {
      RewardCache =_RewardCache_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'OpenItem',
      data:{
        pointsToRedeem:5
      }
    };
    it('it should pass when buildfire.messaging.onReceivedMessage', function () {
      buildfire.messaging.onReceivedMessage(msg)
      $rootScope.$apply();
    });

    it('it should pass when buildfire.messaging.onReceivedMessage', function () {
      RewardCache.setReward();
      $rootScope.$apply();
    });
  });
  describe('calling the buildfire.messaging.onReceivedMessage for BackToHome condition', function () {
    var RewardCache, $rootScope;
    beforeEach(module('loyaltyPluginContent'));
    beforeEach(inject(function (_RewardCache_, _$rootScope_) {
      RewardCache =_RewardCache_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'BackToHome',
      data:{
        pointsToRedeem:5
      }
    };
    it('it should pass when buildfire.messaging.onReceivedMessage', function () {
      buildfire.messaging.onReceivedMessage(msg)
      $rootScope.$apply();
    });

    it('it should pass when buildfire.messaging.onReceivedMessage', function () {
      RewardCache.setReward();
      $rootScope.$apply();
    });
  });
});