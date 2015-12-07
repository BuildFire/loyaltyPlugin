'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget', ['ngRoute'])
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
            $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
              if (type === 'PUSH') {
                console.log("VIEW_CHANGED>>>>>>>>");
                var newScope = $rootScope.$new();
                var _newView = '<div  id="' + view.template + '" ><div class="slide content" data-back-img="{{itemDetailsBackgroundImage}}" ng-include="\'templates/' + view.template + '.html\'"></div></div>';
                var parTpl = $compile(_newView)(newScope);

                $(elem).append(parTpl);
                views++;

              } else if (type === 'POP') {
                $(elem).find('#' + view.template).remove();
                views--;
              } else if (type === 'POPALL') {
                console.log(view);
                angular.forEach(view, function (value, key) {
                  $(elem).find('#' + value.template).remove();
                });
                views = 0;
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
    .run(['ViewStack', function (ViewStack) {
      buildfire.navigation.onBackButtonClick = function () {
        if (ViewStack.hasViews()) {
          ViewStack.pop();
        } else {
          buildfire.navigation.navigateHome();
        }
      };
    }]).filter('cropImage', [function () {
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
      }]).directive('backImg', ["$filter", "$rootScope", function ($filter, $rootScope) {
        return function (scope, element, attrs) {
          attrs.$observe('backImg', function (value) {
            var img='';
            if(value) {
              img = $filter("cropImage")(value, $rootScope.deviceWidth, $rootScope.deviceHeight, true);
              element.attr("style", 'background:url(' + img + ') !important');
              element.css({
                'background-size': 'cover'
              });
            }
            else{
              img = "";
              element.attr("style", 'background:url(' + img + ')');
              element.css({
                'background-size': 'cover'
              });
            }
          });
        };
      }]);
})(window.angular, window.buildfire);