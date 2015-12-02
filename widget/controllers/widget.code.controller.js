'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetCodeCtrl', ['$scope', 'ViewStack',
      function ($scope, ViewStack) {

        var WidgetCode = this;

        WidgetCode.addPoints = function () {
          ViewStack.push({
            template: 'Awarded'
          });
        };
      }])
})(window.angular);