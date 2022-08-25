'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetRewardsCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'RewardCache', '$rootScope', '$sce', 'Context', '$window', 'Transactions', 'STATUS',
    function ($scope, ViewStack, LoyaltyAPI, STATUS_CODE, TAG_NAMES, LAYOUTS, DataStore, RewardCache, $rootScope, $sce, Context, $window, Transactions, STATUS) {
        var WidgetRewards = this;

        WidgetRewards.appTheme = null;
        WidgetRewards.view = null;
        WidgetRewards.listeners = {};
        WidgetRewards.isPastRewardsEmpty = true;
        WidgetRewards.isUpcomingRewardsEmpty = true;

        WidgetRewards.currentUser = null;

        
        var page = 0;
        var breadCrumbFlag = true;
        buildfire.history.get('pluginBreadcrumbsOnly', function (err, result) {
          if (result && result.length) {
            result.forEach(function (breadCrumb) {
              if (breadCrumb.label == 'Rewards') {
                breadCrumbFlag = false;
              }
            });
          }
          if (breadCrumbFlag) {
            buildfire.history.push('Rewards', {
              elementToShow: 'Rewards'
            });
          }
        });

        const upcomingRewardsContainer = new buildfire.components.listView('upcomingRewardsContainer');
        const pastRewardsContainer = new buildfire.components.listView('pastRewardsContainer');


        upcomingRewardsContainer.onItemClicked = item => {
          if(item.data.item != null){
            ViewStack.push({
              template: 'Item_Details',
              item: item.data.item,
              isReward: true
            });
            $scope.$digest()
            $scope.$apply()
          }
          
        };
        pastRewardsContainer.onItemClicked = item => {
          if(item.data.item != null){
            ViewStack.push({
              template: 'Item_Details',
              item: item.data.item,
              isReward: true
            });
            $scope.$digest()
            $scope.$apply()

          }
        };

        buildfire.appearance.getAppTheme((err, appTheme) => {
          WidgetRewards.appTheme = appTheme;
        })

        function updateListViewDesign(){
          let listViewItemSubtitle = document.querySelectorAll(".listViewItemSubtitle")
          let listViewItemDescription = document.querySelectorAll(".listViewItemDescription")
          let listViewItemImg =  document.querySelectorAll(".listViewItemImg")
          let listViewItemTitle =  document.querySelectorAll(".listViewItemTitle")
          let listViewContainer = document.querySelectorAll(".listViewContainer")

          listViewContainer.forEach(el => {
            el.style.margin = "0px"
          })

          listViewItemTitle.forEach(el => {
            el.style.color = WidgetRewards.appTheme.colors.headerText
          })

          listViewItemSubtitle.forEach(el => {
            if(el.innerHTML === STATUS.Approved){
                el.style.color = WidgetRewards.appTheme.colors.successTheme
            } else if(el.innerHTML === STATUS.Denied){
                el.style.color = WidgetRewards.appTheme.colors.dangerTheme
            } else {
                el.style.color = WidgetRewards.appTheme.colors.warningTheme
            }
          })
          listViewItemDescription.forEach(el => {
            el.style.color = WidgetRewards.appTheme.colors.bodyText
          })
         
          listViewItemImg.forEach(el => {
            el.style.borderRadius =  "4px"
          })
        }

        /**
         * Method to parse and show description in html format
         */
        WidgetRewards.safeHtml = function (html) {
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


        var init = function () {

            var success = function (result) {
                let upcomingRewards = [];
                let pastRewards = [];
                result.forEach(element => {
                    let createdDate = new Date(element.data.createdAt).toLocaleDateString();
                    let title = "";
                    let imageUrl = null;
                    let item = null;
                    if(element.data.items && element.data.items.length > 0){
                        imageUrl = element.data.items[0].listImage;
                        var itemsTitle = element.data.items.map(function (result){
                          return result.title
                        });
                        title = itemsTitle.join(",")
                    } else if (element.data.item != null){
                        if(element.data.purchaseAmount && element.data.purchaseAmount != "" ){
                          element.data.item.earnPoint = element.data.purchaseAmount + "$ • " + element.data.pointsEarned
                        } else if (element.data.purchaseAmount == "") {
                          element.data.item.earnPoint = element.data.pointsEarned
                        }
                        item = element.data.item,
                        title = element.data.item.title;
                        imageUrl = element.data.item.listImage;
                    } 
                    if(element.data.status === STATUS.Processing){
                        upcomingRewards.push({
                            id: element.id,
                            title: title,
                            imageUrl: imageUrl,
                            subtitle: element.data.status ? element.data.status : "",
                            description: createdDate,
                            data: {
                              item: item
                            }
                        })
                    } else {
                        pastRewards.push({
                            id: element.id,
                            title: title,
                            imageUrl: imageUrl,
                            subtitle: element.data.status ? element.data.status : "" ,
                            description: createdDate,
                            data: {
                              item: item
                            }
                        })
                    }
                });
                if(upcomingRewards.length > 0 && page == 0){
                  WidgetRewards.isUpcomingRewardsEmpty = false;
                }
                if(pastRewards.length > 0 && page == 0){
                  WidgetRewards.isPastRewardsEmpty = false;
                }
                upcomingRewardsContainer.append(upcomingRewards)
                pastRewardsContainer.append(pastRewards)
                updateListViewDesign();
                page += 1
                if(result.length == 20){
                   Transactions.getRewardsByUserId(WidgetRewards.currentUser._id, page).then(success, error)
                }
              }
              , error = function (err) {
                  if (err ) {
                      console.error('Error Getting Rewards', err);
                  }
              };
              buildfire.auth.getCurrentUser(function (err, user) {
                if (user) {
                    WidgetRewards.currentUser = user;
                  Transactions.getRewardsByUserId(user._id, page).then(success, error)
                }
              })
       



          
        }

          WidgetRewards.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
        if (!view || view.template === "Item_Details") {
            $scope.$destroy();
        }
        });
        $scope.$on("$destroy", function () {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>destroyed");
          for (var i in WidgetRewards.listeners) {
            if (WidgetRewards.listeners.hasOwnProperty(i)) {
              WidgetRewards.listeners[i]();
            }
          }
        });

        WidgetRewards.refresh = function () {
          Introduction.get()
          .then((res) => {
            })
          .catch((err) => {
          })
        }

      
        init();
        WidgetRewards.listeners['CHANGED'] = $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
          if (ViewStack.getCurrentView().template == "Rewards") {
            buildfire.datastore.onRefresh(function () {});
          }
          if (ViewStack.getCurrentView().template == "Item_Details") {
            ViewStack.pop()
          }
        });
      }]);
})(window.angular, window.buildfire);

