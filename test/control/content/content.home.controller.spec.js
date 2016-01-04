describe('Unit : loyaltyPluginContent content.home.controller.js', function () {
  var ContentHome, scope, $rootScope, $controller, Buildfire, STATUS_CODE, STATUS_MESSAGES, q, RewardCache, SERVER,context;
  beforeEach(module('loyaltyPluginContent'));
  var editor;
  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _STATUS_CODE_, _SERVER_, _STATUS_MESSAGES_, _RewardCache_,_context_) {
    $rootScope = _$rootScope_;
    q = _$q_;
    scope = $rootScope.$new();
    $controller = _$controller_;
    STATUS_CODE = _STATUS_CODE_;
    STATUS_MESSAGES = _STATUS_MESSAGES_;
    SERVER = _SERVER_;
    RewardCache = _RewardCache_;
    context = _context_;
    Buildfire = {
      components: {
        carousel: {
          editor: function (name) {
            return {}
          },
          viewer: function (name) {
            return {}
          }
        }
      }
    };
    Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', 'onAddItems']);
  }));

  beforeEach(function () {
    ContentHome = $controller('ContentHomeCtrl', {
      $scope: scope,
      $q: q,
      Buildfire: Buildfire,
      STATUS_CODE: STATUS_CODE,
      SERVER: SERVER
    });
  });

  describe('Units: units should be Defined', function () {
    it('it should pass if ContentHome is defined', function () {
      expect(ContentHome).not.toBeUndefined();
    });
    it('it should pass if Buildfire is defined', function () {
      expect(Buildfire).not.toBeUndefined();
    });
    it('it should pass if STATUS_CODE is defined', function () {
      expect(STATUS_CODE).not.toBeUndefined();
    });
    it('it should pass if SERVER is defined', function () {
      expect(SERVER).not.toBeUndefined();
    });
  });

  describe('Units: test the method ContentHome.openReward', function () {
    it('it should pass if ContentHome.openReward is called', function () {

    });

  });


  describe('Units: spy the service  RewardCache', function () {
    it('it should pass if  RewardCache service called', function () {
      spyOn(RewardCache, 'getReward').and.callFake(function () {
        return {
          then: function (callback) {
            return callback({});
          }
        };
      });
    });

  });
});