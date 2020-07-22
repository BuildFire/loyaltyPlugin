'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'RewardCache', '$rootScope', '$sce', 'Context', '$window',
      function ($scope, ViewStack, LoyaltyAPI, STATUS_CODE, TAG_NAMES, LAYOUTS, DataStore, RewardCache, $rootScope, $sce, Context, $window) {
        var WidgetHome = this;

        WidgetHome.strings = {
          "general.loginOrRegister": "Login or register",
          "general.toGetPoints": "to get points",
          "general.currentlyHave": "You currently have",
          "general.points": "Points",
          "general.getMore": "Get More Points",
          "general.redeem": "Redeem",
          "general.done": "Done",
          "general.confirm": "Confirm",
          "general.cancel": "Cancel",
          "redeem.insufficientFunds": 'You have insufficient points.Please get points to redeem awards.',
          "redeem.importantNote": "Important: By clicking confirm, you are confirming that the reward has been received and the corresponding points will, therefore, be deducted from the user's account.",
          "redeem.errorRedeem": 'Error redeeming reward. Please try again later.',
          "redeem.redeemDailyLimit": "You have exceeded the daily limit.",
          "redeem.handDevice": "Please hand your device to a staff member for confirmation",
          "redeem.invalidCode": "Invalid confirmation code.",
          "redeem.enterCode": "Enter Code",
          "buyItems.productName": "Product Name",
          "buyItems.pointsPerProduct": "Points Per Product",
          "buyItems.quantity": "Quantity",
          "awarded.awesome": "Awesome",
          "awarded.justEarned": "You just earned yourself",
          "awarded.checkList": "Check out our list of rewards to redeem.",
          "amount.enterAmount": "Enter the Purchase Amount",
        }
        
        $window.strings.getLanguage(function(err, response){
          const obj = response[0] ? response[0].data : $window.strings._data;
          const strings = {};
           Object.keys(obj).forEach(function (section){
             Object.keys(obj[section]).forEach(function (label) {
               strings[section + '.' + label] = obj[section][label].value || obj[section][label].defaultValue;
             });
           });
           WidgetHome.strings = strings;
           $rootScope.strings = strings;
        });

        $rootScope.deviceHeight = window.innerHeight;
        $rootScope.deviceWidth = window.innerWidth || 320;
        $rootScope.itemListbackgroundImage = "";
        $rootScope.itemDetailsBackgroundImage = "";

        $scope.setWidth = function () {
            $rootScope.deviceWidth = window.innerWidth > 0 ? window.innerWidth : '320';
        };

          //Refresh list of items on pulling the tile bar

          buildfire.datastore.onRefresh(function () {
              init();
          });

        //create new instance of buildfire carousel viewer
        WidgetHome.view = null;

        WidgetHome.listeners = {};
        $rootScope.deviceratio = window.devicePixelRatio;
        WidgetHome.PlaceHolderImageWidth = 60*window.devicePixelRatio + 'px';
        WidgetHome.PlaceHolderImageHeight = 60*window.devicePixelRatio + 'px';
        WidgetHome.PlaceHolderImageWidth3 = 110*window.devicePixelRatio + 'px';
        WidgetHome.PlaceHolderImageHeight3 = 60*window.devicePixelRatio + 'px';
        /**
         * Initialize current logged in user as null. This field is re-initialized if user is already logged in or user login user auth api.
         */
        WidgetHome.currentLoggedInUser = null;

        /**
         * Method to open a reward details page.
         */
        WidgetHome.openReward = function (reward, index) {
          RewardCache.setReward(reward);
          ViewStack.push({
            template: 'Item_Details',
            totalPoints: $rootScope.loyaltyPoints
          });
          buildfire.messaging.sendMessageToControl({
            type: 'OpenItem',
            data: reward,
            index: index
          });
        };

        /**
         * Method to fetch logged in user's loyalty points
         */
        WidgetHome.getLoyaltyPoints = function (userId) {
          var success = function (result) {
              $rootScope.loyaltyPoints = result.totalPoints;
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting points data----------------------------------------', err);
              }
            };
            if (userId)
                LoyaltyAPI.getLoyaltyPoints(userId, WidgetHome.currentLoggedInUser.userToken, WidgetHome.context.instanceId).then(success, error);
        };

        /**
         * Method to fetch loyalty application and list of rewards
         */
        WidgetHome.getApplicationAndRewards = function () {
          var successLoyaltyRewards = function (result) {
              WidgetHome.loyaltyRewards = result;
              if (!WidgetHome.loyaltyRewards)
                WidgetHome.loyaltyRewards = [];
            }
            , errorLoyaltyRewards = function (err) {
                if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data loyaltyRewards--------------------------------------', err);
              }
            };
          var successApplication = function (result) {
            if (result.image)
              WidgetHome.carouselImages = result.image;
              else
            WidgetHome.carouselImages = [];
            if (result.content && result.content.description)
              WidgetHome.description = result.content.description;
            RewardCache.setApplication(result);
          };

          var errorApplication = function (error) {
            WidgetHome.carouselImages = [];
            console.error('Error fetching loyalty application---------------------------------------------------',error);
          };
          WidgetHome.getLoyaltyPoints();
          if(WidgetHome.context && WidgetHome.context.instanceId){
            getLoggedInUser();
            LoyaltyAPI.getApplication(WidgetHome.context.instanceId).then(successApplication, errorApplication);
            LoyaltyAPI.getRewards(WidgetHome.context.instanceId).then(successLoyaltyRewards, errorLoyaltyRewards);
          }
          else{
            Context.getContext(function (ctx) {
              console.log('COntext got successfully-----------------' +
                  '');
              WidgetHome.context = ctx;
              LoyaltyAPI.getApplication(WidgetHome.context.instanceId).then(successApplication, errorApplication);
              LoyaltyAPI.getRewards(WidgetHome.context.instanceId).then(successLoyaltyRewards, errorLoyaltyRewards);
            });
          }
        };

        /**
         * Method to show amount page where user can fill in the amount they have made purchase of.
         */
        WidgetHome.openGetPoints = function () {
          if (WidgetHome.currentLoggedInUser) {
            const settings = WidgetHome.data.settings;
            if(settings.purchaseOption && settings.purchaseOption.value === 'perProductsPurchased') {
              ViewStack.push({
                template: 'BuyItems',
                loyaltyPoints: $rootScope.loyaltyPoints,
                loyaltyRewards: WidgetHome.loyaltyRewards
              });
            }
            else {
                ViewStack.push({
                  template: 'Amount',
                  loyaltyPoints: $rootScope.loyaltyPoints
                });
            }
          }
          else {
            WidgetHome.openLogin();
          }
        };

        /**
         * Method to open buildfire auth login pop up and allow user to login using credentials.
         */
        WidgetHome.openLogin = function () {
          buildfire.auth.login({}, function () {

          });
        };

        /**
         * This event listener is bound for "POINTS_REDEEMED" event broadcast
         */
        WidgetHome.listeners['POINTS_REDEEMED'] = $rootScope.$on('POINTS_REDEEMED', function (e, points) {
          if (points)
            $rootScope.loyaltyPoints = $rootScope.loyaltyPoints - points;
        });

        /**
         * This event listener is bound for "POINTS_ADDED" event broadcast
         */
        WidgetHome.listeners['POINTS_ADDED'] = $rootScope.$on('POINTS_ADDED', function (e, points) {
          if (points)
            $rootScope.loyaltyPoints = $rootScope.loyaltyPoints + points;
        });

        /**
         * This event listener is bound for "REWARD_DELETED" event broadcast
         */
        WidgetHome.listeners['REWARD_DELETED'] = $rootScope.$on('REWARD_DELETED', function (e, index) {
          if (index != -1)
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

        /**
         * This event listener is bound for "REWARD_ADDED" event broadcast
         */
        WidgetHome.listeners['REWARD_ADDED'] = $rootScope.$on('REWARD_ADDED', function (e, item) {
            var successLoyaltyRewards = function (result) {
                    WidgetHome.loyaltyRewards = result;
                    if (!WidgetHome.loyaltyRewards)
                        WidgetHome.loyaltyRewards = [];
                }
                , errorLoyaltyRewards = function (err) {
                    if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                        console.error('Error while getting data loyaltyRewards--------------------------------------', err);
                    }
                };
            LoyaltyAPI.getRewards(WidgetHome.context.instanceId).then(successLoyaltyRewards, errorLoyaltyRewards);
        });

        /**
         * This event listener is bound for "GOTO_HOME" event broadcast
         */
        WidgetHome.listeners['GOTO_HOME'] = $rootScope.$on('GOTO_HOME', function (e) {
          WidgetHome.getApplicationAndRewards();
        });

        /**
         * This event listener is bound for "APPLICATION_UPDATED" event broadcast
         */
        WidgetHome.listeners['APPLICATION_UPDATED'] = $rootScope.$on('APPLICATION_UPDATED', function (e, app) {
          if (app.image) {
            WidgetHome.carouselImages = app.image;
            if (WidgetHome.view) {
              WidgetHome.view.loadItems(WidgetHome.carouselImages);
            }
          }
          if (app.content && (app.content.description || app.content.description == ''))
            WidgetHome.description = app.content.description;
          RewardCache.setApplication(app);
        });

        /**
         * This event listener is bound for "REFRESH_APP" event broadcast
         */
        WidgetHome.listeners['REFRESH_APP'] = $rootScope.$on('REFRESH_APP', function (e) {
          WidgetHome.getApplicationAndRewards();
        });

        WidgetHome.showDescription = function (description) {
          return !((description == '<p>&nbsp;<br></p>') || (description == '<p><br data-mce-bogus="1"></p>'));
        };

        /**
         * Method to parse and show description in html format
         */
        WidgetHome.safeHtml = function (html) {
            if (html) {
                var $html = $('<div />', {html: html});
                $html.find('iframe').each(function (index, element) {
                    var src = element.src;
                    console.log('element is: ', src, src.indexOf('http'));
                    src = src && src.indexOf('file://') != -1 ? src.replace('file://', 'http://') : src;
                    element.src = src && src.indexOf('http') != -1 ? src : 'http:' + src;
                });
                return $sce.trustAsHtml($html.html());
            }
        };

        /*
         * Fetch user's data from datastore
         */

        var init = function () {
          var success = function (result) {
                if(result && result.data){
                  console.log('BUILDFIRE GET--------------------------LOYALTY---------RESULT',result);
                  WidgetHome.data = result.data;
                }
                else{
                  WidgetHome.data={
                    design:{
                      listLayout:LAYOUTS.listLayout[0].name
                    }
                  };
                }
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
                WidgetHome.data={design:{listLayout:LAYOUTS.listLayout[0].name}};
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

        var logoutCallback = function () {
          buildfire.auth.getCurrentUser(function (err, user) {
            console.log("_______________________", user);
           // if (user) {
              WidgetHome.currentLoggedInUser = null;
             // WidgetHome.getLoyaltyPoints(user._id);
              $scope.$digest();
           // }
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
        buildfire.auth.onLogout(logoutCallback);

        /**
         * Check for current logged in user, if yes fetch its loyalty points
         */
        var getLoggedInUser = function(){
          buildfire.auth.getCurrentUser(function (err, user) {
          console.log("_______________________", user);
          if (user) {
            WidgetHome.currentLoggedInUser = user;
            if (!WidgetHome.context) {
              Context.getContext(function (ctx) {
                console.log('Context     ==============================================================',ctx);
                WidgetHome.context = ctx;
                WidgetHome.getLoyaltyPoints(WidgetHome.currentLoggedInUser._id);
                $scope.$digest();
              });
            } else {
              WidgetHome.getLoyaltyPoints(WidgetHome.currentLoggedInUser._id);
              $scope.$digest();
            }
          }
        });
        };
        getLoggedInUser();
          WidgetHome.listeners['REWARD_UPDATED'] = $rootScope.$on('REWARD_UPDATED', function (e, item, index) {
              if (item && WidgetHome.loyaltyRewards && WidgetHome.loyaltyRewards.length) {
                  WidgetHome.loyaltyRewards.some(function (reward, index) {
                      if (reward._id == item._id) {
                          WidgetHome.loyaltyRewards[index] = item;
                          return true;
                      }
                  })
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

        Context.getContext(function (ctx) {
          console.log('COntext got successfully-----------------' +
              '');
          WidgetHome.context = ctx;
        });
        init();

          WidgetHome.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
              if (!ViewStack.hasViews()) {
                  // bind on refresh again
                  buildfire.datastore.onRefresh(function () {
                      init();
                  });
              }
          });
      }]);
})(window.angular, window.buildfire);

