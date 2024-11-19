'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetCodeCtrl', ['$scope','Utils', 'ViewStack', 'LoyaltyAPI', 'RewardCache', '$rootScope', 'Buildfire', 'Context', 'Transactions', '$timeout',
       function ($scope, Utils, ViewStack, LoyaltyAPI, RewardCache, $rootScope, Buildfire, Context, Transactions, $timeout) {

        var WidgetCode = this;
        var breadCrumbFlag = true;
        WidgetCode.listeners = {};
        WidgetCode.enterCodeText = '';
        /**
         * Initialize variable with current view returned by ViewStack service. In this case it is "Item_Details" view.
         */
        var currentView = ViewStack.getCurrentView();

        buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
          if (result && result.length) {
            result.forEach(function (breadCrumb) {
              if (breadCrumb.label == 'Confirm') {
                breadCrumbFlag = false;
              }
            });
          }
          if (breadCrumbFlag) {
            buildfire.history.push('Confirm', {elementToShow: 'Confirm'});
          }
        });

        //Refresh item details on pulling the tile bar

        buildfire.datastore.onRefresh(function () {
        });


        WidgetCode.context = Context.getContext();
        if (RewardCache.getApplication()) {
          WidgetCode.application = RewardCache.getApplication();
        }

        WidgetCode.addPoints = function () {
          var success = function (result) {
            Buildfire.spinner.hide();
            var pointsAwarded
            var purchaseOptionValue =  WidgetCode.application.settings.value;
            if(purchaseOptionValue === 'perMoneySpent'){
              $rootScope.$broadcast('POINTS_ADDED', {points: (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit});
              pointsAwarded = (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit;
            }
            else {
              $rootScope.$broadcast('POINTS_ADDED', {points: currentView.amount + WidgetCode.application.pointsPerVisit});
              pointsAwarded = currentView.amount + WidgetCode.application.pointsPerVisit;
            }
            ViewStack.push({
              template: 'Awarded',
              pointsAwarded: pointsAwarded
            });
            if (currentView.type === 'buyPoints') {
              Transactions.buyPoints(currentView.amount, pointsAwarded, $rootScope.loyaltyPoints, WidgetCode.currentLoggedInUser, currentView.title, currentView.iconUrl);
            } else if (currentView.type === 'buyProducts') {
              Transactions.buyProducts(currentView.items, $rootScope.loyaltyPoints, WidgetCode.currentLoggedInUser);
            } else
              return;
          }

          var error = function (error) {
            Buildfire.spinner.hide();
            console.log("Error while adding points:", error);
            if (error.code == 2103) {
              Utils.getLanguage('redeem.redeemDailyLimit').then(message => {
                buildfire.dialog.toast({
                  message: message,
                  type: "danger",
                });
              });
            }

          };
          Buildfire.spinner.show();
          var purchaseOptionValue =  WidgetCode.application.settings.value;
          checkIfUserDailyLimitExceeded(currentView, WidgetCode, purchaseOptionValue, function (err, res) {
            if (err) return error(err);
            buildfire.auth.getCurrentUser(function (err, user) {
              if (user) {
                WidgetCode.currentLoggedInUser = user;
                if (currentView.type == "redeemPoints") {

                  var redeemSuccess = function () {
                    Buildfire.spinner.hide();
                    $rootScope.$broadcast('POINTS_REDEEMED', currentView.pointsToRedeem);
                    ViewStack.push({
                      template: 'Success'
                    });
                    Transactions.redeemReward(currentView.reward, currentView.pointsToRedeem, $rootScope.loyaltyPoints, WidgetCode.currentLoggedInUser);
                  };

                  var redeemFailure = function (error) {
                    Buildfire.spinner.hide();
                    if (error && error.code == 2103) {
                      Utils.getLanguage('redeem.redeemDailyLimit').then(message => {
                        buildfire.dialog.toast({
                          message: message,
                          type: "danger",
                        });
                      });

                    } else {
                      WidgetCode.redeemFail = true;
                      $timeout(function () {
                        WidgetCode.redeemFail = false;
                      }, 3000);
                    }
                  };
                  if (WidgetCode.currentLoggedInUser) {
                    console.log(currentView.reward)
                    if (WidgetCode.application.dailyLimit > currentView.pointsToRedeem) {
                      Buildfire.spinner.show();
                      LoyaltyAPI.redeemPoints(WidgetCode.currentLoggedInUser._id, WidgetCode.currentLoggedInUser.userToken, `${WidgetCode.context.appId}_${WidgetCode.context.instanceId}`, currentView.reward._id).then(redeemSuccess, redeemFailure);
                    } else {
                      Utils.getLanguage('redeem.redeemDailyLimit').then(message => {
                        buildfire.dialog.toast({
                          message: message,
                          type: "danger",
                        });
                      });
                    }
                  } else {
                    buildfire.auth.login({}, function () {

                    });
                  }

                } else {
                  LoyaltyAPI.addLoyaltyPoints(WidgetCode.currentLoggedInUser._id, WidgetCode.currentLoggedInUser.userToken, `${WidgetCode.context.appId}_${WidgetCode.context.instanceId}`, WidgetCode.passcode, currentView.amount, res.data.pointsAwarded
                  ).then(success, error);
                }
              }
            })
          });
        }


        WidgetCode.confirmPasscode = function () {
          var success = function (result) {
            Buildfire.spinner.hide();
            console.log("Passcode valid");
            WidgetCode.addPoints();
          };

          var error = function (error) {
            Buildfire.spinner.hide();
            console.log("Error while adding points:", error);
            if (error.code == 2101) { // Invalid Passcode
              Utils.getLanguage('staffApproval.invalidCode').then(message => {
                buildfire.dialog.toast({
                  message: message,
                  type: "danger",
                });
              });
            }
            if (error.code == 2103) {
              Utils.getLanguage('redeem.redeemDailyLimit').then(message => {
                buildfire.dialog.toast({
                  message: message,
                  type: "danger",
                });
              });
            }

          };


          LoyaltyAPI.validatePasscode(WidgetCode.currentLoggedInUser.userToken, `${WidgetCode.context.appId}_${WidgetCode.context.instanceId}`, WidgetCode.passcode).then(success, error);
        };

        WidgetCode.preventClickBehavior = function (event) {
          console.log("#############", event);
          event.preventDefault();
        };

        WidgetCode.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
          if (ViewStack.getCurrentView().template == 'Confirm') {
            buildfire.datastore.onRefresh(function () {
            });
          }
        });

        /**
         * Check for current logged in user
         */
        buildfire.auth.getCurrentUser(async function (err, user) {
          console.log("_______________________", user);
          if (user) {
            WidgetCode.enterCodeText = await Utils.getLanguage('staffApproval.enterCode')
            WidgetCode.currentLoggedInUser = user;
            if (!$scope.$$phase) $scope.$digest();
          }
        });
      }])
})(window.angular, window.buildfire);
