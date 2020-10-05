'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginResults')
    .controller('ResultDetailsCtrl', ['$scope', '$rootScope','Buildfire', '$location',
      function ($scope, $rootScope ,Buildfire, $location) {
        var ResultDetails = this;
        $scope.item = $rootScope.result;

        $scope.typesMapping = {
          earnPoints: 'Earn Points',
          redeemReward: 'Redeem Reward'
        }

        ResultDetails.goBack = function() {
          $location.path("/");
        }

      }]);
})(window.angular, window.buildfire);

