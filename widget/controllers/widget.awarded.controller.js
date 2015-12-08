'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetAwardedCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetAwarded = this;

        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        WidgetAwarded.pointsAwarded = currentView.pointsAwarded;

        /**
         * Method to return to home page
         */
        WidgetAwarded.goToHome = function () {
          ViewStack.popAllViews();
        };

      }])
})(window.angular, window);