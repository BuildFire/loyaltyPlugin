'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetRedeemCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetRedeem = this;

        WidgetRedeem.redeemPoints = function () {
          ViewStack.push({
            template: 'Success'
          });
        };
      }])
})(window.angular, window);

