'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetSuccessCtrl', ['$scope', 'ViewStack', 'RewardCache', '$sce',
      function ($scope, ViewStack, RewardCache, $sce) {

        var WidgetSuccess = this;

        if (RewardCache.getReward()) {
          WidgetSuccess.reward = RewardCache.getReward();
        }

        WidgetSuccess.goToHome = function () {
          ViewStack.popAllViews();
        };

        WidgetSuccess.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

      }])
})(window.angular, window);
