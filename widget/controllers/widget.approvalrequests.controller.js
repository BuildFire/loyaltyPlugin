'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('ApprovalRequestsCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'RewardCache', '$rootScope', '$sce', 'Context', '$window', 'Transactions', 'STATUS',
    function ($scope, ViewStack, LoyaltyAPI, STATUS_CODE, TAG_NAMES, LAYOUTS, DataStore, RewardCache, $rootScope, $sce, Context, $window, Transactions, STATUS) {
        var ApprovalRequests = this;
        ApprovalRequests.deepLinkingDone = false;
        ApprovalRequests.isEmployer = false;
        ApprovalRequests.appTheme = null;
        ApprovalRequests.approvalRequestsTab = 0
        ApprovalRequests.requests = [];
        ApprovalRequests.RedeemItems = [];
        ApprovalRequests.RedeemResult = [];
        ApprovalRequests.PointItems = []
        ApprovalRequests.PointResult = []
        ApprovalRequests.isPointItemsLoading = false;
        ApprovalRequests.isRedeemItemsLoading = false;
        ApprovalRequests.currentLoggedInUser = null
        ApprovalRequests.strings = $rootScope.strings;
        ApprovalRequests.Settings = null;
        ApprovalRequests.drawerItems = [
          {
            text: ApprovalRequests.strings["staffApproval.approve"],
            value: "Approve"
          },
          {
            text: ApprovalRequests.strings["staffApproval.deny"],
            value:"Deny"
          }
        ]
        var breadCrumbFlag = true;

        buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
          if (result && result.length) {
            result.forEach(function (breadCrumb) {
              if (breadCrumb.label == 'ApprovalRequests') {
                breadCrumbFlag = false;
              }
            });
          }
          if (breadCrumbFlag) {
            buildfire.history.push('ApprovalRequests', {
              elementToShow: 'ApprovalRequests'
            });
          }
        });

        $window.strings.getLanguage(function(err, response){
          const obj = response[0] ? response[0].data : $window.strings._data;
          const strings = {};
           Object.keys(obj).forEach(function (section){
             Object.keys(obj[section]).forEach(function (label) {
               strings[section + '.' + label] = obj[section][label].value || obj[section][label].defaultValue;
             });
           });
           ApprovalRequests.strings = {...ApprovalRequests.strings, ...strings};
           $rootScope.strings = {...ApprovalRequests.strings, ...strings};
        });

        //create new instance of buildfire carousel viewer
        ApprovalRequests.view = null;

        ApprovalRequests.listeners = {};
        /**
         * Initialize current logged in user as null. This field is re-initialized if user is already logged in or user login user auth api.
         */
        ApprovalRequests.currentLoggedInUser = null;

        const redeemslistView = new buildfire.components.listView('redeemsContainer');
        const pointslistView = new buildfire.components.listView('pointsContainer');


        redeemslistView.onItemActionClicked = (item) => {
          var success = function (result) {
            ApprovalRequests.RedeemItems = ApprovalRequests.RedeemItems.filter(x => x.id != item.id )
            redeemslistView.clear();
            redeemslistView.loadListViewItems(ApprovalRequests.RedeemItems)
            updateListViewDesign();

          }
          , error = function (err) {
              if (err ) {
                  console.error('Error Updating Reddeem Status', err);
              }
          };

          buildfire.components.drawer.open(
            {
              listItems: ApprovalRequests.drawerItems
            },
            (err, result) => {
              if (err) return console.error(err);
              buildfire.components.drawer.closeDrawer();
              var status = "";
              if(result.value == "Approve"){
                status = STATUS.Approved
              } else {
                status = STATUS.Denied
              }
              let selectedItem = ApprovalRequests.RedeemResult.find(x => x.id == item.id )

              Transactions.updateRequestedRedeemStatus(selectedItem, status, ApprovalRequests.currentLoggedInUser.displayName ? ApprovalRequests.currentLoggedInUser.displayName : ApprovalRequests.currentLoggedInUser.email ).then(success, error).then(x =>{
                if(status == STATUS.Approved){
                  buildfire.dialog.toast({
                    message: item.data.points + " points approved for " + item.title,
                    type: "success"
                  });
                  LoyaltyAPI.redeemPoints(selectedItem.data.createdBy._id, selectedItem.data.createdBy.userToken, `${ApprovalRequests.context.appId}_${ApprovalRequests.context.instanceId}`, selectedItem.data.item._id).then();

                  buildfire.notifications.pushNotification.schedule(
                    {
                      title: "Points Approved",
                      text: item.data.points + " points earned from " + item.title + " have been approved",
                      users: [selectedItem.data.createdBy._id]
                    , at: new Date()
                    },
                    (err, result) => {
                      if (err) return console.error(err);
                    }
                  );
                } else {
                  buildfire.dialog.toast({
                    message: item.data.points + " points denied for " + item.title,
                    type: "danger"
                  });
                  buildfire.notifications.pushNotification.schedule(
                    {
                      title: "Points Denied",
                      text: item.data.points + " points earned from " + item.title + " have been denied",
                      users: [selectedItem.data.createdBy._id]
                    , at: new Date()
                    },
                    (err, result) => {
                      if (err) return console.error(err);
                    }
                  );
                }

              });
            }
          );
        };

        pointslistView.onItemActionClicked = (item) => {
          var success = function (result) {

          }
          , error = function (err) {
              if (err ) {
                  console.error('Error Updating Reddeem Status', err);
              }
          };

          var successLoyaltyPoints = function(result){
            var selectedItem = ApprovalRequests.PointItems.find(x => x.id == item.id )
            ApprovalRequests.PointItems = ApprovalRequests.PointItems.filter(x => x.id != item.id )

            pointslistView.clear();
            pointslistView.loadListViewItems(ApprovalRequests.PointItems)
            updateListViewDesign();
            var updatedItem = ApprovalRequests.PointResult.find(x => x.id == item.id ) ;
            buildfire.dialog.toast({
              message: selectedItem.data.points + " points approved for " + selectedItem.title,
              type: "success"
            });
            var title = updatedItem.data.items ? updatedItem.data.items.map(el => el.title).join(",") : updatedItem.data.item ? updatedItem.data.item.title : "Unknown";
            buildfire.notifications.pushNotification.schedule(
              {
                title: "Reward Approved",
                text: !title ? "BUY POINTS" : title + " has been approved",
                users: [updatedItem.data.createdBy._id]
              , at: new Date()
              },
              (err, result) => {
                if (err) return console.error(err);
              }
            );
            $rootScope.$broadcast('POINTS_ADDED', { points: selectedItem.data.points, userId: updatedItem.data.createdBy._id });
          }, errorLoyaltyPoints = function (err) {
            if (err ) {
                console.error('Error Add ing Loyalty Points', err);
            }
        };

          buildfire.components.drawer.open(
            {
              listItems: ApprovalRequests.drawerItems
            },
            (err, result) => {
              if (err) return console.error(err);
              buildfire.components.drawer.closeDrawer();
              var status = "";
              if(result.value == "Approve"){
                status = STATUS.Approved
              } else {
                status = STATUS.Denied
              }
              let selectedItem = ApprovalRequests.PointResult.find(x => x.id == item.id )

              if(ApprovalRequests.Settings == null || !ApprovalRequests.Settings.redemptionPasscode){
                buildfire.dialog.toast({
                  message: "Please Add A Redemption Code",
                  type: "danger"
                });
                return;
              }
              Transactions.updateRequestedRedeemStatus(selectedItem, status, ApprovalRequests.currentLoggedInUser.displayName ? ApprovalRequests.currentLoggedInUser.displayName : ApprovalRequests.currentLoggedInUser.email).then(success, error).then(x=>{
                if(status == STATUS.Approved){
                  LoyaltyAPI.addLoyaltyPoints(selectedItem.data.createdBy._id, selectedItem.data.createdBy.userToken, `${ApprovalRequests.context.appId}_${ApprovalRequests.context.instanceId}`, ApprovalRequests.Settings.redemptionPasscode, item.data.points).then(successLoyaltyPoints, errorLoyaltyPoints);
                } else {
                  var updatedItem = ApprovalRequests.PointResult.find(x => x.id == item.id ) ;
                  buildfire.dialog.toast({
                    message: item.data.points + " points denied for " + item.title,
                    type: "danger"
                  });
                  buildfire.notifications.pushNotification.schedule(
                    {
                      title: "Reward Denied",
                      text:  (updatedItem.data.title == '' ? "BUY POINTS" : updatedItem.data.title) + " has been denied",
                      users: [updatedItem.data.createdBy._id]
                    , at: new Date()
                    },
                    (err, result) => {
                      if (err) return console.error(err);
                    }
                  );
                }

              })
            }
          );
        };

        pointslistView.onItemClicked = item => {
          if(item.data.isClickable){
            let selectedItem = ApprovalRequests.PointResult.find(x => x.id == item.id )
              ViewStack.push({
                template: 'items_purchased',
                item: selectedItem
              });
          }

        };

        buildfire.appearance.getAppTheme((err, appTheme) => {
          ApprovalRequests.appTheme = appTheme;
          let tab = document.querySelector(".tab");
          let tabButtons = document.querySelectorAll(".tablinks")

          tab.style.backgroundColor = appTheme.colors.titleBar
          tabButtons.forEach(el => {
            el.style.color = appTheme.colors.titleBarTextAndIcons
          })

        })

        function updateListViewDesign(){
          let listViewItemSubtitle = document.querySelectorAll(".listViewItemSubtitle")
          let listViewItemDescription = document.querySelectorAll(".listViewItemDescription")
          let glyphicons = document.querySelectorAll(".glyphicon")
          let listViewItemTitle =  document.querySelectorAll(".listViewItemTitle")

          listViewItemTitle.forEach(el => {
            el.style.color = ApprovalRequests.appTheme.colors.headerText
          })
            listViewItemSubtitle.forEach(el => {
              el.style.color = ApprovalRequests.appTheme.colors.primaryTheme
            })
          listViewItemDescription.forEach(el => {
            el.style.color = ApprovalRequests.appTheme.colors.bodyText
          })
          glyphicons.forEach(el => {
            el.style.color = ApprovalRequests.appTheme.colors.icons

        })
        }

        /**
         * Method to parse and show description in html format
         */
        ApprovalRequests.safeHtml = function (html) {
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

        ApprovalRequests.openTab = function (index){
          ApprovalRequests.approvalRequestsTab = index
          document.querySelectorAll(".tablinks").forEach((element,i) => {
            if(element.classList.contains("active") && i == index){
              return;
            }
            if(element.classList.contains("active")){
              element.classList.remove("active")
            }
            if(index == i){
              element.classList.add("active")
            }
          })
        }

        /*
         * Fetch user's data from datastore
         */

        var init = function () {
           ApprovalRequests.isRedeemItemsLoading = true;
           ApprovalRequests.isPointItemsLoading = true;
            var successRequestedRedeems = function(result){
              ApprovalRequests.isRedeemItemsLoading = false;
              if(result && result.length){
                ApprovalRequests.RedeemResult = result;

                let items = []
                result.forEach(element => {

                  items.push({
                    id: element.id,
                    title: element.data.createdBy.displayName ? element.data.createdBy.displayName : element.data.createdBy.username ,
                    imageUrl: buildfire.auth.getUserPictureUrl({ userId: element.data.createdBy.userId }),
                    subtitle: element.data.item.title + " (" + element.data.item.pointsToRedeem + " Points)",
                    description: formatDate(element.data.createdAt),
                    data: {
                      points: element.data.item.pointsToRedeem,
                    },
                    action: {
                      icon: 'material-icons material-inject--more'
                    }
                  })
                });
                ApprovalRequests.RedeemItems = items;
                redeemslistView.loadListViewItems(items)
                updateListViewDesign();
              }
            }, errorRequestedRedeems = function (err) {
              ApprovalRequests.isRedeemItemsLoading = false;
              console.error('Error while getting data', err);
            }

            var successRequestedPoints = function(result){
               ApprovalRequests.isPointItemsLoading = false;
              if(result && result.length){
                ApprovalRequests.PointResult = result;
                let items = []
                result.forEach(element => {
                  let title = "";
                  let subTitle = "";
                  let isClickable = false;
                  if(element.data.items){
                    let title = "";
                    element.data.items.forEach(item => {
                      title == "" ? title = item.title : title += ", "+ item.title
                    })
                    subTitle = (element.data.items.length == 1 ? element.data.items.length  + " item" :   element.data.items.length + " items") + " • " +  element.data.pointsEarned + " Points"
                    isClickable = true;
                  } else if(element.data.item){
                    title = element.data.item.title;
                    subTitle = (element.data.item.title == "POINTS PURCHASE" ? element.data.purchaseAmount + "$" : element.data.item.title)    + " • " + element.data.pointsEarned + " Points"
                  }
                  items.push({
                      id: element.id,
                      title: element.data.createdBy.displayName ? element.data.createdBy.displayName : element.data.createdBy.username ,
                      imageUrl: buildfire.auth.getUserPictureUrl({ userId: element.data.createdBy.userId }),
                      subtitle: subTitle,
                      description: formatDate(element.data.createdAt),
                      data: {
                        points: element.data.pointsEarned,
                        isClickable: isClickable,
                        title: title
                      },
                      action: {
                        icon: 'material-icons material-inject--more'
                      }
                    })

                });
                ApprovalRequests.PointItems = items;
                pointslistView.loadListViewItems(items)
                updateListViewDesign();
              }
            }, errorRequestedPoints = function (err) {
              ApprovalRequests.isPointItemsLoading = false;
              console.error('Error while getting data', err);
            }
            getCurrentUser();
          Transactions.getRequestedRedeems().then(successRequestedRedeems, errorRequestedRedeems);
          Transactions.getRequestedPoints().then(successRequestedPoints, errorRequestedPoints);

        };


        var getCurrentUser = function() {
          buildfire.auth.getCurrentUser(function (err, user) {
            if (user) {
              ApprovalRequests.currentLoggedInUser = user;


            }
            Context.getContext(function (ctx) {
              ApprovalRequests.context = ctx;

              buildfire.datastore.get(TAG_NAMES.LOYALTY_INFO,function(err,result){
                if(result && result.data && result.data.settings){
                  ApprovalRequests.Settings = result.data.settings
                }
              })
            });
          })
        }


        var formatDate = function(date) {
          let currentDate = new Date();
          let selectedDate = new Date(date);
          let time = selectedDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }).toUpperCase();
          if(currentDate.toDateString() === selectedDate.toDateString()){
              return "Today " + time;
            }

          currentDate.setDate(currentDate.getDate() - 1);
          if (currentDate.toDateString() === selectedDate.toDateString()) {
            return "Yesterday " + time;;
          }

          return selectedDate.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
        }
        ApprovalRequests.listeners['GOTO_HOME'] = $rootScope.$on('GOTO_HOME', function (e) {
          ViewStack.popAllViews();
        });

        $scope.$on("$destroy", function () {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>destroyed");
          if (ApprovalRequests.view) {
            ApprovalRequests.view._destroySlider();
            ApprovalRequests.view._removeAll();
          }
          for (var i in ApprovalRequests.listeners) {
            if (ApprovalRequests.listeners.hasOwnProperty(i)) {
              ApprovalRequests.listeners[i]();
            }
          }
        });
        ApprovalRequests.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
          if (!view || view.template === "APPROVAL_REQUESTS") {
            $scope.$destroy();
          }
        });

        init();

        ApprovalRequests.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
          if (ViewStack.getCurrentView().template == "items_purchased") {
                // buildfire.datastore.onRefresh(function () {
                //     init();
                // });
                init();
          }
          if(ViewStack.getCurrentView().template == "APPROVAL_REQUESTS"){
            redeemslistView.clear();
            pointslistView.clear();
            init();
          }
        });

        // ApprovalRequests.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
        //     if (!ViewStack.hasViews()) {
        //         // bind on refresh again
        //         buildfire.datastore.onRefresh(function () {
        //             init();
        //         });
        //     }
        // });
      }]);
})(window.angular, window.buildfire);

