'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetItemCtrl', ['$scope', 'ViewStack', 'RewardCache', '$sce', '$rootScope',
      function ($scope, ViewStack, RewardCache, $sce, $rootScope) {

        var WidgetItem = this;

        WidgetItem.listeners = {};

        //create new instance of buildfire carousel viewer
        WidgetItem.view = null;

        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        /**
         * Initialize WidgetItem.reward with reward details set in home controller
         */
        if (RewardCache.getReward()) {
          WidgetItem.reward = RewardCache.getReward();
        }

        /**
         * Check if user's total loyalty points are enough to redeem the reward, if yes redirect to next page.
         */
        WidgetItem.confirmCancel = function () {
          if (WidgetItem.reward.pointsToRedeem <= currentView.totalPoints) {
            ViewStack.push({
              template: 'Confirm_Cancel'
            });
          } else {
            alert("Not Enough Points. Please earn more points in order to redeem this reward.");
          }
        };

        /**
         * Method to parse and show reward's description in html format
         */
        WidgetItem.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetItem.listeners['REWARD_UPDATED'] =  $rootScope.$on('REWARD_UPDATED', function (e, item) {

          if (item.carouselImage){
             WidgetItem.reward.carouselImage = item.carouselImage || [];
            if (WidgetItem.view) {
             WidgetItem.view.loadItems(WidgetItem.reward.carouselImage, null, "WideScreen");
            }
          }

          if (item && item.title) {
            WidgetItem.reward.title = item.title;
          }
          if (item && item.description) {
            WidgetItem.reward.description = item.description;
          }
          if (item && item.pointsToRedeem) {
            WidgetItem.reward.pointsToRedeem = item.pointsToRedeem;
          }
        });

        /**
         * This event listener is bound for "Carousel2:LOADED" event broadcast
         */
        WidgetItem.listeners['Carousel2:LOADED'] = $rootScope.$on("Carousel2:LOADED", function () {
          WidgetItem.view = null;
          if (!WidgetItem.view) {
            WidgetItem.view = new buildfire.components.carousel.view("#carousel2", [], "WideScreen");
          }
          if (WidgetItem.reward && WidgetItem.reward.carouselImage) {
            WidgetItem.view.loadItems(WidgetItem.reward.carouselImage, null, "WideScreen");
          } else {
            WidgetItem.view.loadItems([]);
          }
        });

        WidgetItem.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
          if (!view || view.template === "Item_Details") {
            $scope.$destroy();
          }
        });

        $scope.$on("$destroy", function () {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>destroyed");
          if(WidgetItem.view) {
            WidgetItem.view._destroySlider();
            WidgetItem.view._removeAll();
          }
          for (var i in WidgetItem.listeners) {
            if (WidgetItem.listeners.hasOwnProperty(i)) {
              WidgetItem.listeners[i]();
            }
          }
        });

      }])
})(window.angular, window);
