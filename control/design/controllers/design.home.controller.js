'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginDesign')
    .controller('DesignHomeCtrl', ['$scope', 'LAYOUTS', 'DataStore','TAG_NAMES','Buildfire',
      function ($scope, LAYOUTS, DataStore,TAG_NAMES,Buildfire) {
        var DesignHome = this;
        var _data = {
          "design": {
            "listLayout": LAYOUTS.listLayout[0].name,
            "listBgImage": "",
            "itemDetailsBgImage": ""
          }
        };
        DesignHome.masterData = null;
        DesignHome.layouts = LAYOUTS;
        DesignHome.data = angular.copy(_data);


        /*On item list layout click event*/
        DesignHome.changeListLayout = function (layoutName) {
          DesignHome.data.design.listLayout = layoutName;
          if (tmrDelay)clearTimeout(tmrDelay);
        };

        function updateMasterItem(data) {
          DesignHome.masterData = angular.copy(data);
        }

        function isUnchanged(data) {
          return angular.equals(data, DesignHome.masterData);
        }

        /* item List background image add <start>*/
        DesignHome.itemListBackground = new Buildfire.components.images.thumbnail("#itemListBackground", {title: "Item List Background Image"});
        DesignHome.itemListBackground.onChange = function (url) {
          DesignHome.data.design.itemListbackgroundImage = url;
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        DesignHome.itemListBackground.onDelete = function (url) {
          DesignHome.data.design.itemListbackgroundImage = "";
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };
        /* item List background image add <end>*/

        /* item Details background image add <start>*/
        DesignHome.itemDetailsBackground = new Buildfire.components.images.thumbnail("#itemDetailsBackground", {title: "Item Details Background Image"});
        DesignHome.itemDetailsBackground.onChange = function (url) {
          DesignHome.data.design.itemDetailsBackgroundImage = url;
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        DesignHome.itemDetailsBackground.onDelete = function (url) {
          DesignHome.data.design.itemDetailsBackgroundImage = "";
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        /* item Details background image add <end>*/
        var init = function () {
          var success = function (result) {
              console.log("---------------------------", result);
              DesignHome.data = result.data;
              if (DesignHome.data && !DesignHome.data.design) {
                DesignHome.data.design = {};
              }
              if (!DesignHome.data.design.listLayout) {
                DesignHome.data.design.listLayout = DesignHome.layouts.listLayout[0].name;
              }
              updateMasterItem(DesignHome.data);
                if (DesignHome.data.design.itemListbackgroundImage) {
                  DesignHome.itemListBackground.loadbackground(DesignHome.data.design.itemListbackgroundImage);
                }
                if (DesignHome.data.design.itemDetailsBackgroundImage) {
                  DesignHome.itemDetailsBackground.loadbackground(DesignHome.data.design.itemDetailsBackgroundImage);
                }
              if (tmrDelay)clearTimeout(tmrDelay);
            }
            , error = function (err) {
              console.error('Error while getting data', err);
              if (tmrDelay)clearTimeout(tmrDelay);
            };
          DataStore.get(TAG_NAMES.LOYALTY_INFO).then(success, error);
        };

        /*
         * Call the datastore to save the data object
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
          DataStore.save(newObj, tag).then(success, error);
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
              saveData(JSON.parse(angular.toJson(newObj)), TAG_NAMES.LOYALTY_INFO);
            }, 500);
          }
        };

        /*
         * watch for changes in data and trigger the saveDataWithDelay function on change
         * */
        $scope.$watch(function () {
          return DesignHome.data;
        }, saveDataWithDelay, true);

        updateMasterItem(_data);

        init();
      }]);
})(window.angular, window.buildfire);

