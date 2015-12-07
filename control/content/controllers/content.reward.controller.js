'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginContent')
    .controller('ContentRewardCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI','STATUS_CODE',
      function ($scope, Buildfire, LoyaltyAPI,STATUS_CODE) {
        var ContentReward = this;
        ContentReward.item ={
          itemTitle:"",
          pointsToRedeem:"",
          description:"",
          listImage:"",
          BackgroundImage:""
        };

        ContentReward.masterData=null;
        updateMasterItem(ContentReward.item);
        ContentReward.bodyWYSIWYGOptions = {
          plugins: 'advlist autolink link image lists charmap print preview',
          skin: 'lightgray',
          trusted: true,
          theme: 'modern'
        };

        // create a new instance of the buildfire carousel editor
        ContentReward.editor = new Buildfire.components.carousel.editor("#carousel");
        // this method will be called when a new item added to the list
        ContentReward.editor.onAddItems = function (items) {
          if (!ContentReward.item.carouselImage)
            ContentReward.item.carouselImage = [];

          ContentReward.item.carouselImage.push.apply(ContentReward.item.carouselImage, items);
          $scope.$digest();
        };
        // this method will be called when an item deleted from the list
        ContentReward.editor.onDeleteItem = function (item, index) {
          ContentReward.item.carouselImage.splice(index, 1);
          $scope.$digest();
        };
        // this method will be called when you edit item details
        ContentReward.editor.onItemChange = function (item, index) {
          ContentReward.item.carouselImage.splice(index, 1, item);
          $scope.$digest();
        };
        // this method will be called when you change the order of items
        ContentReward.editor.onOrderChange = function (item, oldIndex, newIndex) {
          var temp = ContentReward.item.carouselImage[oldIndex];
          ContentReward.item.carouselImage[oldIndex] = ContentReward.item.carouselImage[newIndex];
          ContentReward.item.carouselImage[newIndex] = temp;
          $scope.$digest();
        };

        /* list image add <start>*/
        ContentReward.listImage = new Buildfire.components.images.thumbnail("#listImage", {title: "List Image"});
        ContentReward.listImage.onChange = function (url) {
          ContentReward.item.listImage = url;
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        ContentReward.listImage.onDelete = function (url) {
          ContentReward.item.listImage = "";
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        /* list image add <end>*/

        /* Background image add <start>*/
        ContentReward.BackgroundImage = new Buildfire.components.images.thumbnail("#background", {title: "Background Image"});
        ContentReward.BackgroundImage.onChange = function (url) {
          ContentReward.item.BackgroundImage = url;
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        ContentReward.BackgroundImage.onDelete = function (url) {
          ContentReward.item.BackgroundImage = "";
          if (!$scope.$$phase && !$scope.$root.$$phase) {
            $scope.$apply();
          }
        };

        /* Background image add <end>*/

        function updateMasterItem(data) {
          ContentReward.masterData = angular.copy(data);
        }

        function isUnchanged(data) {
          return angular.equals(data, ContentReward.masterData);
        }

        var saveData = function (newObj, tag) {
          if (typeof newObj === 'undefined') {
            return;
          }
         var data = newObj;
          data.userToken= 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=';
          data.auth= "ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=";
          // var success = function (result) {
           //     console.info('Saved data result: ', result);
                updateMasterItem(newObj);
             // }
             // , error = function (err) {
            //    console.error('Error while saving data : ', err);
            //  };
        //  LoyaltyAPI.addReward(data).then(success, error);
        };
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
          return ContentReward.item;
        }, saveDataWithDelay, true);
      }]);
})(window.angular);
