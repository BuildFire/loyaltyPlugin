'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetAmountCtrl', ['$scope', 'ViewStack', 'RewardCache',
      function ($scope, ViewStack, RewardCache) {

        var WidgetAmount = this;

        WidgetAmount.dailyLimitExceeded = false;
        WidgetAmount.totalLimitExceeded = false;

        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        if (RewardCache.getApplication()) {
          WidgetAmount.application = RewardCache.getApplication();
        }

        /**
         * Method to check if user has exceeded the total points limit.
         */
        WidgetAmount.confirmCode = function () {
          var calculatedPoints = (WidgetAmount.amount * WidgetAmount.application.pointsPerDollar) + currentView.loyaltyPoints;
          if (WidgetAmount.application.totalPoints <= calculatedPoints) {
            WidgetAmount.totalLimitExceeded = true;
            setTimeout(function () {
              WidgetAmount.totalLimitExceeded = false;
            }, 3000);
          }
          else {
            ViewStack.push({
              template: 'Code'
            });
          }
        };

      }]);
})(window.angular);
