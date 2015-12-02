'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetHome = this;

        WidgetHome.openReward = function () {
          ViewStack.push({
            template: 'Item_Details'
          });
        };

        WidgetHome.openGetPoints = function () {
          console.log(">>>>>>>>>>>>>>");
          ViewStack.push({
            template: 'Amount'
          });
        };

      }]);
})(window.angular);

