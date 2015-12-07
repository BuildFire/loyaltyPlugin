'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetRedeemCtrl', ['$scope', 'ViewStack', 'RewardCache', 'LoyaltyAPI', '$timeout', '$rootScope',
      function ($scope, ViewStack, RewardCache, LoyaltyAPI, $timeout, $rootScope) {

        var WidgetRedeem = this;
        WidgetRedeem.redeemFail = false;

        if (RewardCache.getReward()) {
          WidgetRedeem.reward = RewardCache.getReward();
        }

        WidgetRedeem.redeemPoints = function (rewardId) {
          var redeemSuccess = function () {
            $rootScope.$broadcast('POINTS_REDEEMED',WidgetRedeem.reward.pointsToRedeem);
            ViewStack.push({
              template: 'Success'
            });
          };

          var redeemFailure = function () {
            WidgetRedeem.redeemFail = true;
            $timeout(function () {
              WidgetRedeem.redeemFail = false;
            }, 3000);

          };

          LoyaltyAPI.redeemPoints('5317c378a6611c6009000001', 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=', 'e22494ec-73ea-44ac-b82b-75f64b8bc535', rewardId).then(redeemSuccess, redeemFailure);
        };

        WidgetRedeem.backToHome = function () {
          ViewStack.pop();
        };

      }])
})(window.angular, window);

