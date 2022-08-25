'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginResults')
    .controller('ResultDetailsCtrl', ['$scope', '$rootScope','Buildfire', '$location',
      function ($scope, $rootScope ,Buildfire, $location) {
        if($rootScope.result.items && $rootScope.result.items.length > 0){
          let pointsEarned = 0;
          $rootScope.result.items.forEach(element => {
            element.pointEarned = parseInt(element.pointsPerItem) * parseInt(element.quantity)
            pointsEarned += parseInt(element.pointsPerItem)
          });
          $rootScope.result.pointsEarned = pointsEarned;
        }
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

