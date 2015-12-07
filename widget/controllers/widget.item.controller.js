'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetItemCtrl', ['$scope', 'ViewStack', 'RewardCache', '$sce',
      function ($scope, ViewStack, RewardCache, $sce) {

        var WidgetItem = this;
        var currentView = ViewStack.getCurrentView();

        if (RewardCache.getReward()) {
          WidgetItem.reward = RewardCache.getReward();
        }

        WidgetItem.confirmCancel = function () {
          if (WidgetItem.reward.pointsToRedeem <= currentView.totalPoints) {
            ViewStack.push({
              template: 'Confirm_Cancel'
            });
          } else {
            alert("Not Enough Points. Please earn more points in order to redeem this reward.");
          }
        };

        WidgetItem.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };
      }])
})(window.angular, window);
