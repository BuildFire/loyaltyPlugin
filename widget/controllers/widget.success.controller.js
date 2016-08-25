'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetSuccessCtrl', ['$scope', 'ViewStack', 'RewardCache', '$sce','$rootScope',
      function ($scope, ViewStack, RewardCache, $sce, $rootScope) {

        var WidgetSuccess = this;
        var breadCrumbFlag = true;

        if (RewardCache.getReward()) {
          WidgetSuccess.reward = RewardCache.getReward();
        }

        WidgetSuccess.listeners =  {};

          buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
              if(result && result.length) {
                  result.forEach(function(breadCrumb) {
                      if(breadCrumb.label == 'Success') {
                          breadCrumbFlag = false;
                      }
                  });
              }
              if(breadCrumbFlag) {
                  buildfire.history.push('Success', { elementToShow: 'Success' });
              }
          });

        /**
         * Method to return to home page
         */
        WidgetSuccess.goToHome = function () {
          buildfire.messaging.sendMessageToControl({
            type: 'BackToHome'
          });
//          ViewStack.popAllViews();
          buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
              if (result && result.length) {
                  result.forEach(function (breadCrumb) {
                      if (breadCrumb.options && breadCrumb.options.elementToShow) {
                          buildfire.history.pop();
                      }
                  });
              }
          });
        };

        /**
         * Method to parse and show reward's description in html format
         */
        WidgetSuccess.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetSuccess.listeners['REWARD_UPDATED']= $rootScope.$on('REWARD_UPDATED', function (e, item, index) {
          if (item.carouselImage){
            WidgetSuccess.reward.carouselImage = item.carouselImage || [];
            if (WidgetSuccess.view) {
              WidgetSuccess.view.loadItems(WidgetSuccess.reward.carouselImage, null, "WideScreen");
            }
          }

          if (item && item.title) {
            WidgetSuccess.reward.title = item.title;
          }
          if (item && item.description) {
            WidgetSuccess.reward.description = item.description;
          }
          if (item && item.pointsToRedeem) {
            WidgetSuccess.reward.pointsToRedeem = item.pointsToRedeem;
          }
        });
        WidgetSuccess.listeners['Carousel4:LOADED']= $rootScope.$on("Carousel4:LOADED", function () {
          WidgetSuccess.view=null;
          if (!WidgetSuccess.view) {
            WidgetSuccess.view = new buildfire.components.carousel.view("#carousel4", [], "WideScreen");
          }
          if (WidgetSuccess.reward && WidgetSuccess.reward.carouselImage) {
            WidgetSuccess.view.loadItems(WidgetSuccess.reward.carouselImage, null, "WideScreen");
          } else {
            WidgetSuccess.view.loadItems([]);
          }
        });
        WidgetSuccess.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
          if (!view || view.template === "Success") {
            $scope.$destroy();
          }
        });

        $scope.$on("$destroy", function () {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>destroyed");
          if(WidgetSuccess.view) {
            WidgetSuccess.view._destroySlider();
            WidgetSuccess.view._removeAll();
          }
          for (var i in WidgetSuccess.listeners) {
            if (WidgetSuccess.listeners.hasOwnProperty(i)) {
              WidgetSuccess.listeners[i]();
            }
          }
        });
      }])
})(window.angular, window.buildfire);
