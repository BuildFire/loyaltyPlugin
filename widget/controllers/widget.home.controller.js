'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE',
      function ($scope, ViewStack, LoyaltyAPI, STATUS_CODE) {

        var WidgetHome = this;
        WidgetHome.currentLoggedInUser = null;

        WidgetHome.openReward = function (reward) {
          ViewStack.push({
            template: 'Item_Details'
          });
        };

        WidgetHome.getLoyaltyPoints = function (userId) {
          var success = function (result) {
              console.info('Points>>>>>>>>>>>>>>>.', result);
              WidgetHome.loyaltyPoints = result.totalPoints;
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting points data', err);
              }
            };
          var successLoyaltyRewards = function (result) {
              WidgetHome.loyaltyRewards = result;
              if (!WidgetHome.loyaltyRewards)
                WidgetHome.loyaltyRewards = [];
              console.info('Rewards>>>>>>>>>>>>>>.:', result);
            }
            , errorLoyaltyRewards = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data loyaltyRewards', err);
              }
            };
          LoyaltyAPI.getRewards('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(successLoyaltyRewards, errorLoyaltyRewards);
          LoyaltyAPI.getLoyaltyPoints(userId, 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=', 'e22494ec-73ea-44ac-b82b-75f64b8bc535').then(success, error);
        };

        buildfire.auth.getCurrentUser(function (user) {
          console.log("_______________________", user);
          if (user) {
            WidgetHome.currentLoggedInUser = user;
            WidgetHome.getLoyaltyPoints(user._id);
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

