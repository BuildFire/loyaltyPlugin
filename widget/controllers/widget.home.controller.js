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

        //create new instance of buildfire carousel viewer
        WidgetHome.view = null;

        WidgetHome.listeners = {};

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
          buildfire.messaging.sendMessageToControl({
            type: 'OpenItem',
            data: reward
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
          LoyaltyAPI.getLoyaltyPoints(userId, WidgetHome.currentLoggedInUser.userToken, '1449814143554-01452660677023232').then(success, error);
        };

        /**
         * Method to fetch loyalty application and list of rewards
         */
        WidgetHome.getApplicationAndRewards = function () {
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
            if (result.image)
              WidgetHome.carouselImages = result.image;
            RewardCache.setApplication(result);
          };

          var errorApplication = function (error) {
            console.info('Error fetching loyalty application');
          };

          console.log("$$$$$$$$$$$$$$$$$$$$$$$",buildfire.context);
          LoyaltyAPI.getApplication('1449814143554-01452660677023232').then(successApplication, errorApplication);
          LoyaltyAPI.getRewards('1449814143554-01452660677023232').then(successLoyaltyRewards, errorLoyaltyRewards);
        };

        /**
         * Method to show amount page where user can fill in the amount they have made purchase of.
         */
        WidgetHome.openGetPoints = function () {
          console.log(">>>>>>>>>>>>>>");
          if(WidgetHome.currentLoggedInUser){
            ViewStack.push({
              template: 'Amount',
              loyaltyPoints: WidgetHome.loyaltyPoints

            });
          }
          else
          alert("Please login to earn points!")


        };

        /**
         * Method to open buildfire auth login pop up and allow user to login using credentials.
         */
        WidgetHome.openLogin = function () {
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
          WidgetHome.getApplicationAndRewards();
        };

        var loginCallback = function () {
          buildfire.auth.getCurrentUser(function (err, user) {
            console.log("_______________________", user);
            if (user) {
              WidgetHome.currentLoggedInUser = user;
              WidgetHome.getLoyaltyPoints(user._id);
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
        WidgetHome.listeners['POINTS_REDEEMED'] = $rootScope.$on('POINTS_REDEEMED', function (e, points) {
          if (points)
            WidgetHome.loyaltyPoints = WidgetHome.loyaltyPoints - points;
        });

        /**
         * This event listener is bound for "POINTS_ADDED" event broadcast
         */
        WidgetHome.listeners['POINTS_ADDED'] = $rootScope.$on('POINTS_ADDED', function (e, points) {
          if (points)
            WidgetHome.loyaltyPoints = WidgetHome.loyaltyPoints + points;
        });

        /**
         * This event listener is bound for "REWARD_DELETED" event broadcast
         */
        WidgetHome.listeners['REWARD_DELETED'] = $rootScope.$on('REWARD_DELETED', function (e, index) {
          if (index)
            WidgetHome.loyaltyRewards.splice(index, 1);
        });

        /**
         * This event listener is bound for "REWARDS_SORTED" event broadcast
         */
        WidgetHome.listeners['REWARDS_SORTED'] = $rootScope.$on('REWARDS_SORTED', function (e) {
          WidgetHome.getApplicationAndRewards();
        });

        /**
         * This event listener is bound for "Carousel:LOADED" event broadcast
         */
        WidgetHome.listeners['Carousel:LOADED'] = $rootScope.$on("Carousel:LOADED", function () {
          WidgetHome.view = null;
          if (!WidgetHome.view) {
            WidgetHome.view = new buildfire.components.carousel.view("#carousel", [], "WideScreen");
          }
          if (WidgetHome.carouselImages) {
            WidgetHome.view.loadItems(WidgetHome.carouselImages, null, "WideScreen");
          } else {
            WidgetHome.view.loadItems([]);
          }
        });
        $rootScope.$on('REWARD_UPDATED', function (e, item) {
          console.log("----------------",item);

          WidgetHome.getApplicationAndRewards();
        });

        /**
         * Check for current logged in user, if yes fetch its loyalty points
         */
        buildfire.auth.getCurrentUser(function (err, user) {
          console.log("_______________________", user);
          if (user) {
            WidgetHome.currentLoggedInUser = user;
            WidgetHome.getLoyaltyPoints('5317c378a6611c6009000001');
            $scope.$digest();
          }
        });

        $scope.$on("$destroy", function () {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>destroyed");
          for (var i in WidgetHome.listeners) {
            if (WidgetHome.listeners.hasOwnProperty(i)) {
              WidgetHome.listeners[i]();
            }
          }
        });


        init();

      }]);
})(window.angular, window.buildfire);

