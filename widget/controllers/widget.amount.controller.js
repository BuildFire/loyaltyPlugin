'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetAmountCtrl', ['$scope', 'Utils', 'ViewStack', 'RewardCache', 'TAG_NAMES', 'DataStore', '$sce', '$rootScope', 'Transactions',
      function ($scope, Utils, ViewStack, RewardCache, TAG_NAMES, DataStore, $sce, $rootScope, Transactions) {

        var WidgetAmount = this;
        var breadCrumbFlag = true;

        WidgetAmount.data = [];
        WidgetAmount.listeners = {};
        WidgetAmount.currentUser = null;

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
          WidgetAmount.getCurrentUser();
        };


        WidgetAmount.getCurrentUser = function() {
          buildfire.auth.getCurrentUser(function (err, user) {
            if(user){
              WidgetAmount.currentUser = user;
            }
          })
        }

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
              if (!$scope.$$phase) $scope.$digest();
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

            Utils.getLanguage('redeem.redeemDailyLimit').then(message=>{
              buildfire.dialog.toast({
                message: message,
                type: "danger",
              });
            });
          }
          else if(WidgetAmount.data.settings && WidgetAmount.data.settings.approvalType
                && WidgetAmount.data.settings.approvalType == "REMOVE_VIA_APP") {
              Transactions.requestPoints(WidgetAmount.amount, WidgetAmount.amount, $rootScope.loyaltyPoints, WidgetAmount.currentUser, "POINTS PURCHASE", null)
              buildfire.notifications.pushNotification.schedule(
                {
                  title: "Points Approval Request",
                  text:  WidgetAmount.currentUser.displayName + " requests " + WidgetAmount.amount + " points earned",
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
                $rootScope.$broadcast('POINTS_WAITING_APPROVAL_ADDED', (WidgetAmount.amount * WidgetAmount.application.pointsPerDollar) + WidgetAmount.application.pointsPerVisit);
                ViewStack.pop();
          } else {
            ViewStack.push({
              template: 'Code',
              amount: WidgetAmount.amount,
              type: 'buyPoints',
              title: "BUY POINTS",
              iconUrl: ""
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
