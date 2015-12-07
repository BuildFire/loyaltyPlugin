describe('Unit: loyaltyPluginDesign design app', function () {
  describe('Unit: app routes', function () {
    beforeEach(module('loyaltyPluginDesign'));
    var route, rootScope;
    beforeEach(inject(function ( _$route_, _$rootScope_) {
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

      it('should load the home page for design on successful load of location path /', function () {

      });
    });
  });
});