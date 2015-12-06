'use strict';
(function (angular) {
  angular
    .module('loyaltyPluginContent',['ngRoute', 'ui.bootstrap'])
      .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
              templateUrl: 'templates/home.html',
              controllerAs: 'SettingsHome',
              controller: 'SettingsCtrl'
            })
            .otherwise('/');
      }])
})(window.angular);
