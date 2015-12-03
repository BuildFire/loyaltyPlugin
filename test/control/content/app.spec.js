describe('Unit: loyaltyPluginContent content app', function () {
  describe('Unit: app routes', function () {
    beforeEach(module('loyaltyPluginContent'));
    var location, route, rootScope;
    beforeEach(inject(function (_$location_, _$route_, _$rootScope_) {
      location = _$location_;
      route = _$route_;
      rootScope = _$rootScope_;

    }));

    describe('Home route', function () {
      beforeEach(inject(
        function ($httpBackend) {
          $httpBackend.expectGET('templates/home.html')
            .respond(200);
          $httpBackend.expectGET('/')
            .respond(200);
        }));

      it('it should pass if home routing is there', function () {

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
  });

});