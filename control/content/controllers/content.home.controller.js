'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI', 'STATUS_CODE', '$modal', 'RewardCache', '$location', '$timeout', 'context', 'TAG_NAMES',
      function ($scope, Buildfire, LoyaltyAPI, STATUS_CODE, $modal, RewardCache, $location, $timeout, context, TAG_NAMES) {
        var ContentHome = this;
        var _data = {
          redemptionPasscode: '12345',
          unqiueId: context.instanceId,
          externalAppId: context.appId,
          appId: context.appId,
          name: context.pluginId,
          pointsPerVisit: 0,
          pointsPerDollar: 1,
          totalLimit: 5000,
          dailyLimit: 1000,
          settings: {
            purchaseOption: {
              name: "Per Money Spent",
              value: "perMoneySpent"
            }
          },
          image: []
        };

        //Scroll current view to top when page loaded.
        buildfire.navigation.scrollTop();
        ContentHome.title = "";
        ContentHome.masterData = null;
        ContentHome.loyaltyRewards = [];
        ContentHome.loyaltyRewardsCloned = [];
        ContentHome.bodyWYSIWYGOptions = {
          plugins: 'advlist autolink link image lists charmap print preview',
          skin: 'lightgray',
          trusted: true,
          theme: 'modern'
        };
        ContentHome.currentLoggedInUser = null;
        ContentHome.invalidApplicationParameters = false;
        ContentHome.needToLoginInCP = false;




        function updateMasterItem(data) {
          ContentHome.masterData = angular.copy(data);
        }

        function isUnchanged(data) {
          return angular.equals(data, ContentHome.masterData);
        }


        /*UI sortable option*/
        ContentHome.rewardsSortableOptions = {
          handle: '> .cursor-grab',
          stop: function (event, ui) {
            var rewardsId = $.map(ContentHome.loyaltyRewards, function (reward) {
              return reward._id;
            });
            var data = {
              appId: context.appId,
              loyaltyUnqiueId: context.instanceId,
              loyaltyRewardIds: rewardsId,
              userToken: ContentHome.currentLoggedInUser.userToken,
              auth: ContentHome.currentLoggedInUser.auth
            };
            ContentHome.sortRewards(data);
            console.log('update', rewardsId);
          }
        };
        /*
         * Go pull any previously saved data
         * */
          ContentHome.init = function () {
              ContentHome.success = function (result) {
                  console.info('init success result:', result);
                  ContentHome.data = result;
                  if (!ContentHome.data)
                      ContentHome.data = angular.copy(_data);

                  //make sure to assign to the right appId
                  ContentHome.data.appId = _data.appId;
                  ContentHome.data.externalAppId = _data.externalAppId;

                  if (tmrDelay) clearTimeout(tmrDelay);

                  buildfire.datastore.get(TAG_NAMES.LOYALTY_INFO,function(err,data){
                    ContentHome.settings = data.data.settings;
                    updateMasterItem(ContentHome.data); 
                    if(Number(ContentHome.data.pointsPerDollar) <= 0) {
                      ContentHome.data.pointsPerDollar = 1;
                      saveData(JSON.parse(angular.toJson(ContentHome.data)));
                    }
                  });
              };
              ContentHome.error = function (err) {
                  if (err && err.code == 2100) {
                      console.error('Error while getting application:', err);
                      var success = function (result) {
                          console.info('Saved data result: ', result);
                          ContentHome.data = result;
                          updateMasterItem(result);
                          buildfire.messaging.sendMessageToWidget({
                              type: 'AppCreated'
                          });
                      }
                          , error = function (err) {
                          console.log('Error while saving data : ', err);
                          if(err && err.code == 2000) {
                            buildfire.messaging.sendMessageToWidget({
                              type: 'AppCreated'
                            });
                          }
                      };
                      if (ContentHome.currentLoggedInUser) {
                          _data.userToken = ContentHome.currentLoggedInUser.userToken;
                          _data.auth = ContentHome.currentLoggedInUser.auth;
                          LoyaltyAPI.addEditApplication(_data).then(success, error);
                      } else {
                          ContentHome.needToLoginInCP = true;
                          $timeout(function () {
                              ContentHome.needToLoginInCP = false;
                          }, 5000);
                      }
                  }
              };
              ContentHome.successloyaltyRewards = function (result) {
                  ContentHome.loyaltyRewards = result;
                  if (!ContentHome.loyaltyRewards)
                      ContentHome.loyaltyRewards = [];
                  ContentHome.loyaltyRewardsCloned = ContentHome.loyaltyRewards
                  ContentHome.addDeepLinks(result);
                  console.info('init success result loyaltyRewards:', result);
                  if (tmrDelay) clearTimeout(tmrDelay);
              };
              ContentHome.errorloyaltyRewards = function (err) {
                  if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                      console.log('Error while getting data loyaltyRewards', err);
                      if (tmrDelay) clearTimeout(tmrDelay);
                  }
              };
              LoyaltyAPI.getRewards(context.instanceId).then(ContentHome.successloyaltyRewards, ContentHome.errorloyaltyRewards);
              LoyaltyAPI.getApplication(context.instanceId).then(ContentHome.success, ContentHome.error);
              buildfire.auth.getCurrentUser(function (err, user) {
                  console.log("!!!!!!!!!!User!!!!!!!!!!!!", user);
                  if (user && user._cpUser) {
                      ContentHome.currentLoggedInUser = user._cpUser;
                      $scope.$digest();
                  }
              });
          };

        ContentHome.search = function() {
          if(ContentHome.title != ""){
              ContentHome.loyaltyRewards = ContentHome.loyaltyRewardsCloned.filter(x=>x.title.includes(ContentHome.title))
          }  else {
              ContentHome.successloyaltyRewards = function (result) {
                ContentHome.loyaltyRewards = result;
                if (!ContentHome.loyaltyRewards)
                    ContentHome.loyaltyRewards = [];
                ContentHome.loyaltyRewardsCloned = ContentHome.loyaltyRewards
                ContentHome.addDeepLinks(result);
                console.info('init success result loyaltyRewards:', result);
                if (tmrDelay) clearTimeout(tmrDelay);
            };
            ContentHome.errorloyaltyRewards = function (err) {
                if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                    console.log('Error while getting data loyaltyRewards', err);
                    if (tmrDelay) clearTimeout(tmrDelay);
                }
            };
            LoyaltyAPI.getRewards(context.instanceId).then(ContentHome.successloyaltyRewards, ContentHome.errorloyaltyRewards);
          }
        }

        ContentHome.addDeepLinks = function(list){
          Deeplink.getAll({},(err,result)=>{
            if(err)console.err(err);
            for (let i = 0; i < list.length; i++) {
              var reward = list[i];
              var exits=false;
              for (let n = 0; n < result.length; n++) {
                var deeplink = result[n];
                if(deeplink.id==reward._id)exits=true;
              }
              if(!exits){
                ContentHome.createDeepLink(reward);
              }
            }
          });
        }

        ContentHome.createDeepLink = function(reward){
          if(reward._id && reward.title){
            new Deeplink({
                deeplinkId:reward._id,
                name:reward.title,
                deeplinkData:{id:reward._id},
                imageUrl:(reward.listImage)?reward.listImage:null
            }).save();
          }
        }
        /*SortRewards method declaration*/
        ContentHome.sortRewards = function (data) {

          ContentHome.successSortRewards = function (result) {
            buildfire.messaging.sendMessageToWidget({
              type: 'ListSorted'
            });
            console.info('Reward list Sorted:', result);
            if (tmrDelay)clearTimeout(tmrDelay);
          };
          ContentHome.errorSortRewards = function (err) {
            if (err && err.code !== STATUS_CODE.NOT_FOUND) {
              console.log('Error while sorting rewards', err);
              if (tmrDelay)clearTimeout(tmrDelay);
            }
          };
          LoyaltyAPI.sortRewards(data).then(ContentHome.successSortRewards, ContentHome.errorSortRewards);
        };

        /*
         * Call the loyalty api to save the data object
         */
        var saveData = function (newObj, tag) {
          if (typeof newObj === 'undefined') {
            return;
          }
          var success = function (result) {
              console.info('Saved data result: ', result);
              updateMasterItem(newObj);
              buildfire.messaging.sendMessageToWidget({
                type: 'UpdateApplication',
                data: newObj
              });
            }
            , error = function (err) {
              console.log('Error while updating application : ', err);
              if (err && err.code == 2000) {
                ContentHome.invalidApplicationParameters = true;
                $timeout(function () {
                  ContentHome.invalidApplicationParameters = false;
                }, 3000);
              }
            };
            if (ContentHome.currentLoggedInUser) {
                newObj.auth = ContentHome.currentLoggedInUser.auth;
                newObj.userToken = ContentHome.currentLoggedInUser.userToken;
                newObj.appId = _data.appId;
                newObj.externalAppId = _data.externalAppId;
            }
            if (newObj && newObj.auth)
                LoyaltyAPI.addEditApplication(newObj).then(success, error);
        };

        /*Delete the loyalty*/
        ContentHome.removeLoyalty = function (loyaltyId, index) {
          var status = function (result) {
              console.log(result)
            },
            err = function (err) {
              console.log(err)
            };

          buildfire.navigation.scrollTop();

          var modalInstance = $modal.open({
            templateUrl: 'templates/modals/remove-loyalty.html',
            controller: 'RemoveLoyaltyPopupCtrl',
            controllerAs: 'RemoveLoyaltyPopup',
            size: 'sm',
            resolve: {
              loyaltyPluginData: function () {
                return ContentHome.loyaltyRewards[index];
              }
            }
          });


          modalInstance.result.then(function (message) {
            if (message === 'yes') {
              //ContentHome.loyaltyRewards.splice(index, 1);  //remove this line of code when API will start working.
              buildfire.messaging.sendMessageToWidget({
                index: index,
                type: 'RemoveItem'
              });
              //console.log(".................",ContentHome.loyaltyRewards)
              //uncomment it when API will start working
              ContentHome.success = function (result) {
                ContentHome.loyaltyRewards.splice(index, 1);
                console.log("Reward removed successfully");
              };
              ContentHome.error = function (err) {
                console.log("Some issue in Reward delete");
              };
              var data = {
                userToken: ContentHome.currentLoggedInUser.userToken,
                auth: ContentHome.currentLoggedInUser.auth,
                appId: context.appId
              };
              ContentHome.removeDeeplink(loyaltyId);
              LoyaltyAPI.removeReward(loyaltyId, data).then(ContentHome.success, ContentHome.error);

            }
          }, function (data) {
            //do something on cancel
          });
        };

        ContentHome.removeDeeplink =function(loyaltyId){
          Deeplink.deleteById(loyaltyId);
        }
        
        ContentHome.openReward = function (data, index) {
          RewardCache.setReward(data);
          $location.path('/reward/' + data._id + '/' + index);
          //  $scope.$digest();
        };
        /*
         * create an artificial delay so api isn't called on every character entered
         * */
        var tmrDelay = null;

        var saveDataWithDelay = function (newObj) {
          if (newObj) {
            if (isUnchanged(newObj)) {
              return;
            }
            if (tmrDelay) {
              clearTimeout(tmrDelay);
            }
            tmrDelay = setTimeout(function () {
              saveData(JSON.parse(angular.toJson(newObj)));
            }, 500);
          }
        };

        ContentHome.openSettingsPage = function() {
          buildfire.navigation.navigateToTab({
              tabTitle: "Settings",
              deeplinkData: {},
            },
            (err, res) => {
              if (err) return console.error(err); // `Content` tab was not found
            }
          );
        }

        /*
         * watch for changes in data and trigger the saveDataWithDelay function on change
         * */
        $scope.$watch(function () {
          return ContentHome.data;
        }, saveDataWithDelay, true);

        ContentHome.init();

      }]);
})(window.angular, window.buildfire);
