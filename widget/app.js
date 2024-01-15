'use strict';

(function (angular, buildfire, window) {
    angular
        .module('loyaltyPluginWidget', ['ngRoute', 'ngAnimate'])
        .config(['$routeProvider', '$httpProvider', '$compileProvider', function ($routeProvider, $httpProvider, $compileProvider) {

      /**
       * To make href urls safe on mobile
       */
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);

            var interceptor = ['$q', function ($q) {
                var counter = 0;
                return {
                    request: function (config) {
                        console.log('Showing spinner-----------------------------------------------------------------------');
                        buildfire.spinner.show();
                        return config;
                    },
                    response: function (response) {
                        console.log('Hiding spinner-----------------------------Success------------------------------------------');
                        buildfire.spinner.hide();
                        return response;
                    },
                    responseError: function (rejection) {
                        buildfire.spinner.hide();
                        return $q.reject(rejection);
                    }
                };
            }];

            $httpProvider.interceptors.push(interceptor);

        }])
        .directive("viewSwitcher", ["ViewStack", "$rootScope", '$compile',
            function (ViewStack, $rootScope, $compile) {
                return {
                    restrict: 'AE',
                    link: function (scope, elem, attrs) {
                        var views = 0,
                            currentView = null;
                        manageDisplay();
                        $rootScope.$on('VIEW_CHANGED', function (e, type, view, noAnimation) {
                            if (type === 'PUSH') {
                                console.log("VIEW_CHANGED>>>>>>>>");
                                currentView = ViewStack.getPreviousView();

                var _el = $("<a/>").attr("href", "javascript:void(0)"),
                  oldTemplate = $('#' + currentView.template);

                oldTemplate.append(_el);

                oldTemplate.find("input[type=number], input[type=password], input[type=text]").each(function () {
                  $(this).blur().attr("disabled", "disabled");
                });

                $(document.activeElement).blur();
                _el.focus();

                var newScope = $rootScope.$new();
                var _newView = '<div  id="' + view.template + '" ><div class="mdc-theme--background slide content" data-back-img="{{itemDetailsBackgroundImage}}" ng-include="\'templates/' + view.template + '.html\'"></div></div>';
                var parTpl = $compile(_newView)(newScope);

                $(elem).append(parTpl);
                views++;
                if (!scope.$$phase) scope.$apply();
                if (!$rootScope.$$phase) $rootScope.$apply();
              } else if (type === 'POP') {

                var _elToRemove = $(elem).find('#' + view.template),
                  _child = _elToRemove.children("div").eq(0);

                _child.addClass("ng-leave ng-leave-active");
                _child.one("webkitTransitionEnd transitionend oTransitionEnd", function (e) {
                  _elToRemove.remove();
                  views--;
                });

                currentView = ViewStack.getCurrentView();
                $('#' + currentView.template).find("input[type=number], input[type=password], input[type=text]").each(function () {
                  $(this).removeAttr("disabled");
                });

              } else if (type === 'POPALL') {
                angular.forEach(view, function (value, key) {
                  var _elToRemove = $(elem).find('#' + value.template),
                    _child = _elToRemove.children("div").eq(0);

                  if (!noAnimation) {
                    _child.addClass("ng-leave ng-leave-active");
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
        .directive('backImg', ["$rootScope", function ($rootScope) {
            return function (scope, element, attrs) {
                attrs.$observe('backImg', function (value) {
                    var img = '';
                    if (value) {
                        buildfire.imageLib.local.cropImage(value, {
                            width: $rootScope.deviceWidth,
                            height: $rootScope.deviceHeight
                        }, function (err, imgUrl) {
                            if (imgUrl) {
                                img = imgUrl;
                                element.attr("style", 'background:url(' + img + ') !important;background-size:cover !important');
                            }
                            element.css({
                                'background-size': 'cover !important'
                            });
                        });
                        // img = $filter("cropImage")(value, $rootScope.deviceWidth, $rootScope.deviceHeight, true);
                    }
                    else {
                        img = "";
                        element.css({
                            'background-size': 'cover !important'
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
    .directive('getFocus', ["$timeout", function ($timeout) {
      return {
        link: function (scope, element, attrs) {
          $(element).parents(".slide").eq(0).on("webkitTransitionEnd transitionend oTransitionEnd", function () {
            $timeout(function () {
              $(element).focus();
            }, 300);
            //open keyboard manually
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
              window.cordova.plugins.Keyboard.show();
            }

            $(element).on('blur', function () {
              //open keyboard manually
              if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                window.cordova.plugins.Keyboard.hide();
              }
            });
          });

          scope.$on("$destroy", function () {
            $(element).parents(".slide").eq(0).off("webkitTransitionEnd transitionend oTransitionEnd", "**");
          });
        }
      }
    }])
        .directive("loadImage", ['Buildfire', function (Buildfire) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");

                    var _img = attrs.finalSrc;

                    let croppedImage = buildfire.imageLib.cropImage(
                      _img,
                      { size: "full_width", aspect: attrs.aspectRatio || '1:1' }
                    );
                    replaceImg(croppedImage);

                    function replaceImg(finalSrc) {
                        var elem = $("<img>");
                        elem[0].onload = function () {
                            element.attr("src", finalSrc);
                            elem.remove();
                        };
                        elem.attr("src", finalSrc);
                    }
                }
            };
        }])
    .filter('getImageUrl', function () {
      return function (url, width, height, type) {
        let croppedImage = buildfire.imageLib.cropImage(
          url,
          { size: "full_width", aspect: "16:9" }
        );
        return croppedImage;
      }
    })
    .run(['Location', '$location', '$rootScope', 'RewardCache', 'ViewStack', 'Context', '$window',
      function (Location, $location, $rootScope, RewardCache, ViewStack, Context, $window) {
        buildfire.messaging.onReceivedMessage = function (msg) {
          switch (msg.type) {
            case 'AddNewItem':
              RewardCache.setReward(msg.data);
              ViewStack.popAllViews(true);
              ViewStack.push({
                template: 'Item_Details',
                totalPoints: $rootScope.loyaltyPoints
              });
              $rootScope.$broadcast("REWARD_ADDED", msg.data);
              if (!$rootScope.$$phase) $rootScope.$apply();
              break;

            case 'OpenItem':
              RewardCache.setReward(msg.data);
              if(ViewStack.getCurrentView() && ViewStack.getCurrentView().template != 'Item_Details') {
                  ViewStack.popAllViews(true);
                  ViewStack.push({
                      template: 'Item_Details',
                      totalPoints: $rootScope.loyaltyPoints
                  });
                  if (!$rootScope.$$phase) $rootScope.$apply();
              }
              break;

            case 'UpdateItem':
              RewardCache.setReward(msg.data);
              $rootScope.$broadcast("REWARD_UPDATED", msg.data, msg.index);
              if (!$rootScope.$$phase) $rootScope.$apply();
              break;

            case 'RemoveItem':
              $rootScope.$broadcast("REWARD_DELETED", msg.index);
              if (!$rootScope.$$phase) $rootScope.$apply();
              break;

            case 'ListSorted':
              $rootScope.$broadcast("REWARDS_SORTED");
              if (!$rootScope.$$phase) $rootScope.$apply();
              break;

            case 'UpdateApplication':
              $rootScope.$broadcast("APPLICATION_UPDATED", msg.data);
              if (!$rootScope.$$phase) $rootScope.$apply();
              break;

            case 'ReturnHome':
              $rootScope.$broadcast("GOTO_HOME");
              if (!$rootScope.$$phase) $rootScope.$apply();
              break;

            case 'AppCreated':
              $rootScope.$broadcast("REFRESH_APP");
              if (!$rootScope.$$phase) $rootScope.$apply();
              break;

            case 'SettingsUpdated':
              $rootScope.$broadcast("SETTINGS_UPDATED", msg.data);
              if (!$rootScope.$$phase) $rootScope.$apply();
              break;
            case 'refresh':
              $window.location.reload();
              break;
          }
        };

        buildfire.history.onPop(function(err,data){
            if (ViewStack.hasViews()) {
                if (ViewStack.getCurrentView().template == 'Item_Details') {
                    buildfire.messaging.sendMessageToControl({
                        type: 'BackToHome'
                    });
                }
                ViewStack.pop();
            }
        });
      }])

})(window.angular, window.buildfire, window);
