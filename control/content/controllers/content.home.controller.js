'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI','STATUS_CODE',
      function ($scope, Buildfire, LoyaltyAPI,STATUS_CODE) {
        var ContentHome = this;
        var _data = {
          redemptionPasscode: '',
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
        ContentHome.loyaltyRewards=[];
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
            var rewardsId = $.map(ContentHome.loyaltyRewards,function(revard){
              return revard._id;
            });
            var data={
              appId:15030018,
              loyaltyUniqueId:'e22494ec-73ea-44ac-b82b-75f64b8bc535',
              loyaltyRewardId:rewardsId,
              userToken: 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=',
              auth: "ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170="
            }
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
                ContentHome.data = {};

              updateMasterItem(ContentHome.data);
              if (tmrDelay)clearTimeout(tmrDelay);
            }
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
              }
          ContentHome.errorloyaltyRewards = function (err) {
                if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                  console.error('Error while getting data loyaltyRewards', err);
                  if (tmrDelay)clearTimeout(tmrDelay);
                }
              };
          LoyaltyAPI.getRewards('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(ContentHome.successloyaltyRewards, ContentHome.errorloyaltyRewards);
          LoyaltyAPI.getApplication('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(ContentHome.success, ContentHome.error);
        };


        ContentHome.sortRewards = function(data){
          ContentHome.successSortRewards = function (result) {
            console.info('Reward list Sorted:', result);
            if (tmrDelay)clearTimeout(tmrDelay);
          }
          ContentHome.errorSortRewards = function (err) {
            if (err && err.code !== STATUS_CODE.NOT_FOUND) {
              console.error('Error while sorting rewards', err);
              if (tmrDelay)clearTimeout(tmrDelay);
            }
          };
          LoyaltyAPI.sortRewards(data).then(ContentHome.successSortRewards , ContentHome.errorSortRewards);
        }
        /*
         * create an artificial delay so api isnt called on every character entered
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

      }]);
})(window.angular);
