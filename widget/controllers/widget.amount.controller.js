'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetAmountCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetAmount = this;

        WidgetAmount.confirmCode = function () {
          ViewStack.push({
            template: 'Code'
          });
        };

      }]);
})(window.angular);
