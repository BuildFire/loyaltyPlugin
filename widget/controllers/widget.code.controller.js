'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetCodeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI',
      function ($scope, ViewStack, LoyaltyAPI) {

        var WidgetCode = this;
        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        WidgetCode.passcodeFailure = false;

        WidgetCode.addPoints = function () {

          var success = function (result) {
            ViewStack.push({
              template: 'Awarded'
            });
          };

          var error = function (error) {
            console.log("Error while addimg points:", error);
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