'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('itemsPurchasedCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'RewardCache', '$rootScope', '$sce', 'Context', '$window', 'Transactions', 'STATUS',
    function ($scope, ViewStack, LoyaltyAPI, STATUS_CODE, TAG_NAMES, LAYOUTS, DataStore, RewardCache, $rootScope, $sce, Context, $window, Transactions, STATUS) {
        var ItemsPurchased = this;

        var currentView = ViewStack.getCurrentView();

        ItemsPurchased.appTheme = null;
        ItemsPurchased.Item = null;
        ItemsPurchased.TotalPoints = null;

        ItemsPurchased.currentLoggedInUser = null
        ItemsPurchased.Settings = null;
        ItemsPurchased.strings = $rootScope.strings;
        ItemsPurchased.Settings = null; 
        ItemsPurchased.drawerItems = [
          {
            text: ItemsPurchased.strings["staffApproval.approve"],
            value: "Approve"
          },
          {
            text: ItemsPurchased.strings["staffApproval.deny"],
            value:"Deny"
          }
        ]

        //create new instance of buildfire carousel viewer
        ItemsPurchased.view = null;

        ItemsPurchased.listeners = {};
        /**
         * Initialize current logged in user as null. This field is re-initialized if user is already logged in or user login user auth api.
         */
        ItemsPurchased.currentLoggedInUser = null;

        const itemsPurchasedListView = new buildfire.components.listView('itemsPurchasedContainer');


        buildfire.appearance.getAppTheme((err, appTheme) => {
          ItemsPurchased.appTheme = appTheme;
          let tab = document.querySelector(".tab");
          let tabButtons = document.querySelectorAll(".tablinks")
          
          tab.style.backgroundColor = appTheme.colors.titleBar
          tabButtons.forEach(el => {
            el.style.color = appTheme.colors.titleBarTextAndIcons
          })
          
       
        })

        ItemsPurchased.Update = (status) => {
            var success = function (result) {
                if(status == STATUS.Approved){
                    LoyaltyAPI.addLoyaltyPoints(ItemsPurchased.Item.data.createdBy._id, ItemsPurchased.Item.data.createdBy.userToken, ItemsPurchased.context.instanceId, ItemsPurchased.Settings.redemptionPasscode, ItemsPurchased.TotalPoints).then();
                    buildfire.dialog.toast({
                        message: ItemsPurchased.TotalPoints + " points approved for " + (ItemsPurchased.Item.data.createdBy.displayName ?  ItemsPurchased.Item.data.createdBy.displayName :  ItemsPurchased.Item.data.createdBy.email),
                        type: "success"
                      });
                  buildfire.notifications.pushNotification.schedule(
                    {
                      title: "Reward Approved",
                      text:  ItemsPurchased.Item.data.items[0].title +" has been approved",
                      users: [ItemsPurchased.Item.data.createdBy._id]
                    , at: new Date()
                    },
                    (err, result) => {
                      if (err) return console.error(err);
                    }
                  );
                } else {
                    buildfire.dialog.toast({
                        message: ItemsPurchased.TotalPoints + " points denied for " + (ItemsPurchased.Item.data.createdBy.displayName ?  ItemsPurchased.Item.data.createdBy.displayName :  ItemsPurchased.Item.data.createdBy.email),
                        type: "danger"
                      });
                         
                  buildfire.notifications.pushNotification.schedule(
                    {
                      title: "Reward Denied",
                      text:  ItemsPurchased.Item.data.items[0].title + " has been denied",
                      users: [ItemsPurchased.Item.data.createdBy._id]
                    , at: new Date()
                    },
                    (err, result) => {
                      if (err) return console.error(err);
                    }
                  );
                }
                ViewStack.pop()
              }
              , error = function (err) {
                  if (err ) {
                      console.error('Error Updating Reddeem Status', err);
                  }
              };

            Transactions.updateRequestedRedeemStatus(ItemsPurchased.Item, status, ItemsPurchased.currentLoggedInUser.displayName ? ItemsPurchased.currentLoggedInUser.displayName : ItemsPurchased.currentLoggedInUser.email).then(success, error)
        }

        function updateListViewDesign(){
          let listViewItemSubtitle = document.querySelectorAll(".listViewItemSubtitle")
          let listViewItemDescription = document.querySelectorAll(".listViewItemDescription")
          let listViewItemImg =  document.querySelectorAll(".listViewItemImg")
          let btnApproved = document.querySelector(".btn-approve")
          let listViewItemTitle =  document.querySelectorAll(".listViewItemTitle")
          let btnDeny = document.querySelector(".btn-deny")
          let listViewContainer = document.querySelectorAll(".listViewContainer")
          let listViewItem = document.querySelectorAll(".listViewItem")

          listViewContainer.forEach(el => {
            el.style.margin = "0px !important"
          })
          listViewItem.forEach(el => {
            el.style.padding = "0px !important"
          })
          btnDeny.style.color = ItemsPurchased.appTheme.colors.primaryTheme + " !important"
          listViewItemTitle.forEach(el => {
            el.style.color = ItemsPurchased.appTheme.colors.headerText
          })
          
          btnApproved.style.backgroundColor = ItemsPurchased.appTheme.colors.primaryTheme + " !important"

          listViewItemSubtitle.forEach(el => {
            el.style.color = ItemsPurchased.appTheme.colors.primaryTheme
          })
          listViewItemDescription.forEach(el => {
            el.style.color = ItemsPurchased.appTheme.colors.bodyText
          })
          listViewItemImg.forEach(el => {
            el.style.borderRadius =  "4px"
          })
        }

        /**
         * Method to parse and show description in html format
         */
        ItemsPurchased.safeHtml = function (html) {
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

        /*
         * Fetch user's data from datastore
         */

        var init = function () {
            ItemsPurchased.Item = currentView.item;
            let items = []
            ItemsPurchased.Item.data.items.forEach(element => {
                ItemsPurchased.TotalPoints += element.quantity  * element.pointsPerItem
                items.push({
                    id: element.id,
                    title: element.title,
                    imageUrl: element.listImage,
                    subtitle: element.pointsPerItem + " Points",
                    description: "Quantity: " + element.quantity 
                })
            })
            itemsPurchasedListView.loadListViewItems(items)
            updateListViewDesign();
            getCurrentUser();
        }

        var getCurrentUser = function() {
            buildfire.auth.getCurrentUser(function (err, user) {
              if (user) {
                ItemsPurchased.currentLoggedInUser = user;
              }
              Context.getContext(function (ctx) {
                ItemsPurchased.context = ctx;
               
                buildfire.datastore.get(TAG_NAMES.LOYALTY_INFO,function(err,result){
                  if(result && result.data && result.data.settings){
                    ItemsPurchased.Settings = result.data.settings
                  }
                })
              });
            })
          }

          ItemsPurchased.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
        if (!view || view.template === "items_purchased") {
            $scope.$destroy();
        }
        });
        $scope.$on("$destroy", function () {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>destroyed");
          for (var i in ItemsPurchased.listeners) {
            if (ItemsPurchased.listeners.hasOwnProperty(i)) {
              ItemsPurchased.listeners[i]();
            }
          }
        });

      
        init();
        ItemsPurchased.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
          if (ViewStack.getCurrentView().template == "items_purchased") {
            buildfire.datastore.onRefresh(function () {});
          }
          if(ViewStack.getCurrentView().template == "APPROVAL_REQUESTS"){
            redeemslistView.clear();
            pointslistView.clear();
            init();
          }
        });
      }]);
})(window.angular, window.buildfire);

