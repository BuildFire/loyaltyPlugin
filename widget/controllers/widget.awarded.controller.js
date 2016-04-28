'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetAwardedCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetAwarded = this;
        var breadCrumbFlag = true;
        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

          buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
              if(result && result.length) {
                  result.forEach(function(breadCrumb) {
                      if(breadCrumb.label == 'Award') {
                          breadCrumbFlag = false;
                      }
                  });
              }
              if(breadCrumbFlag) {
                  buildfire.history.push('Award', { elementToShow: 'Award' });
              }
          });

        WidgetAwarded.pointsAwarded = currentView.pointsAwarded;

        /**
         * Method to return to home page
         */
        WidgetAwarded.goToHome = function () {
          ViewStack.popAllViews();
        };

      }])
})(window.angular, window.buildfire);