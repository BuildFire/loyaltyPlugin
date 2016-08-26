describe('Unit : loyaltyPluginWidget Plugin widget.home.controller.js', function () {
  var WidgetHome, scope, $rootScope, $controller, Buildfire, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q, LoyaltyAPI;
  beforeEach(module('loyaltyPluginWidget'));
  var editor;


  beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _TAG_NAMES_, _STATUS_CODE_, _LAYOUTS_, _STATUS_MESSAGES_, _LoyaltyAPI_) {
    $rootScope = _$rootScope_;
    q = _$q_;
    scope = $rootScope.$new();
    $controller = _$controller_;
    TAG_NAMES = _TAG_NAMES_;
    STATUS_CODE = _STATUS_CODE_;
    STATUS_MESSAGES = _STATUS_MESSAGES_;
    LAYOUTS = _LAYOUTS_;
    LoyaltyAPI = _LoyaltyAPI_;
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
      },
      spinner: {
        show: function () {
        }
      },
      imagelib: {
        cropImage: function (url, setting) {

        }
      }
    };



    Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', 'onAddItems']);
    this.LoyaltyAPI = jasmine.createSpyObj('LoyaltyAPI', ['getLoyaltyPoints']);
  }));

  beforeEach(function () {
    WidgetHome = $controller('WidgetHomeCtrl', {
      $scope: scope,
      $q: q,
      Buildfire: Buildfire,
      TAG_NAMES: TAG_NAMES,
      STATUS_CODE: STATUS_CODE,
      CONTENT_TYPE: CONTENT_TYPE,
      LAYOUTS: LAYOUTS
    });
  });


  describe('Units: units should be Defined', function () {
  });

  describe('$destroy', function () {
    it('should invoke when get $destroy', function () {
      $rootScope.$broadcast('$destroy');
    });
  });

  describe('WidgetHome.safeHtml(html)', function () {
    it('should invoke when WidgetHome.safeHtml() method called', function () {
      var html = '<div>HiTest</div>';
      WidgetHome.safeHtml(html);
    });
  });

  describe('WidgetHome.showDescription(description)', function () {
    it('should invoke when WidgetHome.showDescription() method called', function () {
      var description = '<div>HiTest</div>';
      WidgetHome.showDescription(description);
    });
  });

  describe('Carousel:LOADED', function () {
    var html = '<div id="carousel"></div>';
    angular.element(document.body).append(html);
    it('should invoke when get Carousel:LOADED', function () {
      WidgetHome.data = {
        content: {
          storeName: "helloStore",
          carouselImages: "'https://www.google.com/images/srpr/logo11w.png'"

        },
        design: {
          itemListLayout: "testLayout"
        }
      }
    });

  });

  describe('Carousel:LOADED', function () {
    var html = '<div id="carousel"></div>';
    angular.element(document.body).append(html);
    it('should invoke when get Carousel:LOADED with carousal images', function () {
      WidgetHome.data = {
        content: {
          storeName: "helloStore",
          carouselImages: "'https://www.google.com/images/srpr/logo11w.png'"

        },
        design: {
          itemListLayout: "testLayout"
        }
      };
      $rootScope.$broadcast('Carousel:LOADED');
    });

    it('should invoke when get Carousel:LOADED without carousal images', function () {
      WidgetHome.data = {
        content: {
          storeName: "helloStore",
          carouselImages: ""

        },
        design: {
          itemListLayout: "testLayout"
        }
      };
      $rootScope.$broadcast('Carousel:LOADED');
    });
  });

    describe('WidgetHome.openReward', function () {
     it('should invoke when WidgetHome.openReward get called', function () {
       WidgetHome.openReward()
        });
    });

  describe('WidgetHome.getLoyaltyPoints, WidgetHome.getApplicationAndRewards, WidgetHome.openGetPoints', function () {


    it('should invoke when WidgetHome.getLoyaltyPoints get called', function () {
      var userId = "123";
      WidgetHome.currentLoggedInUser={
        userToken:"123"
      }
      WidgetHome.context = {
        instanceId:"123"
      }
      WidgetHome.getLoyaltyPoints();
     LoyaltyAPI.getLoyaltyPoints(userId,WidgetHome.currentLoggedInUser.userToken, WidgetHome.context.instanceId)
    });
    it('should invoke when WidgetHome.getApplicationAndRewards get called', function () {
      var userId = "123";
      WidgetHome.currentLoggedInUser={
        userToken:"123"
      }
      WidgetHome.context = {
        instanceId:"123"
      }
      WidgetHome.getApplicationAndRewards();
    });
    it('should invoke when WidgetHome.openGetPoints get called', function () {
      var userId = "123";
      WidgetHome.currentLoggedInUser={
        userToken:"123"
      }
      WidgetHome.context = {
        instanceId:"123"
      }
      WidgetHome.openGetPoints();
    });
    it('should invoke when WidgetHome.openGetPoints get called with null user', function () {
      var userId = "123";
      WidgetHome.currentLoggedInUser=null
      WidgetHome.context = {
        instanceId:"123"
      }
      WidgetHome.openGetPoints();
    });
  });

  describe('Test the WidgetHome.listeners calls', function () {
    it('should invoke POINTS_REDEEMED when point have some values', function () {
      var points = 5, callback = function(e, data){
      }
      $rootScope.$broadcast('POINTS_REDEEMED', callback);
    });
    it('should invoke POINTS_ADDED when point have some values', function () {
      var points = 5, callback = function(e, data){
      }
      $rootScope.$broadcast('POINTS_ADDED', callback);
    });
    it('should invoke REWARD_DELETED when point have some values', function () {
      var points = 5, callback = function(e, data){
          }
      WidgetHome.loyaltyRewards = [1,2,3];
      $rootScope.$broadcast('REWARD_DELETED', callback);
    });
    it('should invoke REWARDS_SORTED when point have some values', function () {
      var points = 5, callback = function(e, data){
      }

      WidgetHome.context = {
        instanceId:"123"
      }
      $rootScope.$broadcast('REWARDS_SORTED', callback);
      WidgetHome.openLogin();
    });
    it('should invoke REWARD_ADDED when point have some values', function () {
      var points = 5, callback = function(e, data){
      }
      WidgetHome.loyaltyRewards = [1,2,3];
      WidgetHome.context = {
          instanceId : 'abcde1234'
      };
      $rootScope.$broadcast('REWARD_ADDED', callback);
    });
    it('should invoke GOTO_HOME when point have some values', function () {
      var points = 5, callback = function(e, data){
      }
      WidgetHome.context = {
        instanceId:"123"
      }
      $rootScope.$broadcast('GOTO_HOME', callback);
    });
    it('should invoke APPLICATION_UPDATED when point have some values', function () {
      var points = 5, callback = function(e, data){
      }
      WidgetHome.context = {
        instanceId:"123"
      }
      $rootScope.$broadcast('APPLICATION_UPDATED', callback);
    });

    it('should invoke APPLICATION_UPDATED when app.content are passed', function () {
      var points = 5, callback = function(e, data){

      }

      var app={
          content :{
            description:"sss",
            image : "aaa"
          }
          }
      WidgetHome.context = {
        instanceId:"123"
      }
      $rootScope.$broadcast('APPLICATION_UPDATED', callback);
    });
    it('should invoke REFRESH_APP when point have some values', function () {
      var points = 5, callback = function(e, data){
      }
      WidgetHome.context = {
        instanceId:"123"
      }
      $rootScope.$broadcast('REFRESH_APP', callback);
    });
  });
});