'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'Utils', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'RewardCache', '$rootScope', '$sce', 'Context', '$window', 'Transactions',
      function ($scope,Utils, ViewStack, LoyaltyAPI, STATUS_CODE, TAG_NAMES, LAYOUTS, DataStore, RewardCache, $rootScope, $sce, Context, $window, Transactions) {
        var WidgetHome = this;
        WidgetHome.deepLinkingDone = false;
        WidgetHome.isEmployer = false;
        WidgetHome.isClient = false;
        WidgetHome.approvalRequestsTab = 0
        WidgetHome.tags = null;
        WidgetHome.skeleton = {
         currentPoints: null ,
         layout: null,
        };
        WidgetHome.pointMessage = "";
        var features = []


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
        const saveLoyaltyPointsInAppData = function(userId, totalPoints, points, type){
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
              if(res && res.length > 0){
                let oldPoints = res[0].data.newPoints ? res[0].data.newPoints : 0

                let newPoints;
                if(type === "Redeemed" && WidgetHome.data.settings.deductLeaderboardPoints){
                  newPoints = oldPoints === 0 ? negative(points) : oldPoints - points;
                }
                else if(type === "Added"){
                  newPoints = oldPoints + points;
                }
                // If points are redeemed and deductLearboardPoints is off -> No changes
                if(newPoints){
                  buildfire.appData.searchAndUpdate(
                    { userId: { $eq: userId} },
                    { $set: { totalPoints, newPoints  } },
                    "userLoyaltyPoints",
                    () => {}
                  );
                }
              } else {
                let data = {
                  userId: userId,
                  totalPoints: totalPoints,
                  newPoints: totalPoints
                }
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

        const negative = (num) => -Math.abs(num)


        WidgetHome.getLoyaltyPoints = function (userId) {
          var success = function (result) {
              $rootScope.loyaltyPoints = result.totalPoints;
              WidgetHome.applicationExists = true;
            },
             error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting points data----------------------------------------', err);
              }
            };
            if (userId)
                LoyaltyAPI.getLoyaltyPoints(userId, WidgetHome.currentLoggedInUser.userToken, `${WidgetHome.context.appId}_${WidgetHome.context.instanceId}`).then(success, error);
        };

        /**
         * Method to fetch loyalty application and list of rewards
         */
        WidgetHome.getApplicationAndRewards = function () {
          return new Promise((resolve, reject) => {
            const successLoyaltyRewards = function (result) {
              WidgetHome.loyaltyRewards = result;
              if (!WidgetHome.loyaltyRewards) WidgetHome.loyaltyRewards = [];
              buildfire.deeplink.getData(function (data) {
                if (data && data.id && !WidgetHome.deepLinkingDone) {
                  WidgetHome.deepLinkingDone = true;
                  const reward = WidgetHome.loyaltyRewards.find(el => el._id === data.id);
                  if (reward) {
                    WidgetHome.openReward(reward, -1);
                  } else {
                    Utils.getLanguage('deeplink.deeplinkRewardNotFound').then(message => {
                      buildfire.dialog.toast({
                        message: message,
                      });
                    });
                  }
                }
              });
            };

            const errorLoyaltyRewards = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data loyaltyRewards:', err);
                reject(err);
              }
            };

            const successApplication = function (result) {
              Introduction.get()
                .then((res) => {
                  if (res) {
                    WidgetHome.carouselImages = res.data.images || [];
                    WidgetHome.description = res.data.description;
                  } else {
                    WidgetHome.carouselImages = [];
                  }
                  RewardCache.setApplication(result);
                  if (WidgetHome.currentLoggedInUser != null) {
                    WidgetHome.getLoyaltyPoints(WidgetHome.currentLoggedInUser._id);
                  }
                  if (!$rootScope.$$phase) $rootScope.$digest();
                  resolve();
                })
                .catch((err) => {
                  console.error(err);
                  reject(err);
                });
            };

            const errorApplication = function (error) {
              WidgetHome.carouselImages = [];
              console.error('Error fetching loyalty application:', error);
              reject(error);
            };

            if (WidgetHome.context && WidgetHome.context.instanceId) {
              getLoggedInUser();
              Promise.all([
                LoyaltyAPI.getApplication(`${WidgetHome.context.appId}_${WidgetHome.context.instanceId}`).then(successApplication, errorApplication),
                LoyaltyAPI.getRewards(`${WidgetHome.context.appId}_${WidgetHome.context.instanceId}`).then(successLoyaltyRewards, errorLoyaltyRewards)
              ]).catch(reject); // Catch any rejection from either API call
            } else {
              Context.getContext(function (ctx) {
                WidgetHome.context = ctx;
                Promise.all([
                  LoyaltyAPI.getApplication(`${WidgetHome.context.appId}_${WidgetHome.context.instanceId}`).then(successApplication, errorApplication),
                  LoyaltyAPI.getRewards(`${WidgetHome.context.appId}_${WidgetHome.context.instanceId}`).then(successLoyaltyRewards, errorLoyaltyRewards)
                ]).catch(reject); // Catch any rejection from either API call
              });
            }
          });
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
            saveLoyaltyPointsInAppData(WidgetHome.currentLoggedInUser._id, $rootScope.loyaltyPoints, points, "Redeemed")

        });

        /**
         * This event listener is bound for "POINTS_ADDED" event broadcast
         */
        WidgetHome.listeners['POINTS_ADDED'] = $rootScope.$on('POINTS_ADDED', function (e, { points, userId }) {
          // no userId means points should be assigned to the logged-in user
          if (!userId) {
            if (points) $rootScope.loyaltyPoints = $rootScope.loyaltyPoints + points;
            saveLoyaltyPointsInAppData(WidgetHome.currentLoggedInUser._id, $rootScope.loyaltyPoints, points, "Added")
          } else {
            // defined users, get their totalPoints first
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
                const totalPoints = res && res.length && res[0].data.totalPoints ?
                  (res[0].data.totalPoints + points)
                  : points;
                saveLoyaltyPointsInAppData(userId, totalPoints, points, "Added")
              }
            );
          }
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
            LoyaltyAPI.getRewards(`${WidgetHome.context.appId}_${WidgetHome.context.instanceId}`).then(successLoyaltyRewards, errorLoyaltyRewards);
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
          return description && !((description == '<p>&nbsp;<br></p>') || (description == '<p><br data-mce-bogus="1"></p>'));
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
            if(result && result.data && result.data.length > 0 && WidgetHome.currentLoggedInUser != null){
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
                          if (!$rootScope.$$phase) $rootScope.$digest();
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
          const success = function (result) {
            if (result && result.data) {
              WidgetHome.data = result.data;
            } else {
              WidgetHome.data = {
                design: {
                  listLayout: LAYOUTS.listLayout[0].name
                }
              };
            }

            if (!WidgetHome.data.design) {
              WidgetHome.data = {
                ...WidgetHome.data,
                design: {
                  listLayout: LAYOUTS.listLayout[0].name
                }
              };
            }

            startSkeleton();
            getFTQPointsIfAnyAndUpdate();
            Utils.getLanguage('general.points').then(pointText => {
              WidgetHome.pointMessage = pointText;
            })

            if (!WidgetHome.data.settings) {
              WidgetHome.data.settings = {
                enableGetMorePointsButton: true,
              };
            }

            if (WidgetHome.data.settings && !WidgetHome.data.settings.hasOwnProperty('enableGetMorePointsButton')) {
              WidgetHome.data.settings.enableGetMorePointsButton = true;
            }

            $rootScope.itemListbackgroundImage = WidgetHome.data.design.itemListbackgroundImage || "";
            $rootScope.itemDetailsBackgroundImage = WidgetHome.data.design.itemDetailsBackgroundImage || "";
          };

          const error = function (err) {
            WidgetHome.data = { design: { listLayout: LAYOUTS.listLayout[0].name }, settings: { enableGetMorePointsButton: true } };
            startSkeleton();
            console.error('Error while getting data', err);
          };

          const successPoints = function (result) {
            if (typeof result === 'number' && result >= 0) {
              $rootScope.PointsWaitingForApproval = result;
              if (!$scope.$$phase) $scope.$digest();
            }
          };

          // Fetch data first
          const dataPromise = DataStore.get(TAG_NAMES.LOYALTY_INFO).then(success, error);

          const pointsPromise = new Promise((resolve, reject) => {
            if (WidgetHome.currentLoggedInUser) {
              Transactions.getPointsWaitingForApproval(WidgetHome.currentLoggedInUser._id).then(resolve, reject);
            } else {
              buildfire.auth.getCurrentUser((err, user) => {
                if (err) {
                  reject(err);
                } else {
                  WidgetHome.currentLoggedInUser = user;
                  checkIfEmployerOrUser();
                  if (user) {
                    Transactions.getPointsWaitingForApproval(WidgetHome.currentLoggedInUser._id).then(resolve, reject);
                  } else {
                    resolve();
                  }
                }
              });
            }
          }).then(successPoints, error);

          dataPromise.then(() => {
            return Promise.all([
              pointsPromise,
              WidgetHome.getApplicationAndRewards()
            ]).then(() => {
              stopSkeleton();
            }).catch((err) => {
              console.error('Error in promises:', err);
              stopSkeleton();
            });;
          })
        };

        var startSkeleton = function (){
          const currentLayout = WidgetHome.data.design.listLayout;
          const layoutSkeletonTypes = {
            "List_Layout_1": { currentPointsType: 'image', layoutType: 'image' },
            "List_Layout_2": { currentPointsType: 'image', layoutType: 'button, list-item-two-line' },
            "List_Layout_3": { currentPointsType: 'image', layoutType: 'button, list-item-two-line' }
          };

          if (layoutSkeletonTypes[currentLayout]) {
            WidgetHome.skeleton.currentPoints = new buildfire.components.skeleton('.current-points-skeleton', { type: layoutSkeletonTypes[currentLayout].currentPointsType });
            WidgetHome.skeleton.layout = new buildfire.components.skeleton('.item', { type: layoutSkeletonTypes[currentLayout].layoutType });
            WidgetHome.skeleton.currentPoints.start();
            WidgetHome.skeleton.layout.start();
          }
        }
        var stopSkeleton = function (){
          const currentLayout = WidgetHome.data.design.listLayout;
          WidgetHome.skeleton.currentPoints.stop();
          WidgetHome.skeleton.layout.stop();
          WidgetHome.skeleton.currentPoints = null;
          WidgetHome.skeleton.layout = null;
          $rootScope.$digest();
         }

        var loginCallback = function () {
          buildfire.auth.getCurrentUser(function (err, user) {
            if (user) {
              WidgetHome.currentLoggedInUser = user;
              checkIfEmployerOrUser();
              WidgetHome.getLoyaltyPoints(user._id);
              if (!$scope.$$phase) $scope.$digest();
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
              if (!$scope.$$phase) $scope.$digest();
          });
        };


        var _checkIfEmployerOrUser = function(){
          if(WidgetHome.currentLoggedInUser){
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


        }

        var checkIfEmployerOrUser = function(){
            if(WidgetHome.tags == null){
              buildfire.datastore.get("Tags", function (err, result) {
                if (err || !result) {
                    console.error("Error Gettings tags ", err);
                } else {
                  WidgetHome.tags = result.data;
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
                  if (!WidgetHome.data.settings)
                    WidgetHome.data.settings = {
                    enableGetMorePointsButton: true,
                    };
                  if (!WidgetHome.data.settings.hasOwnProperty('enableGetMorePointsButton')) {
                    WidgetHome.data.settings.enableGetMorePointsButton = true;
                  }
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
              if (!$scope.$$phase) $scope.$digest();
              if (!$rootScope.$$phase) $rootScope.$digest();
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
                if (!$scope.$$phase) $scope.$digest();
              });
            } else {
              WidgetHome.getLoyaltyPoints(WidgetHome.currentLoggedInUser._id);
              if (!$scope.$$phase) $scope.$digest();
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
          WidgetHome.context = ctx;
        });
        init();

          WidgetHome.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
              if (!ViewStack.hasViews()) {
                  init();
                  // bind on refresh again
                  buildfire.datastore.onRefresh(function () {
                      init();
                  });
              }
          });
      }]);
})(window.angular, window.buildfire);

