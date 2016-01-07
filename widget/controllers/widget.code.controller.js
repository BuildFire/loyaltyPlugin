'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetCodeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'RewardCache', '$rootScope', 'Buildfire', 'Context',
      function ($scope, ViewStack, LoyaltyAPI, RewardCache, $rootScope, Buildfire, Context) {

        var WidgetCode = this;
        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

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
            ViewStack.push({
              template: 'Awarded',
              pointsAwarded: (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit
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