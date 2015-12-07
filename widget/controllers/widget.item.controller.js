'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetItemCtrl', ['$scope', 'ViewStack', 'RewardCache', '$sce',
      function ($scope, ViewStack, RewardCache, $sce) {

        var WidgetItem = this;

        if (RewardCache.getReward()) {
          console.log("JJJJJJJJJJJJJJJJJJJ");
          console.log(RewardCache.getReward());
          WidgetItem.reward = RewardCache.getReward();
        }

        WidgetItem.confirmCancel = function () {
          ViewStack.push({
            template: 'Confirm_Cancel'
          });
        };

        WidgetItem.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };
      }])
})(window.angular, window);
