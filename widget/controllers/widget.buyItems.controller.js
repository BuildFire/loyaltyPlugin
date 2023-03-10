'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetBuyItemsCtrl', ['$scope', 'ViewStack', 'RewardCache', 'TAG_NAMES', 'DataStore', '$sce', '$rootScope', 'Transactions',
      function ($scope, ViewStack, RewardCache, TAG_NAMES, DataStore, $sce, $rootScope, Transactions) {

        var WidgetBuyItems = this;
        var breadCrumbFlag = true;
        WidgetBuyItems.data = [];
        WidgetBuyItems.items = [];
        WidgetBuyItems.listeners = {};
        WidgetBuyItems.totalPoints = 0;
        WidgetBuyItems.strings = $rootScope.strings;
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

          WidgetBuyItems.getCurrentUser = function() {
            buildfire.auth.getCurrentUser(function (err, user) {
              if(user){
                WidgetBuyItems.currentUser = user;
              }
            })
          }


          WidgetBuyItems.onUpdateCallback = function (event) {
          setTimeout(function () {
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.LOYALTY_INFO:
                  WidgetBuyItems.data = event.data;
                  break;
              }
              if (!$scope.$$phase) $scope.$digest();
            }
          }, 0);
        };
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
          WidgetBuyItems.getCurrentUser();
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

        WidgetBuyItems.onQuantityChange = function () {
          let totalPoints = 0;
          WidgetBuyItems.items.forEach(function(item) {
            if(item.quantity && item.quantity > 0)
              totalPoints += item.quantity * item.pointsPerItem;
          });
          WidgetBuyItems.totalPoints = totalPoints;
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
          var amount = calculatedPoints;
          calculatedPoints +=  WidgetBuyItems.application.pointsPerVisit + currentView.loyaltyPoints;
          if (WidgetBuyItems.application.totalLimit <= calculatedPoints) {
            buildfire.dialog.toast({
              message: WidgetBuyItems.strings["redeem.redeemDailyLimit"],
              type: "danger",
            });
          }
          else if(WidgetBuyItems.data.settings && WidgetBuyItems.data.settings.approvalType 
            && WidgetBuyItems.data.settings.approvalType == "REMOVE_VIA_APP") {
              let items = [];
              let points = 0
              WidgetBuyItems.items.forEach(element => {
                  if(element.quantity != ""){
                    items.push(element)
                    points += element.quantity * parseInt(element.pointsPerItem)
                  }
              });

              Transactions.requestPointsForPurhasedItems(items, $rootScope.loyaltyPoints, WidgetBuyItems.currentUser);
              buildfire.notifications.pushNotification.schedule(
                {
                  title: "Points Approval Request",
                  text: (WidgetBuyItems.currentUser.displayName != "" ? WidgetBuyItems.currentUser.displayName : WidgetBuyItems.currentUser.email)+ " requests " + points + " points earned for "  + (items.length == 1 ? "1 item" : items.length + " items"),
                  groupName: "employerGroup"
                , at: new Date()
                },
                (err, result) => {
                  if (err) return console.error(err);
                })
                buildfire.dialog.toast({
                  message: "Points awaiting for approval",
                  duration: 3000,
                  type: "warning"
                });
                $rootScope.$broadcast('POINTS_WAITING_APPROVAL_ADDED', (points * WidgetBuyItems.application.pointsPerDollar) + WidgetBuyItems.application.pointsPerVisit);
                ViewStack.pop();
          } 
          else {
            ViewStack.push({
              template: 'Code',
              amount: amount,
              type: 'buyProducts',
              items: WidgetBuyItems.items
            });
          }

         

        };

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, WidgetBuyItems.onUpdateCallback);

      }]);
})(window.angular);
