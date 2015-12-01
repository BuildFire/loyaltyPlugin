'use strict';

(function (angular) {
  angular.module('loyaltyPluginContent', ['ngRoute', 'ui.bootstrap', 'ui.tinymce'])
    //injected ngRoute for routing
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controllerAs: 'ContentHome',
          controller: 'ContentHomeCtrl'
        })
        .otherwise('/');
    }])
})(window.angular);