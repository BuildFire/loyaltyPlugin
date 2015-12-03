'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetHome = this;
        WidgetHome.currentLoggedInUser = null;

        WidgetHome.openReward = function () {
          ViewStack.push({
            template: 'Item_Details'
          });
        };

        buildfire.auth.getCurrentUser(function (user) {
          console.log("_______________________", user);
          if (user) {
            WidgetHome.currentLoggedInUser = user;
            $scope.$digest();
          }
        });

        WidgetHome.openGetPoints = function () {
          console.log(">>>>>>>>>>>>>>");
          ViewStack.push({
            template: 'Amount'
          });
        };

        WidgetHome.openLogin = function () {
          buildfire.auth.login({}, function () {

          });
        };

        var loginCallback = function () {
          buildfire.auth.getCurrentUser(function (user) {
            console.log("_______________________", user);
            if (user) {
              WidgetHome.currentLoggedInUser = user;
              $scope.$digest();
            }
          });
        };

        buildfire.auth.onLogin(loginCallback);

      }]);
})(window.angular, window.buildfire);

