'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget', ['ngRoute'])
    .config(['$routeProvider', '$compileProvider', function ($routeProvider, $compileProvider) {

      /**
       * To make href urls safe on mobile
       */
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|cdvfile|file):/);


      $routeProvider
        .when('/', {
          template: '<div></div>'
        })
        .when('/reward/:id', {
          templateUrl: 'templates/Item_Details.html',
          controllerAs: 'WidgetItem',
          controller: 'WidgetItemCtrl'
        })
        .otherwise('/');
    }])
})(window.angular, window.buildfire);