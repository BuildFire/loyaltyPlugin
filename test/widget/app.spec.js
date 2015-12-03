describe('Unit: loyaltyPluginWidget widget app', function () {
  describe('Unit: app routes', function () {
    beforeEach(module('loyaltyPluginWidget'));
    var location, route, rootScope, compile, scope;
    beforeEach(inject(function (_$rootScope_, _$compile_, $rootScope) {
      // route = _$route_;
      rootScope = _$rootScope_;
      compile = _$compile_;
      scope = $rootScope.$new();
    }));

    describe('Home route', function () {
      beforeEach(inject(
        function ($httpBackend) {
          $httpBackend.expectGET('/')
            .respond(200);
        }));
      it('should load the home page on successful load of location path /', function () {

      });
    });
  });
});