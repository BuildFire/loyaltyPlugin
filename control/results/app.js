'use strict';
(function (angular) {
  angular
    .module('loyaltyPluginResults', ['ngRoute', 'ui.bootstrap', 'infinite-scroll'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controllerAs: 'ResultsHome',
          controller: 'ResultsHomeCtrl',
          resolve: {
            context: function (Context) {
                return Context.getContext();
            }
        }
        })
        .when('/details', {
          templateUrl: 'templates/details.html',
          controllerAs: 'ResultDetails',
          controller: 'ResultDetailsCtrl'
        })
        .otherwise('/');
    }])
})(window.angular);
