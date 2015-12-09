'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetRedeemCtrl', ['$scope', 'ViewStack', 'RewardCache', 'LoyaltyAPI', '$timeout', '$rootScope',
      function ($scope, ViewStack, RewardCache, LoyaltyAPI, $timeout, $rootScope) {

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
            $rootScope.$broadcast('POINTS_REDEEMED', WidgetRedeem.reward.pointsToRedeem);
            ViewStack.push({
              template: 'Success'
            });
          };

          var redeemFailure = function (error) {
            if (error.code == 2103) {
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

          LoyaltyAPI.redeemPoints('5317c378a6611c6009000001', 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=', 'e22494ec-73ea-44ac-b82b-75f64b8bc535', rewardId).then(redeemSuccess, redeemFailure);
        };

        /**
         * Method to go back to previous page
         */
        WidgetRedeem.backToHome = function () {
          ViewStack.pop();
        };

      }])
})(window.angular, window);

