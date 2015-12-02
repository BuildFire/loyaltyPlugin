'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetHome = this;

        WidgetHome.openReward = function () {
          console.log(">>>>>>>>>>>>>>");
          ViewStack.push({
            template: 'Item_Details'
          });
        };

      }]);
})(window.angular, window);

