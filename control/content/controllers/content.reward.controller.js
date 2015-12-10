'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginContent')
    .controller('ContentRewardCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI', 'STATUS_CODE', '$location', '$routeParams', 'RewardCache',
      function ($scope, Buildfire, LoyaltyAPI, STATUS_CODE, $location, $routeParams, RewardCache) {
        var ContentReward = this;
        ContentReward.item = {
          title: "",
          pointsToRedeem: "",
          description: "",
          listImage: "",
          BackgroundImage: ""
        };
        ContentReward.isInserted = false;
        ContentReward.masterData = null;
        updateMasterItem(ContentReward.item);
        ContentReward.bodyWYSIWYGOptions = {
          plugins: 'advlist autolink link image lists charmap print preview',
          skin: 'lightgray',
          trusted: true,
          theme: 'modern'
        };

        /*buildfire carousel component*/

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

        buildfire.auth.getCurrentUser(function (err, user) {
          if (user) {
            ContentReward.currentLoggedInUser = user;
            $scope.$digest();
          }
        });

        /*Add reward method declaration*/
        ContentReward.addReward = function (newObj) {
          if (typeof newObj === 'undefined') {
            return;
          }
          var data = newObj;
          data.appId =  'b036ab75-9ddd-11e5-88d3-124798dea82d';
          data.loyaltyUnqiueId = buildfire.context.instanceId;
          data.userToken = ContentReward.currentLoggedInUser.userToken;
          data.auth = ContentReward.currentLoggedInUser.auth;
           var success = function (result) {
               console.info('Saved data result: ', result);
          updateMasterItem(newObj);
          ContentReward.item.deepLinkUrl = Buildfire.deeplink.createLink({id: result._id});
          ContentReward.item = Object.assign(ContentReward.item, result);
          ContentReward.isInserted = true;
          if (ContentReward.item._id) {
            buildfire.messaging.sendMessageToWidget({
              id: ContentReward.item._id,
              type: 'AddNewItem',
              data: ContentReward.item
            });
          }
           $scope.$digest();
           }
           , error = function (err) {
           ContentReward.isInserted = false;
              console.error('Error while saving data : ', err);
            };
            LoyaltyAPI.addReward(data).then(success, error);
        };

        /*Update reward method declaration*/
        ContentReward.updateReward = function (newObj) {
          if (typeof newObj === 'undefined') {
            return;
          }
          updateMasterItem(newObj);
          var data = newObj;
          data.appId =  'b036ab75-9ddd-11e5-88d3-124798dea82d';
          data.loyaltyUnqiueId = buildfire.context.instanceId;
          data.userToken = ContentReward.currentLoggedInUser.userToken;
          data.auth = ContentReward.currentLoggedInUser.auth;
           buildfire.messaging.sendMessageToWidget({
            id: $routeParams.id,
            type: 'UpdateItem',
            data: ContentReward.item
          });
          $scope.$digest();
           var success = function (result) {
               console.info('Saved data result: ', result);
           }
           , error = function (err) {
              console.error('Error while saving data : ', err);
            };
            LoyaltyAPI.updateReward(data).then(success, error);
        };

        /*validate the required fields whether its there or not */
        ContentReward.isValidReward = function (reward) {
          if (reward)
            return (reward.title && reward.pointsToRedeem);
        };

        /*This method is used to get the rewards details*/
        ContentReward.getRewards = function (rewardId) {

        };


        console.log(">>>>>>>>>>><<<<<<<<<<", RewardCache.getReward());

        /*Go back to home on done button click*/
        ContentReward.gotToHome = function () {
          $location.path('#/');
        };

        if ($routeParams.id && RewardCache.getReward()) {
          ContentReward.item = RewardCache.getReward();
          ContentReward.item.deepLinkUrl = Buildfire.deeplink.createLink({id: ContentReward.item ._id});
          console.log("aaaaaaaaaaaaaaaaaaaaaa",ContentReward.item)
          ContentReward.listImage.loadbackground(ContentReward.item.listImage);
          ContentReward.BackgroundImage.loadbackground(ContentReward.item.BackgroundImage);
          ContentReward.isInserted = true;
           buildfire.messaging.sendMessageToWidget({
            id: $routeParams.id,
            type: 'OpenItem',
            data: ContentReward.item
          });
        }

        /*Save the data on .5 sec delay*/
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
              if (ContentReward.isValidReward(ContentReward.item) && !ContentReward.isInserted && !$routeParams.id) {
                ContentReward.addReward(JSON.parse(angular.toJson(newObj)));
              }
              if (ContentReward.isValidReward(ContentReward.item) && ContentReward.isInserted) {
                ContentReward.updateReward(JSON.parse(angular.toJson(newObj)));
              }
              //saveData(JSON.parse(angular.toJson(newObj)));
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
})(window.angular, window.buildfire);
