'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetBuyItemsCtrl', ['$scope', 'ViewStack', 'RewardCache', 'TAG_NAMES', 'DataStore', '$sce', '$rootScope',
      function ($scope, ViewStack, RewardCache, TAG_NAMES, DataStore, $sce, $rootScope) {

        var WidgetBuyItems = this;
        var breadCrumbFlag = true;
        WidgetBuyItems.totalLimitExceeded = false;
        WidgetBuyItems.data = [];
        WidgetBuyItems.items = [];
        WidgetBuyItems.listeners = {};
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
        WidgetBuyItems.items = currentView.loyaltyRewards.map(function (item) {
          item.quantity = "";
          return item;
        });

        if (RewardCache.getApplication()) {
          WidgetBuyItems.application = RewardCache.getApplication();
        }

        /*Get application data*/
        WidgetBuyItems.init = function () {
          WidgetBuyItems.success = function (result) {
            WidgetBuyItems.data = result.data;
          };
          WidgetBuyItems.error = function (err) {
            console.error('Error while getting data', err);
          };
          DataStore.get(TAG_NAMES.LOYALTY_INFO).then(WidgetBuyItems.success, WidgetBuyItems.error);
        };

        /*covert html symbols to currency symbol*/
        WidgetBuyItems.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetBuyItems.preventClickBehavior = function (event) {
          console.log("**********", event);
          event.stopPropagation();
        };

        WidgetBuyItems.isNextDisabled = function () {
          let isDisabled = true;
          WidgetBuyItems.items.forEach(function(item) {
            if(item.quantity && item.quantity > 0)
              isDisabled = false;
          });
          return isDisabled;
        }

        /**
         * Method to check if user has exceeded the total points limit.
         */
        WidgetBuyItems.init();

        WidgetBuyItems.confirmCode = function () {
          var calculatedPoints = 0;
          WidgetBuyItems.items.forEach(function(item) {
            if(item.quantity && item.quantity > 0)
              calculatedPoints += item.pointsPerItem * item.quantity;
          });
          var amount = calculatedPoints / WidgetBuyItems.application.pointsPerDollar;
          calculatedPoints +=  WidgetBuyItems.application.pointsPerVisit + currentView.loyaltyPoints;
          if (WidgetBuyItems.application.totalLimit <= calculatedPoints) {
            WidgetBuyItems.totalLimitExceeded = true;
            setTimeout(function () {
              WidgetBuyItems.totalLimitExceeded = false;
              $scope.$digest();
            }, 3000);
          }
          else {
            ViewStack.push({
              template: 'Code',
              amount: amount
            });
          }
        };

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, WidgetBuyItems.onUpdateCallback);

      }]);
})(window.angular);
