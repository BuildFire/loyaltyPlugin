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
          pointsPerVisit: 0,
          pointsPerDollar: 0,
          dailyLimit: 0,
          image: "",
          userToken: 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=',
          auth: "ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170="
      };

        ContentHome.masterData = null;
        ContentHome.data = angular.copy(_data);

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

        /*
         * Go pull any previously saved data
         * */
        var init = function () {
          var success = function (result) {
              console.info('init success result:', result);
              ContentHome.data = result.data;
              if (!ContentHome.data.content)
                ContentHome.data.content = {};

              updateMasterItem(ContentHome.data);
              if (tmrDelay)clearTimeout(tmrDelay);
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
                if (tmrDelay)clearTimeout(tmrDelay);
              }
            };
          LoyaltyAPI.getApplication('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(success, error);
        };


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

        init();

      }]);
})(window.angular);
