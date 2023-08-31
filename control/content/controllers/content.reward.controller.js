'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginContent')
    .controller('ContentRewardCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI', 'STATUS_CODE', '$location', '$routeParams', 'RewardCache', 'context',
      function ($scope, Buildfire, LoyaltyAPI, STATUS_CODE, $location, $routeParams, RewardCache, context) {
        var ContentReward = this;
        ContentReward.item = {
          title: "",
          pointsToRedeem: "",
          description: "",
          listImage: "",
          BackgroundImage: "",
          pointsPerItem: "",
        };
        ContentReward.validations = {
          title: false,
          points: false
        };
        ContentReward.isInserted = false;
        ContentReward.masterData = null;
        ContentReward.itemSaved = false;
        ContentReward.loading = false;
        updateMasterItem(ContentReward.item);
        ContentReward.bodyWYSIWYGOptions = {
          plugins: 'advlist autolink link image lists charmap print preview',
          skin: 'lightgray',
          trusted: true,
          theme: 'modern'
        };

        //Scroll current view to top when page loaded.
        buildfire.navigation.scrollTop();

        /*buildfire carousel component*/

        // create a new instance of the buildfire carousel editor
        ContentReward.editor = new Buildfire.components.carousel.editor("#carouselReward");
        // this method will be called when a new item added to the list
        ContentReward.editor.onAddItems = function (items) {
          if (!ContentReward.item.carouselImage)
            ContentReward.item.carouselImage = [];
          items.forEach(img => {
            img.url = buildfire.imageLib.cropImage(
              img.url, {
                size: "full_width",
                aspect: "16:9"
              }
            );
          });

          ContentReward.item.carouselImage.push.apply(ContentReward.item.carouselImage, items);
          changeCarouselActionItemDesign();
          if (!$scope.$$phase) $scope.$digest();
        };
        // this method will be called when an item deleted from the list
        ContentReward.editor.onDeleteItem = function (item, index) {
          ContentReward.item.carouselImage.splice(index, 1);
          if (!$scope.$$phase) $scope.$digest();
        };
        // this method will be called when you edit item details
        ContentReward.editor.onItemChange = function (item, index) {
          ContentReward.item.carouselImage.splice(index, 1, item);
          if (!$scope.$$phase) $scope.$digest();
        };
        // this method will be called when you change the order of items
        ContentReward.editor.onOrderChange = function (item, oldIndex, newIndex) {
          var items = ContentReward.item.carouselImage;

          var tmp = items[oldIndex];

          if (oldIndex < newIndex) {
            for (var i = oldIndex + 1; i <= newIndex; i++) {
              items[i - 1] = items[i];
            }
          } else {
            for (var i = oldIndex - 1; i >= newIndex; i--) {
              items[i + 1] = items[i];
            }
          }
          items[newIndex] = tmp;

          ContentReward.item.carouselImage = items;
          if (!$scope.$$phase) $scope.$digest();
        };

        /* list image add <start>*/
        ContentReward.listImage = new Buildfire.components.images.thumbnail("#listImage", {title: "List Image*", dimensionsLabel : "Recommended: 1200 x 1200px"});
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

        function changeCarouselActionItemDesign(){
          Array.from(document.querySelectorAll(".btn-icon.btn-delete-icon")).forEach(
            (el) => {
            el.classList.remove("btn-icon", "btn-delete-icon", "btn-danger");
            el.classList.add("icon", "icon-cross2");
            }
          );
          Array.from(document.querySelectorAll(".text-primary.text")).forEach(
            (el) => {
              el.style.marginRight = "32px"
            }
          );
        }

        /* list image add <end>*/

        /* Background image add <start>*/

        /* ContentReward.BackgroundImage = new Buildfire.components.images.thumbnail("#background", {title: "Background Image"});
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
         };*/    //Enable this above code if you want to show the add background option reward add.

        /* Background image add <end>*/

        function updateMasterItem(data) {
          ContentReward.masterData = angular.copy(data);
        }

        function isUnchanged(data) {
          return angular.equals(data, ContentReward.masterData);
        }

        buildfire.auth.getCurrentUser(function (err, user) {
          if (user && user._cpUser) {
            ContentReward.currentLoggedInUser = user._cpUser;
            if (!$scope.$$phase) $scope.$digest();
          }
        });
        ContentReward.addingReward = function () {
          ContentReward.validations = {
            title: false,
            points: false,
          };
          if(!ContentReward.item.title || ContentReward.item.title.length == 0) {
            ContentReward.validations.title = true;
          } 
          if (((!ContentReward.item.pointsToRedeem && ContentReward.item.pointsToRedeem !== 0) || ContentReward.item.pointsToRedeem.length == 0) && 
          (!ContentReward.item.pointsPerItem || ContentReward.item.pointsPerItem.length == 0) ){
            ContentReward.validations.points = true;
          } 
           if (!ContentReward.validations.title && !ContentReward.validations.points){
            // "Hack" for overcoming pointsToRedeem validation if the item can only be bought but not redeemed
            if(ContentReward.item.pointsPerItem && ContentReward.item.pointsPerItem.length > 0 
              && 
              ((!ContentReward.item.pointsToRedeem && ContentReward.item.pointsToRedeem !== 0) || ContentReward.item.pointsToRedeem.length === 0 || ContentReward.item.pointsToRedeem === '38762499627')) {
                ContentReward.item.pointsToRedeem = '38762499627'
            }
            ContentReward.addReward(JSON.parse(angular.toJson(ContentReward.item)));
          }
        }
        /*Add reward method declaration*/
        ContentReward.addReward = function (newObj) {
          ContentReward.isInserted = true;
          if (typeof newObj === 'undefined') {
            return;
          }
          ContentReward.loading = true;
          var data = newObj;
          data.appId = context.appId;
          data.loyaltyUnqiueId = context.instanceId;
          data.userToken = ContentReward.currentLoggedInUser && ContentReward.currentLoggedInUser.userToken;
          data.auth = ContentReward.currentLoggedInUser && ContentReward.currentLoggedInUser.auth;
          var success = function (result) {
              console.info('Saved data result: ', result);
              updateMasterItem(newObj);
              ContentReward.itemSaved = true;
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
              ContentReward.loading = false;
              ContentReward.gotToHome()
//              if($scope.$$phase) $scope.$digest();
            }
            , error = function (err) {
              ContentReward.isInserted = false;
              ContentReward.itemSaved = true;
              if (ContentReward.item._id) {
                buildfire.messaging.sendMessageToWidget({
                  id: ContentReward.item._id,
                  type: 'AddNewItem',
                  data: ContentReward.item
                });
              }
              ContentReward.gotToHome();
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
          data.appId = context.appId;
          data.loyaltyUnqiueId = context.instanceId;
          data.userToken = ContentReward.currentLoggedInUser.userToken;
          data.auth = ContentReward.currentLoggedInUser.auth;
          if(newObj.pointsToRedeem != '38762499627') {
            buildfire.messaging.sendMessageToWidget({
              id: $routeParams.id,
              index: $routeParams.index || 0,
              type: 'UpdateItem',
              data: ContentReward.item
            });
          }
          if (!$scope.$$phase) $scope.$digest();
          var success = function (result) {
              console.info('Saved data result: ', result);
              ContentReward.itemSaved = true;
              ContentReward.updateDeepLink(newObj);
            }
            , error = function (err) {
              console.error('Error while saving data : ', err);
              ContentReward.itemSaved = true;
            };
          LoyaltyAPI.updateReward(data).then(success, error);
        };

        /*validate the required fields whether its there or not */
        ContentReward.isValidReward = function (reward) {
          if (reward)
            return (reward.title && (reward.pointsToRedeem || reward.pointsToRedeem === 0));
        };

        /*This method is used to get the rewards details*/
        ContentReward.getRewards = function (rewardId) {

        };

        ContentReward.updateDeepLink = function (reward){
          if(reward._id && reward.title){
            new Deeplink({
                deeplinkId:reward._id,
                name:reward.title,
                deeplinkData:{id:reward._id},
                imageUrl:(reward.listImage)?reward.listImage:null
            }).save();
          }
        }



        /*Go back to home on done button click*/
        ContentReward.gotToHome = function () {
          buildfire.messaging.sendMessageToWidget({
            type: 'ReturnHome'
          });
          buildfire.history.pop();
          $location.path('#/');
        };

        ContentReward.goBack = function() {
          $location.path("/");
        }

        if ($routeParams.id && RewardCache.getReward()) {
          ContentReward.item = RewardCache.getReward();
          if(ContentReward.item.pointsToRedeem == '38762499627') {
            ContentReward.item.pointsToRedeem = '';
          }
          ContentReward.item.deepLinkUrl = Buildfire.deeplink.createLink({id: ContentReward.item._id});
          ContentReward.listImage.loadbackground(ContentReward.item.listImage);
          /* ContentReward.BackgroundImage.loadbackground(ContentReward.item.BackgroundImage);  */  //enable it when you want to show add background on reward add
          ContentReward.isInserted = true;
          if(ContentReward.item.pointsToRedeem === '38762499627') {
            buildfire.messaging.sendMessageToWidget({
              id: $routeParams.id,
              index: $routeParams.index || 0,
              type: 'OpenItem',
              data: ContentReward.item
            });
          }
          if (!ContentReward.item.carouselImage){
            ContentReward.editor.loadItems([]);
            changeCarouselActionItemDesign()
          }
            
          else
            ContentReward.editor.loadItems(ContentReward.item.carouselImage);
            changeCarouselActionItemDesign()
        }

        /*Save the data on .5 sec delay*/
        var tmrDelay = null;
        var saveDataWithDelay = function (newObj) {
          if (newObj) {
            if (isUnchanged(newObj)) {
              return;
            }
            ContentReward.itemSaved = false;
            if (tmrDelay) {
              clearTimeout(tmrDelay);
            }
            tmrDelay = setTimeout(function () {

              if (ContentReward.isValidReward(ContentReward.item) && ContentReward.isInserted && newObj._id) {
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
