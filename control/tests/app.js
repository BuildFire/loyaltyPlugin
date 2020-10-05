'use strict';
(function (angular) {
  angular
    .module('loyaltyPluginTests',['ngRoute', 'ui.bootstrap'])
      .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
              templateUrl: 'templates/home.html',
              controllerAs: 'TestsHome',
              controller: 'TestsHomeCtrl'
            })
            .otherwise('/');
      }])
})(window.angular);
