'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetItemCtrl', ['$scope', 'ViewStack', 'RewardCache', '$sce',
      function ($scope, ViewStack, RewardCache, $sce) {

        var WidgetItem = this;

        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        /**
         * Initialize WidgetItem.reward with reward details set in home controller
         */
        if (RewardCache.getReward()) {
          WidgetItem.reward = RewardCache.getReward();
        }

        /**
         * Check if user's total loyalty points are enough to redeem the reward, if yes redirect to next page.
         */
        WidgetItem.confirmCancel = function () {
          if (WidgetItem.reward.pointsToRedeem <= currentView.totalPoints) {
            ViewStack.push({
              template: 'Confirm_Cancel'
            });
          } else {
            alert("Not Enough Points. Please earn more points in order to redeem this reward.");
          }
        };

        /**
         * To parse and show reward's description in html format
         */
        WidgetItem.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };
      }])
})(window.angular, window);
