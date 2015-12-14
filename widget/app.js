'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget', ['ngRoute', 'ngAnimate'])
    .config(['$routeProvider', '$compileProvider', function ($routeProvider, $compileProvider) {

      /**
       * To make href urls safe on mobile
       */
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);

    }])
    .directive("viewSwitcher", ["ViewStack", "$rootScope", '$compile',
      function (ViewStack, $rootScope, $compile) {
        return {
          restrict: 'AE',
          link: function (scope, elem, attrs) {
            var views = 0;
            manageDisplay();
            $rootScope.$on('VIEW_CHANGED', function (e, type, view, noAnimation) {
              if (type === 'PUSH') {
                console.log("VIEW_CHANGED>>>>>>>>");
                var newScope = $rootScope.$new();
                var _newView = '<div  id="' + view.template + '" ><div class="slide content" data-back-img="{{itemDetailsBackgroundImage}}" ng-include="\'templates/' + view.template + '.html\'"></div></div>';
                var parTpl = $compile(_newView)(newScope);

                $(elem).append(parTpl);
                views++;

              } else if (type === 'POP') {
                var _elToRemove = $(elem).find('#' + view.template),
                  _child = _elToRemove.children("div").eq(0);

                _child.addClass("ng-enter ng-enter-active");
                _child.one("webkitTransitionEnd transitionend oTransitionEnd", function (e) {
                  _elToRemove.remove();
                  views--;
                });
              } else if (type === 'POPALL') {
                angular.forEach(view, function (value, key) {
                  var _elToRemove = $(elem).find('#' + value.template),
                    _child = _elToRemove.children("div").eq(0);

                  if (!noAnimation) {
                    _child.addClass("ng-enter ng-enter-active");
                    _child.one("webkitTransitionEnd transitionend oTransitionEnd", function (e) {
                      _elToRemove.remove();
                      views--;
                    });
                  } else {
                    _elToRemove.remove();
                    views--;
                  }
                });

              }
              manageDisplay();
            });

            function manageDisplay() {
              if (views) {
                $(elem).removeClass("ng-hide");
              } else {
                $(elem).addClass("ng-hide");
              }
            }

          }
        };
      }])
    .filter('cropImage', [function () {
      return function (url, width, height, noDefault) {
        if (noDefault) {
          if (!url)
            return '';
        }
        return buildfire.imageLib.cropImage(url, {
          width: width,
          height: height
        });
      };
    }])
    .directive('backImg', ["$filter", "$rootScope", function ($filter, $rootScope) {
      return function (scope, element, attrs) {
        attrs.$observe('backImg', function (value) {
          var img = '';
          if (value) {
            img = $filter("cropImage")(value, $rootScope.deviceWidth, $rootScope.deviceHeight, true);
            element.attr("style", 'background:url(' + img + ') !important');
            element.css({
              'background-size': 'cover'
            });
          }
          else {
            img = "";
            element.attr("style", 'background-color:white');
            element.css({
              'background-size': 'cover'
            });
          }
        });
      };
    }])
    .directive("buildFireCarousel", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel:LOADED");
        }
      };
    }])
    .directive("buildFireCarousel2", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel2:LOADED");
        }
      };
    }])
    .directive("buildFireCarousel3", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel3:LOADED");
        }
      };
    }])
    .directive("buildFireCarousel4", ["$rootScope", function ($rootScope) {
      return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
          $rootScope.$broadcast("Carousel4:LOADED");
        }
      };
    }])
    .filter('getImageUrl', function () {
      return function (url, width, height, type) {
        if (type == 'resize')
          return buildfire.imageLib.resizeImage(url, {
            width: width,
            height: height
          });
        else
          return buildfire.imageLib.cropImage(url, {
            width: width,
            height: height
          });
      }
    })
    .run(['Location', '$location', '$rootScope', 'RewardCache', 'ViewStack', function (Location, $location, $rootScope, RewardCache, ViewStack) {
      buildfire.messaging.onReceivedMessage = function (msg) {
        switch (msg.type) {
          case 'AddNewItem':
            RewardCache.setReward(msg.data);
            ViewStack.popAllViews(true);
            ViewStack.push({
              template: 'Item_Details',
              totalPoints: msg.data.pointsToRedeem
            });
            $rootScope.$broadcast("REWARD_ADDED", msg.data);
            $rootScope.$apply();
            break;

          case 'OpenItem':
            RewardCache.setReward(msg.data);
            ViewStack.popAllViews(true);
            ViewStack.push({
              template: 'Item_Details',
              totalPoints: msg.data.pointsToRedeem
            });
            $rootScope.$apply();
            break;

          case 'UpdateItem':
            RewardCache.setReward(msg.data);
            $rootScope.$broadcast("REWARD_UPDATED", msg.data);
            $rootScope.$apply();
            break;

          case 'RemoveItem':
            $rootScope.$broadcast("REWARD_DELETED", msg.index);
            $rootScope.$apply();
            break;

          case 'ListSorted':
            $rootScope.$broadcast("REWARDS_SORTED");
            $rootScope.$apply();
            break;

          case 'UpdateApplication':
            $rootScope.$broadcast("APPLICATION_UPDATED", msg.data);
            $rootScope.$apply();
            break;

          case 'ReturnHome':
            $rootScope.$broadcast("GOTO_HOME");
            $rootScope.$apply();
            break;
        }
      };

      buildfire.navigation.onBackButtonClick = function () {

        if (ViewStack.hasViews()) {
          ViewStack.pop();
        } else {
          buildfire.navigation.navigateHome();
        }
      };
    }])
})(window.angular, window.buildfire);