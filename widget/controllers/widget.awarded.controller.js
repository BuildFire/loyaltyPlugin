'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetAwardedCtrl', ['$scope', 'ViewStack', '$rootScope',
      function ($scope, ViewStack, $rootScope) {

        var WidgetAwarded = this;
        var breadCrumbFlag = true;
        WidgetAwarded.listeners = {};
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

          //Refresh item details on pulling the tile bar

          buildfire.datastore.onRefresh(function () {
          });

        WidgetAwarded.pointsAwarded = currentView.pointsAwarded;

        /**
         * Method to return to home page
         */
        WidgetAwarded.goToHome = function () {
//          ViewStack.popAllViews();
            buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
                if (result && result.length) {
                    result.forEach(function (breadCrumb) {
                        if (breadCrumb.options && breadCrumb.options.elementToShow) {
                            buildfire.history.pop();
                        }
                    });
                }
            });
        };

          WidgetAwarded.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
              if (ViewStack.getCurrentView().template == 'Award') {
                  buildfire.datastore.onRefresh(function () {
                  });
              }
          });

      }])
})(window.angular, window.buildfire);