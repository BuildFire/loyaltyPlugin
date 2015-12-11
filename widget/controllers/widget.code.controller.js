'use strict';

(function (angular,buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetCodeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'RewardCache', '$rootScope',
      function ($scope, ViewStack, LoyaltyAPI, RewardCache, $rootScope) {

        var WidgetCode = this;
        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        WidgetCode.passcodeFailure = false;

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
            console.log("Error while addimg points:", error);
            WidgetCode.passcodeFailure = true;
            setTimeout(function () {
              WidgetCode.passcodeFailure = false;
              $scope.$digest();
            }, 3000);
          };
          Buildfire.spinner.show();
          LoyaltyAPI.addLoyaltyPoints('5317c378a6611c6009000001', WidgetCode.currentLoggedInUser.userToken, '1449814143554-01452660677023232', WidgetCode.passcode, currentView.amount)
            .then(success, error);
        };

        WidgetCode.confirmPasscode = function () {
          var success = function (result) {
            console.log("Passcode valid");
            console.log(result);
            WidgetCode.addPoints();
          };

          var error = function () {
            console.log("Invalid passcode");
            WidgetCode.addPoints();
          };

          LoyaltyAPI.validatePasscode(WidgetCode.currentLoggedInUser.userToken, '1449814143554-01452660677023232', WidgetCode.passcode).then(success, error);
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