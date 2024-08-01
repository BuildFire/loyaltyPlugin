'use strict';

(function (angular, window) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetItemCtrl', ['$scope', 'Utils', 'ViewStack', 'LoyaltyAPI', 'RewardCache', 'Context', '$sce', '$rootScope', '$timeout', 'Transactions',
      function ($scope, Utils, ViewStack, LoyaltyAPI, RewardCache, Context, $sce, $rootScope, $timeout, Transactions) {

        var WidgetItem = this;
        var breadCrumbFlag = true;


        WidgetItem.listeners = {};
        WidgetItem.currentLoggedInUser = null;
        WidgetItem.isReward = false;
        //create new instance of buildfire carousel viewer
        WidgetItem.view = null;

        buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
          if (result && result.length) {
            result.forEach(function (breadCrumb) {
              if (breadCrumb.label == 'Item') {
                breadCrumbFlag = false;
              }
            });
          }
          if (breadCrumbFlag) {
            buildfire.history.push('Item', {
              elementToShow: 'Item'
            });
          }
        });

        //Refresh item details on pulling the tile bar

        buildfire.datastore.onRefresh(function () { });

        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        if (currentView.item && currentView.isReward) {
          WidgetItem.reward = currentView.item;
          WidgetItem.isReward = true;
        }
        /**
         * Initialize WidgetItem.reward with reward details set in home controller
         */
        if (RewardCache.getReward() && !WidgetItem.isReward) {
          WidgetItem.reward = RewardCache.getReward();
        }


        if (RewardCache.getApplication()) {
          WidgetItem.application = RewardCache.getApplication();
        }

        /**
         * Check if user's total loyalty points are enough to redeem the reward, if yes redirect to next page.
         */
        WidgetItem.confirmCancel = async function () {
          if (!WidgetItem.currentLoggedInUser) {
            buildfire.auth.login({}, () => { });
            return;
          }

          const title =await Utils.getLanguage('redeem.titleNote');
          const message =await Utils.getLanguage('redeem.importantNote');
          const confirmButtonText =await Utils.getLanguage('redeem.confirmActionNote');
          const cancelButtonText =await Utils.getLanguage('redeem.cancelActionNote');

          buildfire.dialog.confirm(
            {
              title: title,
              message: message,
              confirmButton: {
                text: confirmButtonText,
                type: "primary",
              },
              cancelButtonText: cancelButtonText,
            },
            (err, isConfirmed) => {
              if (err) return;
              if (isConfirmed) {
                if (currentView.totalPoints) {
                  if (WidgetItem.reward.pointsToRedeem <= currentView.totalPoints) {
                    WidgetItem.redeemPoints()
                    return;
                  } else {

                    Utils.getLanguage('redeem.insufficientFunds').then(message=>{
                      buildfire.dialog.toast({
                        message: message,
                        type: "danger",
                      });
                    });
                  }
                } else {
                  WidgetItem.getLoyaltyPoints();
                }
              }
            }
          );
        };


        WidgetItem.redeemPoints = function () {
          if (WidgetItem.currentLoggedInUser) {
            if (WidgetItem.application.dailyLimit > WidgetItem.reward.pointsToRedeem) {
              buildfire.spinner.show();
              buildfire.auth.getCurrentUser(async function (err, user) {
                if (user) {
                  if (currentView.settings && currentView.settings.approvalType
                    && currentView.settings.approvalType == "REMOVE_VIA_APP") {
                    Transactions.requestRedeem(WidgetItem.reward, WidgetItem.reward.pointsToRedeem, $rootScope.loyaltyPoints, user);
                    buildfire.notifications.pushNotification.schedule(
                      {
                        title: "Item Redeem Approval Request",
                        text: user.displayName + " would like to redeem " + WidgetItem.reward.title,
                        groupName: "employerGroup",
                        queryString: "toEmployer=true"
                        , at: new Date()
                      },
                      (err, result) => {
                        if (err) return console.error(err);
                      })
                    buildfire.spinner.hide();

                    const title =await Utils.getLanguage('redeem.itemRedeemedTitle');
                    const message =await Utils.getLanguage('redeem.itemRedeemedBody');
                    const confirmButtonText =await Utils.getLanguage('redeem.closeitemRedeemedAction');

                    buildfire.dialog.show(
                      {
                        title: title,
                        message: message,
                        showCancelButton: false,
                        actionButtons: [
                          {
                            text: confirmButtonText,
                            type: "primary",
                            action: () => {
                              console.log(" ")
                              ViewStack.push({
                                template: 'Rewards'
                              });
                              if (!$scope.$$phase) $scope.$apply()
                            },
                          }
                        ],
                      },
                      (err, actionButton) => {
                        console.log(" ")

                      }
                    );
                  }
                  else {
                    ViewStack.push({
                      template: 'Code',
                      reward: WidgetItem.reward,
                      type: 'redeemPoints',
                      pointsToRedeem: WidgetItem.reward.pointsToRedeem
                    });
                    if (!$scope.$$phase) $scope.$apply()
                  }
                } else {
                  buildfire.spinner.hide();
                }
              })
            }
            else {
              buildfire.spinner.hide();
              Utils.getLanguage('redeem.redeemDailyLimit').then(message=>{
                buildfire.dialog.toast({
                  message: message,
                  type: "danger",
                });
              });

            }
          }
          else {
            buildfire.auth.login({}, function () {

            });
          }
        };
        buildfire.auth.getCurrentUser(function (err, user) {
          if (user) {
            WidgetItem.currentLoggedInUser = user;
          }
        });

        WidgetItem.getLoyaltyPoints = function () {
          buildfire.auth.getCurrentUser(function (err, user) {
            if (user) {
              Context.getContext(function (ctx) {
                WidgetItem.currentLoggedInUser = user;
                var success = function (result) {
                  if (WidgetItem.reward.pointsToRedeem <= result.totalPoints) {
                    WidgetItem.redeemPoints()
                  } else {
                    Utils.getLanguage('redeem.insufficientFunds').then(message=>{
                      buildfire.dialog.toast({
                        message: message,
                        type: "danger",
                      });
                    });
                  }
                },
                  error = function (err) {
                    if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                      console.error('Error while getting points data----------------------------------------', err);
                    }
                    Utils.getLanguage('redeem.insufficientFunds').then(message=>{
                      buildfire.dialog.toast({
                        message: message,
                        type: "danger",
                      });
                    });

                  };
                if (user._id)
                  LoyaltyAPI.getLoyaltyPoints(user._id, WidgetItem.currentLoggedInUser.userToken, `${ctx.appId}_${ctx.instanceId}`).then(success, error);

              });
            } else {
              Utils.getLanguage('redeem.insufficientFunds').then(message=>{
                buildfire.dialog.toast({
                  message: message,
                  type: "danger",
                });
              });

            }
          });
        };

        /**
         * Method to parse and show reward's description in html format
         */
        WidgetItem.safeHtml = function (html) {
          if (html)
            return $sce.trustAsHtml(html);
        };

        WidgetItem.listeners['REWARD_UPDATED'] = $rootScope.$on('REWARD_UPDATED', function (e, item, index) {

          if (item.carouselImage) {
            WidgetItem.reward.carouselImage = item.carouselImage || [];
            if (WidgetItem.view) {
              WidgetItem.view.loadItems(WidgetItem.reward.carouselImage, null, "WideScreen");
            }
          }

          if (item && item.listImage) {
            WidgetItem.reward.listImage = item.listImage;
          } else {
            WidgetItem.reward.listImage = null;

          }

          if (item && item.title) {
            WidgetItem.reward.title = item.title;
          }
          if (item && item.description) {
            WidgetItem.reward.description = item.description;
          }
          if (item && (item.pointsToRedeem || item.pointsToRedeem === 0)) {
            WidgetItem.reward.pointsToRedeem = item.pointsToRedeem;
          }
        });


        WidgetItem.listeners['SETTINGS_UPDATED'] = $rootScope.$on('SETTINGS_UPDATED', function (e, item) {
          WidgetItem.application.dailyLimit = item.data.settings.dailyLimit;
          WidgetItem.application.pointsPerDollar = item.data.settings.pointsPerDollar;
          WidgetItem.application.pointsPerVisit = item.data.settings.pointsPerVisit;
          WidgetItem.application.redemptionPasscode = item.data.settings.redemptionPasscode;
          WidgetItem.application.totalLimit = item.data.settings.totalLimit;
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

        WidgetItem.listeners['GOTO_HOME'] = $rootScope.$on('GOTO_HOME', function (e) {
          ViewStack.popAllViews();
        });

        WidgetItem.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
          if (!view || view.template === "Item_Details") {
            $scope.$destroy();
          }
        });

        WidgetItem.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
          if (ViewStack.getCurrentView().template == 'Item' || ViewStack.getCurrentView().template == 'Item_Details') {
            $scope.$destroy();
            buildfire.datastore.onRefresh(function () { });
          }
        });

        $scope.$on("$destroy", function () {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>destroyed");
          if (WidgetItem.view) {
            WidgetItem.view._destroySlider();
            WidgetItem.view._removeAll();
          }
          for (var i in WidgetItem.listeners) {
            if (WidgetItem.listeners.hasOwnProperty(i)) {
              WidgetItem.listeners[i]();
            }
          }
        });

      }
    ])
})(window.angular, window);
