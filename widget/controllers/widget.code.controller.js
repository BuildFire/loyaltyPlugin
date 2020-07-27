'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetCodeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'RewardCache', '$rootScope', 'Buildfire', 'Context', 'Transactions',
      function ($scope, ViewStack, LoyaltyAPI, RewardCache, $rootScope, Buildfire, Context, Transactions) {

        var WidgetCode = this;
        var breadCrumbFlag = true;
        WidgetCode.listeners = {};
        WidgetCode.strings = $rootScope.strings;
        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

          buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
              if(result && result.length) {
                  result.forEach(function(breadCrumb) {
                      if(breadCrumb.label == 'Confirm') {
                          breadCrumbFlag = false;
                      }
                  });
              }
              if(breadCrumbFlag) {
                  buildfire.history.push('Confirm', { elementToShow: 'Confirm' });
              }
          });

          //Refresh item details on pulling the tile bar

          buildfire.datastore.onRefresh(function () {
          });

        WidgetCode.passcodeFailure = false;
        WidgetCode.dailyLimitExceeded = false;

        WidgetCode.context = Context.getContext();

        if (RewardCache.getApplication()) {
          WidgetCode.application = RewardCache.getApplication();
        } 

        WidgetCode.addPoints = function () {
          var success = function (result) {
            Buildfire.spinner.hide();
            $rootScope.$broadcast('POINTS_ADDED', (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit);
            const pointsPerDollar = WidgetCode.application.pointsPerDollar ? WidgetCode.application.pointsPerDollar : 1;
            const pointsPerVisit = WidgetCode.application.pointsPerVisit ? WidgetCode.application.pointsPerVisit : 1;
            var pointsAwarded = (currentView.amount * pointsPerDollar) + pointsPerVisit;
            ViewStack.push({
              template: 'Awarded',
              pointsAwarded: pointsAwarded
            });
            buildfire.auth.getCurrentUser(function (err, user) {
              if (user) {
                console.log(currentView);
                if(currentView.type === 'buyPoints') {
                  Transactions.buyPoints(currentView.amount, pointsAwarded, $rootScope.loyaltyPoints, user);
                } else if(currentView.type === 'buyProducts') {
                  Transactions.buyProducts(currentView.items, $rootScope.loyaltyPoints, user);
                } else {
                  return;
                }
              }
            });            
          };

          var error = function (error) {
            Buildfire.spinner.hide();
            console.log("Error while adding points:", error);
            if (error.code == 2103) {
              WidgetCode.dailyLimitExceeded = true;
              setTimeout(function () {
                WidgetCode.dailyLimitExceeded = false;
                $scope.$digest();
              }, 3000);
            }

          };
          Buildfire.spinner.show();
          LoyaltyAPI.addLoyaltyPoints(WidgetCode.currentLoggedInUser._id, WidgetCode.currentLoggedInUser.userToken, WidgetCode.context.instanceId, WidgetCode.passcode, currentView.amount)
            .then(success, error);
        };

        WidgetCode.confirmPasscode = function () {
          var success = function (result) {
            Buildfire.spinner.hide();
            console.log("Passcode valid");
            console.log(result);
            WidgetCode.addPoints();
          };

          var error = function () {
            Buildfire.spinner.hide();
            console.log("Error: Invalid passcode");
            WidgetCode.passcodeFailure = true;
            setTimeout(function () {
              WidgetCode.passcodeFailure = false;
              $scope.$digest();
            }, 3000);
          };
          Buildfire.spinner.show();
          LoyaltyAPI.validatePasscode(WidgetCode.currentLoggedInUser.userToken, WidgetCode.context.instanceId, WidgetCode.passcode).then(success, error);
        };

        WidgetCode.preventClickBehavior = function (event) {
          console.log("#############", event);
          event.preventDefault();
        };

          WidgetCode.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
              if (ViewStack.getCurrentView().template == 'Confirm') {
                  buildfire.datastore.onRefresh(function () {
                  });
              }
          });

        /**
         * Check for current logged in user
         */
        buildfire.auth.getCurrentUser(function (err, user) {
          console.log("_______________________", user);
          if (user) {
            WidgetCode.currentLoggedInUser = user;
            $scope.$digest();
          }
        });

      }])
})(window.angular, window.buildfire);