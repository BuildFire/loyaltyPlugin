'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetRedeemCtrl', ['$scope', 'ViewStack', 'RewardCache', 'LoyaltyAPI', '$timeout', '$rootScope', 'Buildfire',
      function ($scope, ViewStack, RewardCache, LoyaltyAPI, $timeout, $rootScope, Buildfire) {

        var WidgetRedeem = this;

        /**
         * Initialize show error message to false
         */
        WidgetRedeem.redeemFail = false;
        WidgetRedeem.dailyLimitExceeded = false;

        if (RewardCache.getReward()) {
          WidgetRedeem.reward = RewardCache.getReward();
        }

        /**
         * Method to redeem points from user's account using Loyalty api. Redirect to success page if redeemed successfully.
         */
        WidgetRedeem.redeemPoints = function (rewardId) {
          var redeemSuccess = function () {
            Buildfire.spinner.hide();
            $rootScope.$broadcast('POINTS_REDEEMED', WidgetRedeem.reward.pointsToRedeem);
            ViewStack.push({
              template: 'Success'
            });
          };

          var redeemFailure = function (error) {
            Buildfire.spinner.hide();
            if (error && error.code == 2103) {
              WidgetRedeem.dailyLimitExceeded = true;
              $timeout(function () {
                WidgetRedeem.dailyLimitExceeded = false;
              }, 3000);
            } else {
              WidgetRedeem.redeemFail = true;
              $timeout(function () {
                WidgetRedeem.redeemFail = false;
              }, 3000);
            }
          };
          if(WidgetRedeem.currentLoggedInUser){
            Buildfire.spinner.show();
            LoyaltyAPI.redeemPoints(WidgetCode.currentLoggedInUser._id, WidgetRedeem.currentLoggedInUser.userToken, '1449814143554-01452660677023232', rewardId).then(redeemSuccess, redeemFailure);
          }
          else{
            buildfire.auth.login({}, function () {

            });
          }
        };

        /**
         * Method to go back to previous page
         */
        WidgetRedeem.backToHome = function () {
          ViewStack.pop();
        };

        $rootScope.$on('REWARD_UPDATED', function (e, item) {
          WidgetRedeem.reward = item;
        });
        $rootScope.$on("Carousel3:LOADED", function () {
          WidgetRedeem.view=null;
          if (!WidgetRedeem.view) {
            WidgetRedeem.view = new buildfire.components.carousel.view("#carousel3", [], "WideScreen");
          }
          if (WidgetRedeem.reward && WidgetRedeem.reward.carouselImage) {
            WidgetRedeem.view.loadItems(WidgetRedeem.reward.carouselImage, null, "WideScreen");
          } else {
            WidgetRedeem.view.loadItems([]);
          }
        });

        /**
         * Check for current logged in user
         */
        buildfire.auth.getCurrentUser(function (err, user) {
          console.log("_______________________", user);
          if (user) {
            WidgetRedeem.currentLoggedInUser = user;
            $scope.$digest();
          }
        });

      }])
})(window.angular, window.buildfire);

