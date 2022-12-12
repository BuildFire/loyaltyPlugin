'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'RewardCache', '$rootScope', '$sce', 'Context', '$window', 'Transactions',
      function ($scope, ViewStack, LoyaltyAPI, STATUS_CODE, TAG_NAMES, LAYOUTS, DataStore, RewardCache, $rootScope, $sce, Context, $window, Transactions) {
        var WidgetHome = this;
        WidgetHome.deepLinkingDone = false;
        WidgetHome.isEmployer = false;
        WidgetHome.isClient = false;
        WidgetHome.approvalRequestsTab = 0
        WidgetHome.tags = null;
        
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
          "general.next": "Next",
          "redeem.titleNote": 'Redeem Item',
          "redeem.importantNote": "By clicking redeem, you are confirming that the reward has been received and the coresponding points will, therefore, be deducted from your account.",
          "redeem.cancelActionNote": 'CANCEL',
          "redeem.confirmActionNote": "REDEEM",
          "redeem.itemRedeemedTitle": "Item Redeemed",
          "redeem.itemRedeemedBody": "Rewards can take up to 24 hours to process. You can check the status of your reward by tapping on rewards icon in the upper right corner on the home screen.",
          "redeem.closeitemRedeemedAction": "Thanks",
          "redeem.errorRedeem": "Error redeeming reward. Please try again later.",
          "redeem.redeemDailyLimit": "You have exceeded the daily limit.",
          "redeem.insufficientFunds": "You have insufficient points. Please get points to redeem awards.",
          "buyItems.productName": "Product Name",
          "buyItems.pointsPerProduct": "Points Per Product",
          "buyItems.quantity": "Quantity",
          "buyItems.totalPoints": "Total Points",
          "awarded.awesome": "Awesome",
          "awarded.justEarned": "You just earned yourself",
          "awarded.checkList": "Check out our list of rewards to redeem.",
          "awarded.totalPoints": "Total Points",
          "amount.enterAmount": "Enter the Purchase Amount",
          "deeplink.deeplinkRewardNotFound":"Reward does not exist!",
          "staffApproval.approve":"Approve",
          "staffApproval.deny":"deny",
          "staffApproval.handDevice":"Please hand your device to a staff member for confirmation",
          "staffApproval.invalidCode":"Invalid confirmation code.",
          "staffApproval.enterCode":"Enter Code",

        }
        var features = []
        
        $window.strings.getLanguage(function(err, response){
          const obj = response[0] ? response[0].data : $window.strings._data;
          const strings = {};
           Object.keys(obj).forEach(function (section){
             Object.keys(obj[section]).forEach(function (label) {
               strings[section + '.' + label] = obj[section][label].value || obj[section][label].defaultValue;
             });
           });
           WidgetHome.strings = {...WidgetHome.strings, ...strings};
           $rootScope.strings = {...WidgetHome.strings, ...strings};
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

        WidgetHome.applicationExists = false;
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
            totalPoints: $rootScope.loyaltyPoints,
            settings: WidgetHome.data.settings
          });
          if(index!=-1){
            buildfire.messaging.sendMessageToControl({
              type: 'OpenItem',
              data: reward,
              index: index
            });
          }
        };

        WidgetHome.openApprovalRequests = function(){

          ViewStack.push({
            template: 'APPROVAL_REQUESTS'
          });
        }
        WidgetHome.openRewardsPage = function(){

          ViewStack.push({
            template: 'Rewards'
          });
        }
        /**
         * Method to fetch logged in user's loyalty points
         */
        var isLoyaltyPointsUpdated = false;

        const saveLoyaltyPointsInAppData = function(userId, totalPoints){
          buildfire.appData.search(
            {
              filter: {
                $or: [
                  { "$json.userId": userId },
                ],
              },
            },
            "userLoyaltyPoints",
            (err, res) => {
              if (err) return console.error("there was a problem retrieving your data");
              let data = {
                userId: userId, totalPoints: totalPoints
              }
              if(res && res.length > 0){
                if( (!WidgetHome.data.settings.deductLeaderboardPoints && res[0].data.totalPoints < totalPoints)
                  ||  WidgetHome.data.settings.deductLeaderboardPoints){
                  buildfire.appData.update(
                    res[0].id,
                    data,
                    "userLoyaltyPoints",
                    () => {}
                  );
                }
                
              } else {
                buildfire.appData.insert(
                  data,
                  "userLoyaltyPoints",
                  false,
                  () => {}
                );
              }
            }
          );
        }


        WidgetHome.getLoyaltyPoints = function (userId) {
          var success = function (result) {
              $rootScope.loyaltyPoints = result.totalPoints;
              WidgetHome.applicationExists = true;
              if(!isLoyaltyPointsUpdated){
                isLoyaltyPointsUpdated = true  
                saveLoyaltyPointsInAppData(userId, result.totalPoints)
              }
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
              buildfire.deeplink.getData(function(data){
                if(data && data.id && !WidgetHome.deepLinkingDone){
                    WidgetHome.deepLinkingDone = true;
                    var reward=WidgetHome.loyaltyRewards.find(el=>el._id==data.id);
                    if(reward)
                      WidgetHome.openReward(reward,-1);
                    else 
                      buildfire.dialog.toast({
                        message: WidgetHome.strings["deeplink.deeplinkRewardNotFound"]
                      });
                }
              });
            }
            , errorLoyaltyRewards = function (err) {
                if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data loyaltyRewards--------------------------------------', err);
              }
            };
            var successApplication = function (result) {
              Introduction.get()
                .then((res) => {
                    if (res) {
                      if(res.data.images){
                        WidgetHome.carouselImages = res.data.images;
                      } else {
                        WidgetHome.carouselImages = [];
                      }
                      WidgetHome.description = res.data.description;
                    } else {
                      WidgetHome.carouselImages = [];
                    }
                  RewardCache.setApplication(result);
                  WidgetHome.getLoyaltyPoints(WidgetHome.currentLoggedInUser._id);
                  })
                .catch((err) => {
                  RewardCache.setApplication(result);
                  WidgetHome.getLoyaltyPoints(WidgetHome.currentLoggedInUser._id);
                })
          };

          var errorApplication = function (error) {
            WidgetHome.carouselImages = [];
            console.error('Error fetching loyalty application---------------------------------------------------',error);
          };
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
            } else if(settings.purchaseOption && settings.purchaseOption.value === 'scoreFromFreeTextQuestionnaire') {
                if(features.length > 0){
                  if(features.length == 1){
                    buildfire.navigation.navigateTo({
                      instanceId: features[0].instanceId,
                    });
                  } else {
                    let items = [];
                    features.forEach(element => {
                      items.push({
                        text: element.title,
                        instanceId: element.instanceId,
                        iconUrl: element.iconUrl
                      })
                    });
                    buildfire.components.drawer.open(
                      {
                        listItems: items
                      },
                      (err, result) => {
                        if (err) return console.error(err);
                        buildfire.components.drawer.closeDrawer();
                        buildfire.navigation.navigateTo({
                          instanceId: result.instanceId,
                        });
                      }
                    );
                  }
                }
          
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
            saveLoyaltyPointsInAppData(WidgetHome.currentLoggedInUser._id, $rootScope.loyaltyPoints)

        });

        /**
         * This event listener is bound for "POINTS_ADDED" event broadcast
         */
        WidgetHome.listeners['POINTS_ADDED'] = $rootScope.$on('POINTS_ADDED', function (e, points) {
          if (points)
            $rootScope.loyaltyPoints = $rootScope.loyaltyPoints + points;
            saveLoyaltyPointsInAppData(WidgetHome.currentLoggedInUser._id, $rootScope.loyaltyPoints)
        });

        WidgetHome.listeners['POINTS_WAITING_APPROVAL_ADDED'] = $rootScope.$on('POINTS_WAITING_APPROVAL_ADDED', function (e, points) {
          if (points)
            $rootScope.PointsWaitingForApproval = parseInt($rootScope.PointsWaitingForApproval) + parseInt(points);
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
          console.log('REFRESH_APP');
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

        WidgetHome.openTab = function (index){
          WidgetHome.approvalRequestsTab = index
          document.querySelectorAll(".tablinks").forEach((element,i) => {
            if(element.classList.contains("active") && i == index){
              return;
            }
            if(element.classList.contains("active")){
              element.classList.remove("active")
            }
            if(index == i){
              element.classList.add("active")
            }
          })
        }

        var getFTQPointsIfAnyAndUpdate = function(){
          buildfire.datastore.get("Features",function (err, result) {
            if(result && result.data && result.data.length > 0){
              features = result.data;
              result.data.forEach(element => {
                buildfire.appData.search({
                  filter: { "$json.user._id": {$eq: WidgetHome.currentLoggedInUser._id} },
                  sort:   {"finishedDateTime": -1},
                  skip:   0,
                  limit:  1
                },
                "freeTextQuestionnaireSubmissions_" + element.instanceId,
                (err, res) => { 
                  if(res && res.length > 0 && !res[0].data.isEarnedPoints){
                    let selectedFTQ = res[0].data;
                    selectedFTQ.isEarnedPoints = true;
                    buildfire.appData.update(
                      res[0].id, // Replace this with your object id
                      selectedFTQ,
                      "freeTextQuestionnaireSubmissions_" + element.instanceId,
                      (err, result) => {
                        if (err) return console.error("Error while inserting your data", err);
                        let score = 0 
                        selectedFTQ.answers.forEach(answer => {
                          score += answer && answer.score ? answer.score : 0
                        });
                        if(WidgetHome.data && WidgetHome.data.settings && WidgetHome.data.settings.approvalType &&
                          WidgetHome.data.settings.approvalType == "ON_SITE_VIA_PASSCODE"){
                            ViewStack.push({
                              template: 'Code',
                              amount: score,
                              type: 'buyPoints',
                              title: element.title,
                              iconUrl:  element.iconUrl
                            });
                        } else {
                          Transactions.requestPoints("", score, $rootScope.loyaltyPoints, WidgetHome.currentLoggedInUser, element.title, element.iconUrl);
                          buildfire.notifications.pushNotification.schedule(
                          {
                            title: "Points Approval Request",
                            text: WidgetHome.currentLoggedInUser.displayName + " requests " + score + " points earned from "  + element.title,
                            groupName: "employerGroup"
                          , at: new Date()
                          },
                          () => {})
                          if($rootScope.PointsWaitingForApproval){
                            $rootScope.PointsWaitingForApproval += parseInt(score);
                          } else {
                            $rootScope.PointsWaitingForApproval = parseInt(score);
                          }
                          $rootScope.$digest();
                        }
                      }
                    );
                  }
                })
              });
            }
          })
        }

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
                getFTQPointsIfAnyAndUpdate();
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

          var successPoints = function (result) {
            if(result){
              $rootScope.PointsWaitingForApproval = result;
              $scope.$digest();
            }
          }
          if(WidgetHome.currentLoggedInUser){
            Transactions.getPointsWaitingForApproval(WidgetHome.currentLoggedInUser._id).then(successPoints,error);
          } else {
            buildfire.auth.getCurrentUser(function (err, user) {
              WidgetHome.currentLoggedInUser = user;
              checkIfEmployerOrUser();
              if (user) {
                 Transactions.getPointsWaitingForApproval(WidgetHome.currentLoggedInUser._id).then(successPoints,error);
               }
            })
          }
        };

        var loginCallback = function () {
          buildfire.auth.getCurrentUser(function (err, user) {
            console.log("_______________________", user);
            if (user) {
              WidgetHome.currentLoggedInUser = user;
              checkIfEmployerOrUser();
              WidgetHome.getLoyaltyPoints(user._id);
              $scope.$digest();
            }
          });
        };

        var logoutCallback = function () {
          buildfire.auth.getCurrentUser(function (err, user) {
            if(WidgetHome.isEmployer){
              buildfire.notifications.pushNotification.unsubscribe(
                { groupName: "employerGroup" },
                (err, subscribed) => {
                if (err) return console.error(err);
                }
              );
            } else {
              buildfire.notifications.pushNotification.unsubscribe(
                {  },
                (err, subscribed) => {
                  if (err) return console.error(err);
                }
              );
            }
              WidgetHome.currentLoggedInUser = null;
              $scope.$digest();
          });
        };


        var _checkIfEmployerOrUser = function(){
          if(WidgetHome.currentLoggedInUser.tags && WidgetHome.currentLoggedInUser.tags[WidgetHome.context.appId] && WidgetHome.tags != null && WidgetHome.tags.length > 0 && Object.keys(WidgetHome.tags).length > 0){
            WidgetHome.currentLoggedInUser.tags[WidgetHome.context.appId].forEach(tag => {
              WidgetHome.tags.forEach(settingTag => {
                if(settingTag.tagName == tag.tagName){
                  WidgetHome.isEmployer = true;
                  WidgetHome.isClient = false;
                  buildfire.notifications.pushNotification.subscribe(
                    { groupName: "employerGroup" },
                    (err, subscribed) => {
                    if (err) return console.error(err);
                    }
                  );
                  return;
                }
              })
              if(WidgetHome.isEmployer){
                return;
              }
            });
  
            if(WidgetHome.isEmployer == false){
                WidgetHome.isClient = true;
                buildfire.notifications.pushNotification.subscribe(
                  {  },
                  (err, subscribed) => {
                    if (err) return console.error(err);
                  }
                );
            }
          }
          else {
            WidgetHome.isClient = true;
            buildfire.notifications.pushNotification.subscribe(
              {  },
              (err, subscribed) => {
                if (err) return console.error(err);
              }
            );
          }
          
        }

        var checkIfEmployerOrUser = function(){
            if(WidgetHome.tags == null){
              buildfire.datastore.get("Tags", function (err, result) {
                if (err || !result) {
                    console.error("Error Gettings tags ", err);
                } else {
                    WidgetHome.tags = result.data
                    _checkIfEmployerOrUser();
                }
              });
            } else {
              _checkIfEmployerOrUser();
            }
        }

        var onUpdateCallback = function (event) {
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

                case "Introduction":
                    if(event.data.images){
                      WidgetHome.carouselImages = event.data.images;
                    } else {
                      WidgetHome.carouselImages = [];
                    }
                    WidgetHome.description = event.data.description;
                  break;

               case "Features":
                  features = event.data;
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
          if (user) {
            WidgetHome.currentLoggedInUser = user;
            checkIfEmployerOrUser();
            if (!WidgetHome.context) {
              Context.getContext(function (ctx) {
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

        buildfire.datastore.get("Tags", function (err, result) {
          if (err || !result) {
              console.error("Error Gettings tags ", err);
          } else {
              WidgetHome.tags = result.data
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

