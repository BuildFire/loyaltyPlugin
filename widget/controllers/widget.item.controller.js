'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetItemCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetItem = this;

        WidgetItem.confirmCancel = function () {
          ViewStack.push({
            template: 'Confirm_Cancel'
          });
        };
      }])
})(window.angular, window);
