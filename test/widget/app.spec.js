describe('Unit: loyaltyPluginWidget widget app', function () {
  describe('Unit: app routes', function () {
    beforeEach(module('loyaltyPluginWidget'));
    var location, route, rootScope, compile, scope, $filter,RewardCache;
    beforeEach(inject(function (_$rootScope_, _$compile_, $rootScope, _$filter_,_RewardCache_) {
      // route = _$route_;
      rootScope = _$rootScope_;
      compile = _$compile_;
      scope = $rootScope.$new();
      $filter = _$filter_
      RewardCache = _RewardCache_;
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
  describe('View Switcher directive with PUSH call', function () {
    var $compile, $rootScope, viewSwitcher, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      var view = {
        template:['Item_Details']
      }
      viewSwitcher = $compile('<div view-switcher=""></div>')($scope);
      $rootScope.$broadcast('VIEW_CHANGED','PUSH',view);
      //$rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(viewSwitcher.length).toEqual(1);
    });

    it('it should be defined', function () {
     expect(viewSwitcher).toBeDefined();
    });
  });
  describe('view switcher directive with POP call', function () {
    var $compile, $rootScope, viewSwitcher, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      var view = {
        template:['Item_Details']
      }
      viewSwitcher = $compile('<div view-switcher=""></div>')($scope);
      $rootScope.$broadcast('VIEW_CHANGED','POP',view);
      //$rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(viewSwitcher.length).toEqual(1);
    });

    it('it should be defined', function () {
      expect(viewSwitcher).toBeDefined();
    });
  });
  describe('view switcher directive with POPALL call', function () {
    var $compile, $rootScope, viewSwitcher, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      var view = {
        template:['Item_Details']
      }
      viewSwitcher = $compile('<div view-switcher=""></div>')($scope);
      $rootScope.$broadcast('VIEW_CHANGED','POPALL',view);
      //$rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(viewSwitcher.length).toEqual(1);
    });

    it('it should be defined', function () {
      expect(viewSwitcher).toBeDefined();
    });
  });

  describe('The test filter', function () {
    'use strict';

    var $filter;

    beforeEach(function () {
      module('loyaltyPluginWidget');

      inject(function (_$filter_) {
        $filter = _$filter_;
      });
    });

    it('should Crop the Image', function () {
      // Arrange.
      var url = 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150', result;
      var updatedUrl = 'http://s7obnu.cloudimage.io/s/crop/250x250/https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150';
      // Act.
      result = $filter('cropImage')(url, '250','250','no');

      // Assert.
      expect(result).toEqual(updatedUrl);
    });
    it('should Crop the Image', function () {
      // Arrange.
      var url = '', result;
      var updatedUrl = 'http://s7obnu.cloudimage.io/s/crop/250x250/https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150';
      // Act.
      result = $filter('cropImage')(url, '250','250','no');

      // Assert.
      expect(result).toEqual('');
    });
  });
  describe('backImg directive test with background Image URL', function () {
    var $compile, $rootScope, backImg, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
       backImg = $compile('<div back-img="value"></div>')($scope);
     // $rootScope.$broadcast('VIEW_CHANGED');
     $rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(backImg.length).toEqual(1);
       });


  });

  describe('backImg directive test without background Image URL', function () {
    var $compile, $rootScope, backImg, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      backImg = $compile('<div back-img=""></div>')($scope);
      $rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(backImg.length).toEqual(1);
    });


  });

  describe('buildFireCarousel directive test', function () {
    var $compile, $rootScope, buildFireCarousel, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      buildFireCarousel = $compile('<div build-fire-carousel=""></div>')($scope);
      $rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(buildFireCarousel.length).toEqual(1);
      buildfire.messaging.onReceivedMessage("aa")
    });
  });

  describe('buildFireCarousel2 directive test', function () {
    var $compile, $rootScope, buildFireCarousel, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      buildFireCarousel = $compile('<div build-fire-carousel2=""></div>')($scope);
      $rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(buildFireCarousel.length).toEqual(1);
      buildfire.messaging.onReceivedMessage("aa")
    });
  });

  describe('buildFireCarousel3 directive test', function () {
    var $compile, $rootScope, buildFireCarousel, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      buildFireCarousel = $compile('<div build-fire-carousel3=""></div>')($scope);
      $rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(buildFireCarousel.length).toEqual(1);
      buildfire.messaging.onReceivedMessage("aa")
    });
  });

  describe('buildFireCarousel4 directive test', function () {
    var $compile, $rootScope, buildFireCarousel, $scope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));
    beforeEach(function () {
      buildFireCarousel = $compile('<div build-fire-carousel4=""></div>')($scope);
      $rootScope.$digest();
    });

    it('it should pass and view switcher of div should be 1', function () {
      expect(buildFireCarousel.length).toEqual(1);
      buildfire.messaging.onReceivedMessage("aa")
    });
  });


  describe('calling the buildfire.messaging.onReceivedMessage for AddNewItem condition', function () {
    var RewardCache, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_RewardCache_, _$rootScope_) {
      RewardCache =_RewardCache_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'AddNewItem',
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

  describe('calling the buildfire.messaging.onReceivedMessage for AddNewItem condition', function () {
    var RewardCache, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
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

  describe('calling the buildfire.messaging.onReceivedMessage for UpdateItem condition', function () {
    var RewardCache, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_RewardCache_, _$rootScope_) {
      RewardCache =_RewardCache_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'UpdateItem',
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

  describe('calling the buildfire.navigation.onBackButtonClick', function () {
    var ViewStack, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_ViewStack_, _$rootScope_) {
      ViewStack =_ViewStack_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'UpdateItem',
      data:{
        pointsToRedeem:5
      }
    };
    it('it should pass when buildfire.messaging.onReceivedMessage', function () {
      buildfire.navigation.onBackButtonClick()
      $rootScope.$apply();
    });
  });
  describe('calling the buildfire.messaging.onReceivedMessage for RemoveItem condition', function () {
    var RewardCache, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_RewardCache_, _$rootScope_) {
      RewardCache =_RewardCache_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'RemoveItem',
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

  describe('calling the buildfire.navigation.onBackButtonClick', function () {
    var ViewStack, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_ViewStack_, _$rootScope_) {
      ViewStack =_ViewStack_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'RemoveItem',
      data:{
        pointsToRedeem:5
      }
    };
    it('it should pass when buildfire.messaging.onReceivedMessage', function () {
      buildfire.navigation.onBackButtonClick()
      $rootScope.$apply();
    });
  });

  describe('calling the buildfire.messaging.onReceivedMessage for ListSorted condition', function () {
    var RewardCache, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_RewardCache_, _$rootScope_) {
      RewardCache =_RewardCache_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'ListSorted',
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

  describe('calling the buildfire.messaging.onReceivedMessage for UpdateApplication condition', function () {
    var RewardCache, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_RewardCache_, _$rootScope_) {
      RewardCache =_RewardCache_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'UpdateApplication',
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
  describe('calling the buildfire.navigation.onBackButtonClick', function () {
    var ViewStack, $rootScope;
    beforeEach(module('loyaltyPluginWidget'));
    beforeEach(inject(function (_ViewStack_, _$rootScope_) {
      ViewStack =_ViewStack_;
      $rootScope = _$rootScope_;
    }));
    var msg = {
      type:'UpdateApplication',
      data:{
        pointsToRedeem:5
      }
    };
    it('it should pass when buildfire.messaging.onReceivedMessage', function () {
      buildfire.navigation.onBackButtonClick()
      $rootScope.$apply();
    });
  });

  describe('The test filter', function () {
    'use strict';

    var $filter;

    beforeEach(function () {
      module('loyaltyPluginWidget');

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