'use strict';

(function (angular, buildfire) {
  angular.module('loyaltyPluginContent', ['ngRoute', 'ui.bootstrap', 'ui.tinymce',
    'ui.sortable', 'ngAnimate'])
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
    .run(['$location', '$rootScope', 'RewardCache', function ($location, $rootScope, RewardCache) {
      buildfire.messaging.onReceivedMessage = function (msg) {
        switch (msg.type) {
          case 'OpenItem':
            RewardCache.setReward(msg.data);
            $location.path('/reward/' + msg.data._id);
            $rootScope.$apply();
            break;
          case 'BackToHome':
            $location.path('/');
            $rootScope.$apply();
            break;
        }
      };
    }])
})(window.angular, window.buildfire);