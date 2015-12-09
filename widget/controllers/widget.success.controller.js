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

        /**
         * Method to return to home page
         */
        WidgetSuccess.goToHome = function () {
          ViewStack.popAllViews();
        };

        /**
         * Method to parse and show reward's description in html format
         */
        WidgetSuccess.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

      }])
})(window.angular, window);
