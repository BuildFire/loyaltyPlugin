'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI', 'STATUS_CODE','$modal',
      function ($scope, Buildfire, LoyaltyAPI, STATUS_CODE, $modal) {
        var ContentHome = this;
        var _data = {
          redemptionPasscode: '00000',
          unqiueId: 'e22494ec-73ea-44ac-b82b-75f64b8bc535',
          externalAppId: 15030018,
          appId: 15030018,
          name: 'testloyalty',
          pointsPerVisit: 1,
          pointsPerDollar: 1,
          dailyLimit: 1000,
          image: "",
          userToken: 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=',
          auth: "ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170="
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

        function updateMasterItem(data) {
          ContentHome.masterData = angular.copy(data);
        }

        function isUnchanged(data) {
          return angular.equals(data, ContentHome.masterData);
        }


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
            }
           // ContentHome.sortRewards(data);
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

              //ContentHome.success = function (result){
              //  ContentHome.loyaltyRewards.splice(index, 1);
              //  console.log("Reward removed successfully");
              //}
              //ContentHome.error = function(err){
              //  console.log("Some issue in Reward delete");
              //}
              //var data = {
              //  userToken: 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=',
              //  auth: "ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170="
              //}
              //LoyaltyAPI.getApplication(ContentHome.loyaltyRewards._id,data).then(ContentHome.success, ContentHome.error);

            }
          }, function (data) {
            //do something on cancel
          });
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

        buildfire.auth.getCurrentUser(function (user) {
          console.log(")))))))))))))))))))))))))", user);

        });

      }]);
})(window.angular, window.buildfire);
