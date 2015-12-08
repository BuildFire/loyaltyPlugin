'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetCodeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'RewardCache',
      function ($scope, ViewStack, LoyaltyAPI, RewardCache) {

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
            ViewStack.push({
              template: 'Awarded',
              pointsAwarded: (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit
            });
          };

          var error = function (error) {
            console.log("Error while addimg points:", error);
            WidgetCode.passcodeFailure = true;
            setTimeout(function () {
              WidgetCode.passcodeFailure = false;
              $scope.$digest();
            }, 3000);
          };

          LoyaltyAPI.addLoyaltyPoints('5317c378a6611c6009000001', 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=', 'e22494ec-73ea-44ac-b82b-75f64b8bc535', WidgetCode.passcode, currentView.amount)
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

          LoyaltyAPI.validatePasscode('ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=', 'e22494ec-73ea-44ac-b82b-75f64b8bc535', WidgetCode.passcode).then(success, error);
        };
      }])
})(window.angular);