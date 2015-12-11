'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetRedeemCtrl', ['$scope', 'ViewStack', 'RewardCache', 'LoyaltyAPI', '$timeout', '$rootScope', 'Buildfire',
      function ($scope, ViewStack, RewardCache, LoyaltyAPI, $timeout, $rootScope, Buildfire) {

        var WidgetRedeem = this;

        /**
         * Initialize show error message to false
         */
        WidgetRedeem.redeemFail = false;
        WidgetRedeem.dailyLimitExceeded = false;

        if (RewardCache.getReward()) {
          WidgetRedeem.reward = RewardCache.getReward();
        }

        /**
         * Method to redeem points from user's account using Loyalty api. Redirect to success page if redeemed successfully.
         */
        WidgetRedeem.redeemPoints = function (rewardId) {
          var redeemSuccess = function () {
            Buildfire.spinner.hide();
            $rootScope.$broadcast('POINTS_REDEEMED', WidgetRedeem.reward.pointsToRedeem);
            ViewStack.push({
              template: 'Success'
            });
          };

          var redeemFailure = function (error) {
            Buildfire.spinner.hide();
            if (error && error.code == 2103) {
              WidgetRedeem.dailyLimitExceeded = true;
              $timeout(function () {
                WidgetRedeem.dailyLimitExceeded = false;
              }, 3000);
            } else {
              WidgetRedeem.redeemFail = true;
              $timeout(function () {
                WidgetRedeem.redeemFail = false;
              }, 3000);
            }
          };
          Buildfire.spinner.show();
          LoyaltyAPI.redeemPoints('5317c378a6611c6009000001', WidgetRedeem.currentLoggedInUser.userToken, '1449814143554-01452660677023232', rewardId).then(redeemSuccess, redeemFailure);
        };

        /**
         * Method to go back to previous page
         */
        WidgetRedeem.backToHome = function () {
          ViewStack.pop();
        };

        /**
         * Check for current logged in user
         */
        buildfire.auth.getCurrentUser(function (err, user) {
          console.log("_______________________", user);
          if (user) {
            WidgetRedeem.currentLoggedInUser = user;
            $scope.$digest();
          }
        });

      }])
})(window.angular, window.buildfire);

