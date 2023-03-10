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
                    controller: 'ContentHomeCtrl',
                    resolve: {
                        context: function (Context) {
                            return Context.getContext();
                        }
                    }
                })
                .when('/reward', {
                    templateUrl: 'templates/reward.html',
                    controllerAs: 'ContentReward',
                    controller: 'ContentRewardCtrl',
                    resolve: {
                        context: function (Context) {
                            return Context.getContext();
                        }
                    }
                })
                .when('/reward/:id/:index', {
                    templateUrl: 'templates/reward.html',
                    controllerAs: 'ContentReward',
                    controller: 'ContentRewardCtrl',
                    resolve: {
                        context: function (Context) {
                            return Context.getContext();
                        }
                    }
                })
                .otherwise('/');
        }]).filter('getImageUrl', function () {
            return function (url, width, height, type) {
                    let croppedImage = buildfire.imageLib.cropImage(
                        url,
                        { size: "full_width", aspect: "16:9" }
                      );
                      return croppedImage;
            }
        })
        .directive("loadImage", [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.attr("src", "../../../../styles/media/holder-" + attrs.loadImage + ".gif");

                    var elem = $("<img>");
                    elem[0].onload = function () {
                        element.attr("src", attrs.finalSrc);
                        elem.remove();
                    };
                    elem.attr("src", attrs.finalSrc);
                }
            };
        }])
        .run(['$location', '$rootScope', 'RewardCache', 'Buildfire', function ($location, $rootScope, RewardCache, Buildfire) {
            Buildfire.messaging.onReceivedMessage = function (msg) {
                switch (msg.type) {
                    case 'OpenItem':
                        RewardCache.setReward(msg.data);
                        $location.path('/reward/' + msg.data._id + '/' + msg.index);
                        if (!$rootScope.$$phase) $rootScope.$apply();
                        break;
                    case 'BackToHome':
                        $location.path('/');
                        if (!$rootScope.$$phase) $rootScope.$apply();
                        break;
                }
            };

              Buildfire.analytics.registerEvent(
                  { title: "Reward redeemed", key: 'reward-redeemed', description: "User has redeemed a reward" }, 
                  { silentNotification: true }
              );
              Buildfire.analytics.registerEvent(
                { title: "Points earned", key: 'points-earned', description: "User has earned points" }, 
                { silentNotification: true }
              );
        }])
})(window.angular, window.buildfire);