'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI', 'STATUS_CODE', '$modal','rewardCache','$location',
      function ($scope, Buildfire, LoyaltyAPI, STATUS_CODE, $modal, rewardCache,$location) {
        var ContentHome = this;
        var _data = {
          redemptionPasscode: '',
          unqiueId: '',
          externalAppId: '',
          appId: '',
          name: '',
          pointsPerVisit: 1,
          pointsPerDollar: 1,
          totalLimit: 5000,
          dailyLimit: 1000,
          image: "",
          userToken: '',
          auth: ''
        };

        ContentHome.masterData = null;
        ContentHome.data = angular.copy(_data);
        ContentHome.loyaltyRewards = [];
        ContentHome.bodyWYSIWYGOptions = {
          plugins: 'advlist autolink link image lists charmap print preview',
          skin: 'lightgray',
          trusted: true,
          theme: 'modern'
        };
        ContentHome.currentLoggedInUser = null;

        /*buildfire carousel component*/
        // create a new instance of the buildfire carousel editor
        ContentHome.editor = new Buildfire.components.carousel.editor("#carousel");
        // this method will be called when a new item added to the list
        ContentHome.editor.onAddItems = function (items) {
          if (!ContentHome.data.image)
            ContentHome.data.image = [];

          ContentHome.data.image.push.apply(ContentHome.data.image, items);
          $scope.$digest();
        };
        // this method will be called when an item deleted from the list
        ContentHome.editor.onDeleteItem = function (item, index) {
          ContentHome.data.image.splice(index, 1);
          $scope.$digest();
        };
        // this method will be called when you edit item details
        ContentHome.editor.onItemChange = function (item, index) {
          ContentHome.data.image.splice(index, 1, item);
          $scope.$digest();
        };
        // this method will be called when you change the order of items
        ContentHome.editor.onOrderChange = function (item, oldIndex, newIndex) {
          var temp = ContentHome.data.image[oldIndex];
          ContentHome.data.image[oldIndex] = ContentHome.data.image[newIndex];
          ContentHome.data.image[newIndex] = temp;
          $scope.$digest();
        };


        function updateMasterItem(data) {
          ContentHome.masterData = angular.copy(data);
        }

        function isUnchanged(data) {
          return angular.equals(data, ContentHome.masterData);
        }


        /*UI sortable option*/
        ContentHome.rewardsSortableOptions = {
          handle: '> .cursor-grab',
          update: function (event, ui) {
            var rewardsId = $.map(ContentHome.loyaltyRewards, function (reward) {
              return reward._id;
            });
            var data = {
              appId: 15030018,
              loyaltyUniqueId: 'e22494ec-73ea-44ac-b82b-75f64b8bc535',
              loyaltyRewardId: rewardsId,
              userToken: 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=',
              auth: "ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170="
            };
            // ContentHome.sortRewards(data);  //uncomment it when API will start working
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
              ContentHome.data = {};
            if (!ContentHome.data.image)
              ContentHome.editor.loadItems([]);
            else
              ContentHome.editor.loadItems(ContentHome.data.image);
            updateMasterItem(ContentHome.data);
            if (tmrDelay)clearTimeout(tmrDelay);
          };
          ContentHome.error = function (err) {
            if (err && err.code !== STATUS_CODE.NOT_FOUND) {
              console.error('Error while getting data', err);
              if (tmrDelay)clearTimeout(tmrDelay);
            }
          };
          ContentHome.successloyaltyRewards = function (result) {
            ContentHome.loyaltyRewards = result;
            if (!ContentHome.loyaltyRewards)
              ContentHome.loyaltyRewards = [];
            console.info('init success result loyaltyRewards:', result);
            if (tmrDelay)clearTimeout(tmrDelay);
          };
          ContentHome.errorloyaltyRewards = function (err) {
            if (err && err.code !== STATUS_CODE.NOT_FOUND) {
              console.error('Error while getting data loyaltyRewards', err);
              if (tmrDelay)clearTimeout(tmrDelay);
            }
          };
          LoyaltyAPI.getRewards('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(ContentHome.successloyaltyRewards, ContentHome.errorloyaltyRewards);
          LoyaltyAPI.getApplication('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(ContentHome.success, ContentHome.error);
        };


        /*SortRewards method declaration*/
        ContentHome.sortRewards = function (data) {
          ContentHome.successSortRewards = function (result) {
            console.info('Reward list Sorted:', result);
            if (tmrDelay)clearTimeout(tmrDelay);
          };
          ContentHome.errorSortRewards = function (err) {
            if (err && err.code !== STATUS_CODE.NOT_FOUND) {
              console.error('Error while sorting rewards', err);
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
            }
            , error = function (err) {
              console.error('Error while saving data : ', err);
            };
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
              ContentHome.loyaltyRewards.splice(index, 1);  //remove this line of code when API will start working.

              //uncomment it when API will start working
              /*
               ContentHome.success = function (result){
               ContentHome.loyaltyRewards.splice(index, 1);
               console.log("Reward removed successfully");
               }
               ContentHome.error = function(err){
               console.log("Some issue in Reward delete");
               }
               var data = {
               userToken: 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=',
               auth: "ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170="
               }
               LoyaltyAPI.getApplication(ContentHome.loyaltyRewards._id,data).then(ContentHome.success, ContentHome.error);
               */

            }
          }, function (data) {
            //do something on cancel
          });
        };

        ContentHome.openReward = function(data){
          rewardCache.setReward(data);
          $location.path('/reward/' + data._id);
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

        /*
         * watch for changes in data and trigger the saveDataWithDelay function on change
         * */
        $scope.$watch(function () {
          return ContentHome.data;
        }, saveDataWithDelay, true);

        ContentHome.init();

        buildfire.auth.getCurrentUser(function (err, user) {
          console.log("!!!!!!!!!!User!!!!!!!!!!!!", user);
          console.log("!!!!!!!!!!Buildfire Context!!!!!!!!!!!!!!!", buildfire.context);
          if (user) {
            ContentHome.currentLoggedInUser = user;
            $scope.$digest();
          }
        });

      }]);
})(window.angular, window.buildfire);
