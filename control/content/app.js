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
        .when('/reward', {
          templateUrl: 'templates/reward.html',
          controllerAs: 'ContentReward',
          controller: 'ContentRewardCtrl'
        })
        .when('/reward/:id', {
          templateUrl: 'templates/reward.html',
          controllerAs: 'ContentReward',
          controller: 'ContentRewardCtrl'
        })
        .otherwise('/');
    }]).filter('getImageUrl', function () {
        return function (url, width, height, type) {
          if (type == 'resize')
            return buildfire.imageLib.resizeImage(url, {
              width: width,
              height: height
            });
          else
            return buildfire.imageLib.cropImage(url, {
              width: width,
              height: height
            });
        }
      })
})(window.angular);