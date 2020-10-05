'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetAmountCtrl', ['$scope', 'ViewStack', 'RewardCache', 'TAG_NAMES', 'DataStore', '$sce', '$rootScope',
      function ($scope, ViewStack, RewardCache, TAG_NAMES, DataStore, $sce, $rootScope) {

        var WidgetAmount = this;
        var breadCrumbFlag = true;

        WidgetAmount.totalLimitExceeded = false;
        WidgetAmount.data = [];
        WidgetAmount.listeners = {};
        WidgetAmount.strings = $rootScope.strings;
        
          buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
              if(result && result.length) {
                  result.forEach(function(breadCrumb) {
                      if(breadCrumb.label == 'Amount') {
                          breadCrumbFlag = false;
                      }
                  });
              }
              if(breadCrumbFlag) {
                  buildfire.history.push('Amount', { elementToShow: 'Amount' });
              }
          });

          //Refresh item details on pulling the tile bar

          buildfire.datastore.onRefresh(function () {
          });

        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        if (RewardCache.getApplication()) {
          WidgetAmount.application = RewardCache.getApplication();
        }

        /*Get application data*/
        WidgetAmount.init = function () {
          WidgetAmount.success = function (result) {
            WidgetAmount.data = result.data;
          };
          WidgetAmount.error = function (err) {
            console.error('Error while getting data', err);
          };
          DataStore.get(TAG_NAMES.LOYALTY_INFO).then(WidgetAmount.success, WidgetAmount.error);
        };

        /*covert html symbols to currency symbol*/
        WidgetAmount.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetAmount.onUpdateCallback = function (event) {
          setTimeout(function () {
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.LOYALTY_INFO:
                  WidgetAmount.data = event.data;
                  break;
              }
              $scope.$digest();
            }
          }, 0);
        };

        WidgetAmount.preventClickBehavior = function (event) {
          console.log("**********", event);
          event.stopPropagation();
        };

        /**
         * Method to check if user has exceeded the total points limit.
         */
        WidgetAmount.init();

        WidgetAmount.confirmCode = function () {
          var calculatedPoints = (WidgetAmount.amount * WidgetAmount.application.pointsPerDollar) + WidgetAmount.application.pointsPerVisit + currentView.loyaltyPoints;
          if (WidgetAmount.application.totalLimit <= calculatedPoints) {
            WidgetAmount.totalLimitExceeded = true;
            setTimeout(function () {
              WidgetAmount.totalLimitExceeded = false;
              $scope.$digest();
            }, 3000);
          }
          else {
            ViewStack.push({
              template: 'Code',
              amount: WidgetAmount.amount,
              type: 'buyPoints'
            });
          }
        };

          WidgetAmount.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
              if (ViewStack.getCurrentView().template == 'Amount') {
                  buildfire.datastore.onRefresh(function () {
                  });
              }
          });

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, WidgetAmount.onUpdateCallback);

      }]);
})(window.angular);
