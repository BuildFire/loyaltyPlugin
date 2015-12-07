'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'RewardCache', '$rootScope',
      function ($scope, ViewStack, LoyaltyAPI, STATUS_CODE, TAG_NAMES, LAYOUTS, DataStore, RewardCache, $rootScope) {

        var WidgetHome = this;

        $rootScope.deviceHeight = window.innerHeight;
        $rootScope.deviceWidth = window.innerWidth;
        $rootScope.itemListbackgroundImage = "";
        $rootScope.itemDetailsBackgroundImage = "";


        /**
         * Initialize current logged in user as null. This field is re-initialized if user is already logged in or user login user auth api.
         */
        WidgetHome.currentLoggedInUser = null;

        /**
         * Method to open a reward details page.
         */
        WidgetHome.openReward = function (reward) {
          RewardCache.setReward(reward);
          ViewStack.push({
            template: 'Item_Details',
            totalPoints: WidgetHome.loyaltyPoints
          });
        };

        /**
         * Method to fetch logged in user's loyalty points
         */
        WidgetHome.getLoyaltyPoints = function (userId) {
          var success = function (result) {
              console.info('Points>>>>>>>>>>>>>>>.', result);
              WidgetHome.loyaltyPoints = result.totalPoints;
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting points data', err);
              }
            };
          var successLoyaltyRewards = function (result) {
              WidgetHome.loyaltyRewards = result;
              if (!WidgetHome.loyaltyRewards)
                WidgetHome.loyaltyRewards = [];
              console.info('Rewards>>>>>>>>>>>>>>.:', result);
            }
            , errorLoyaltyRewards = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data loyaltyRewards', err);
              }
            };


          var successApplication = function (result) {
            RewardCache.setApplication(result);
          };

          var errorApplication = function (error) {
            console.info('Error fetching loyalty application');
          };
          LoyaltyAPI.getApplication('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(successApplication, errorApplication);
          LoyaltyAPI.getRewards('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(successLoyaltyRewards, errorLoyaltyRewards);
          LoyaltyAPI.getLoyaltyPoints(userId, 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=', 'e22494ec-73ea-44ac-b82b-75f64b8bc535').then(success, error);
        };

        /**
         * Method to show amount page where user can fill in the amount they have made purchase of.
         */
        WidgetHome.openGetPoints = function () {
          console.log(">>>>>>>>>>>>>>");
          ViewStack.push({
            template: 'Amount'
          });
        };

        /**
         * Method to open buildfire auth login pop up and allow user to login using credentials.
         */
        WidgetHome.openLogin = function () {
          console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPP");
          buildfire.auth.login({}, function () {

          });
        };

        /*
         * Fetch user's data from datastore
         */

        var init = function () {
          var success = function (result) {
              WidgetHome.data = result.data;
              if (!WidgetHome.data.design)
                WidgetHome.data.design = {};
              if (!WidgetHome.data.settings)
                WidgetHome.data.settings = {};
              if (!WidgetHome.data.design.listLayout) {
                WidgetHome.data.design.listLayout = LAYOUTS.listLayout[0].name;
              }
              if (!WidgetHome.data.design.itemListbackgroundImage) {
                  $rootScope.itemListbackgroundImage = "";
                } else {
                  $rootScope.itemListbackgroundImage = WidgetHome.data.design.itemListbackgroundImage;
                }
                if (!WidgetHome.data.design.itemDetailsBackgroundImage) {
                  $rootScope.itemDetailsBackgroundImage = "";
                } else {
                  $rootScope.itemDetailsBackgroundImage = WidgetHome.data.design.itemDetailsBackgroundImage;
                }
            }
            , error = function (err) {
              console.error('Error while getting data', err);
            };
          DataStore.get(TAG_NAMES.LOYALTY_INFO).then(success, error);
        };

        var loginCallback = function () {
          buildfire.auth.getCurrentUser(function (user) {
            console.log("_______________________", user);
            if (user) {
              WidgetHome.currentLoggedInUser = user;
              $scope.$digest();
            }
          });
        };

        var onUpdateCallback = function (event) {
          console.log("++++++++++++++++++++++++++", event);
          setTimeout(function () {
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.LOYALTY_INFO:
                  WidgetHome.data = event.data;
                  if (!WidgetHome.data.design)
                    WidgetHome.data.design = {};
                  if (!WidgetHome.data.design.listLayout) {
                    WidgetHome.data.design.listLayout = LAYOUTS.listLayout[0].name;
                  }
                  if (!WidgetHome.data.design.itemListbackgroundImage) {
                    $rootScope.itemListbackgroundImage = "";
                  } else {
                    $rootScope.itemListbackgroundImage = WidgetHome.data.design.itemListbackgroundImage;
                  }
                  if (!WidgetHome.data.design.itemDetailsBackgroundImage) {
                    $rootScope.itemDetailsBackgroundImage = "";
                  } else {
                    $rootScope.itemDetailsBackgroundImage = WidgetHome.data.design.itemDetailsBackgroundImage;
                  }
                  break;
              }
              $scope.$digest();
              $rootScope.$digest();
            }
          }, 0);
        };

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, onUpdateCallback);

        /**
         * onLogin() listens when user logins using buildfire.auth api.
         */
        buildfire.auth.onLogin(loginCallback);

        /**
         * This event listener is bound for "POINTS_REDEEMED" event broadcast
         */
        $rootScope.$on('POINTS_REDEEMED', function (e, points) {
          if (points)
            WidgetHome.loyaltyPoints = WidgetHome.loyaltyPoints - points;
        });

        /**
         * Check for current logged in user, if yes fetch its loyalty points
         */
        WidgetHome.currentLoggedInUser = {};
        WidgetHome.getLoyaltyPoints("5317c378a6611c6009000001");

        /*buildfire.auth.getCurrentUser(function (user) {

          console.log("_______________________", user);
          //if (user) {
          //  WidgetHome.currentLoggedInUser = user;
          //  WidgetHome.getLoyaltyPoints(user._id);
          //  $scope.$digest();
          //}
        });*/

        init();

      }]);
})(window.angular, window.buildfire);

