'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetRedeemCtrl', ['$scope', 'ViewStack', 'RewardCache', 'LoyaltyAPI', '$timeout', '$rootScope', 'Buildfire', 'Context', 'Transactions', 
      function ($scope, ViewStack, RewardCache, LoyaltyAPI, $timeout, $rootScope, Buildfire, Context, Transactions) {

        var WidgetRedeem = this;
        var breadCrumbFlag = true;

        WidgetRedeem.strings = $rootScope.strings;

        /**
         * Initialize show error message to false
         */
        WidgetRedeem.context = Context.getContext();
        WidgetRedeem.listeners = {};

          buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
              if(result && result.length) {
                  result.forEach(function(breadCrumb) {
                      if(breadCrumb.label == 'Redeem') {
                          breadCrumbFlag = false;
                      }
                  });
              }
              if(breadCrumbFlag) {
                  buildfire.history.push('Redeem', { elementToShow: 'Redeem' });
              }
          });

          //Refresh item details on pulling the tile bar

          buildfire.datastore.onRefresh(function () {
          });

        if (RewardCache.getReward()) {
          WidgetRedeem.reward = RewardCache.getReward();
        }

        /**
         * Initialize WidgetRedeem.application with current loyalty app details set in home controller
         */
        if (RewardCache.getApplication()) {
          WidgetRedeem.application = RewardCache.getApplication();
        }

        /**
         * Method to redeem points from user's account using Loyalty api. Redirect to success page if redeemed successfully.
         */
        WidgetRedeem.redeemPoints = function (rewardId) {
          if (WidgetRedeem.currentLoggedInUser) {
            if (WidgetRedeem.application.dailyLimit > WidgetRedeem.reward.pointsToRedeem) {
              Buildfire.spinner.show();
              ViewStack.push({
                template: 'Success'
              });
              buildfire.auth.getCurrentUser(function (err, user) {
                if (user) {
                  Transactions.requestRedeem(WidgetRedeem.reward, WidgetRedeem.reward.pointsToRedeem, $rootScope.loyaltyPoints, user);
                  $rootScope.$broadcast('POINTS_WAITING_APPROVAL_ADDED', WidgetRedeem.reward.pointsToRedeem);
          
                }
              })
            }
            else {
              buildfire.dialog.toast({
                message: WidgetRedeem.strings["redeem.insufficientFunds"],
                type: "danger",
              });
            }
          }
          else {
            buildfire.auth.login({}, function () {

            });
          }
        };

        /**
         * Method to go back to previous page
         */
        WidgetRedeem.backToHome = function () {
          buildfire.history.pop();
        };

        WidgetRedeem.listeners['REWARD_UPDATED'] = $rootScope.$on('REWARD_UPDATED', function (e, item, index) {
          if (item.carouselImage) {
            WidgetRedeem.reward.carouselImage = item.carouselImage || [];
            if (WidgetRedeem.view) {
              WidgetRedeem.view.loadItems(WidgetRedeem.reward.carouselImage, null, "WideScreen");
            }
          }

          if (item && item.title) {
            WidgetRedeem.reward.title = item.title;
          }
          if (item && item.description) {
            WidgetRedeem.reward.description = item.description;
          }
          if (item && item.pointsToRedeem) {
            WidgetRedeem.reward.pointsToRedeem = item.pointsToRedeem;
          }
        });

        WidgetRedeem.listeners['Carousel3:LOADED'] = $rootScope.$on("Carousel3:LOADED", function () {
          WidgetRedeem.view = null;
          if (!WidgetRedeem.view) {
            WidgetRedeem.view = new buildfire.components.carousel.view("#carousel3", [], "WideScreen");
          }
          if (WidgetRedeem.reward && WidgetRedeem.reward.carouselImage) {
            WidgetRedeem.view.loadItems(WidgetRedeem.reward.carouselImage, null, "WideScreen");
          } else {
            WidgetRedeem.view.loadItems([]);
          }
        });

        WidgetRedeem.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
          if (!view || view.template === "Confirm_Cancel") {
            $scope.$destroy();
          }
        });

          WidgetRedeem.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
              if (ViewStack.getCurrentView().template == 'Redeem') {
                  buildfire.datastore.onRefresh(function () {
                  });
              }
          });

        /**
         * Check for current logged in user
         */
        buildfire.auth.getCurrentUser(function (err, user) {
          console.log("_______________________", user);
          if (user) {
            WidgetRedeem.currentLoggedInUser = user;
            if (!$scope.$$phase) $scope.$digest();
          }
        });

        $scope.$on("$destroy", function () {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>destroyed");
          if (WidgetRedeem.view) {
            WidgetRedeem.view._destroySlider();
            WidgetRedeem.view._removeAll();
          }
          for (var i in WidgetRedeem.listeners) {
            if (WidgetRedeem.listeners.hasOwnProperty(i)) {
              WidgetRedeem.listeners[i]();
            }
          }
        });

      }])
})(window.angular, window.buildfire);

