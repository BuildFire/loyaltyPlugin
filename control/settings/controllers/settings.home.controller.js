'use strict';
(function (angular) {
    angular
        .module('loyaltyPluginSettings')
        .controller('SettingsCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI', 'TAG_NAMES','$sce',
            function ($scope, Buildfire, LoyaltyAPI, TAG_NAMES,$sce) {
                var SettingsHome = this;
                SettingsHome.data = null;
                SettingsHome.ftqFeatureItems = [];
                SettingsHome.tags = [];
                SettingsHome.currency=[{
                    name:"USD, AUD, NZD, CAD, Peso, Real, etc. ",
                    symbol: '&#36;'
                },
                {
                name:"Euro",
                    symbol: '&#128;'
                },
                {
                    name:"Yuan and Yen",
                    symbol: "&#165;"
                },
                {
                    name:"Duetsche Mark",
                    symbol:"DM"
                },
                {
                    name:"Franc",
                    symbol:"&#8355;"
                },
                {
                    name:"Pound",
                    symbol:"&#163;"
                },
                {
                    name:"Lira",
                    symbol:"&#8356;"
                },
                {
                    name:"Rouble",
                    symbol:'<del>P</del>'
                },
                {
                    name:"Switz Franc",
                    symbol:"SFr"
                },
                {
                    name:"Rand",
                    symbol:"ZAR"
                }];

                SettingsHome.purchaseOptions = [{
                    name: "Per Money Spent",
                    value: "perMoneySpent"
                },
                {
                    name: "Per Items Purchased",
                    value: "perProductsPurchased"
                },
                {
                    name: "Score from Free Text Questionnaire",
                    value: "scoreFromFreeTextQuestionnaire"
                }];
                let ftqFeatures = new buildfire.components.actionItems.sortableList(
                    ".ftqFeatures"
                  );
                document.querySelector(".add-new-item").innerHTML = "Add Feature"
                
                  buildfire.datastore.get("Features",function (err, result) {
                    if (err || !result) {
                      console.error(err, 'Error while getting datastore.');
                      buildfire.dialog.toast({
                        message: "Error while loading data. Retrying again in 2 seconds...",
                        duration: 1999
                      });
                      setTimeout(function() {
                        location.reload();
                      }, 2000);
                      return;
                    }
                  
                    if(result && result.data && result.data.length > 0){
                        console.log(result)
                    ftqFeatures.loadItems(result.data);
                    SettingsHome.ftqFeatureItems = result.data;

                    }
                })

                ftqFeatures.onAddItems = function (item) {
                    item.order = SettingsHome.ftqFeatureItems.length;
                    SettingsHome.ftqFeatureItems.push(item)
                    buildfire.datastore.save(SettingsHome.ftqFeatureItems,"Features", function (err, result) {
                        if (err || !result) {
                            console.error("Error saving the widget details: ", err);
                        }
                    });
                };

                ftqFeatures.onDeleteItem = function (item, index) {
                    SettingsHome.ftqFeatureItems.splice(index, 1);
                    buildfire.datastore.save(SettingsHome.ftqFeatureItems,"Features", function (err, result) {
                        if (err || !result) {
                            console.error("Error saving the widget details: ", err);
                        }
                    });
                };

                ftqFeatures.onOrderChange = function (item, oldIndex, newIndex) {
                    var items =  SettingsHome.ftqFeatureItems;

                    items[oldIndex].order = newIndex;

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
                    buildfire.datastore.save(items,"Features", function (err, result) {
                        if (err || !result) {
                            console.error("Error saving the widget details: ", err);
                        }
                    });
               };

               ftqFeatures.onItemChange = (item, index) => {
                SettingsHome.ftqFeatureItems[index]= item;
                buildfire.datastore.save(SettingsHome.ftqFeatureItems,"Features", function (err, result) {
                    if (err || !result) {
                        console.error("Error saving the widget details: ", err);
                    }
                });
              };
               
               SettingsHome.currentLoggedInUser = null;
               SettingsHome.context = null;

               buildfire.auth.getCurrentUser(function (err, user) {
                    if (user && user._cpUser) {
                        SettingsHome.currentLoggedInUser = user._cpUser;
                        $scope.$digest();
                    }
                });
                buildfire.getContext(function (err, context) {
                    if(!err) {
                        SettingsHome.context = context;
                    } else console.error(err);
                });
                SettingsHome.newCurrency = [];

                var _data = {
                    "settings":{
                        currency:""
                    }
                };
                SettingsHome.masterData=[];
                updateMasterItem(_data);

                function updateMasterItem(data) {
                    SettingsHome.masterData = angular.copy(data);
                }
                function isUnchanged(data) {
                    return angular.equals(data, SettingsHome.masterData);
                }

                var init = function () {
                    buildfire.datastore.get(TAG_NAMES.LOYALTY_INFO,function(err,data){
                        if(err)
                            console.error('Error while getting data', err);
                        else {
                            buildfire.datastore.get(TAG_NAMES.NEW_CURRENCY,function(err,currencyData){
                                if(err)
                                    console.error('Error while getting data', err);
                                else {
                                    if(currencyData.data && currencyData.data.length > 0)
                                    SettingsHome.newCurrency = currencyData.data;
                                    SettingsHome.data = data.data;
                                    if(SettingsHome.data && SettingsHome.data.settings){
                                        if(!SettingsHome.data.settings.approvalType){
                                            SettingsHome.data.settings.approvalType = "ON_SITE_VIA_PASSCODE"
                                        }
                                    } else {
                                        SettingsHome.data.settings = { 
                                            approvalType : "ON_SITE_VIA_PASSCODE"
                                        }
                                    }
                                    buildfire.datastore.get("Tags", function (err, result) {
                                        if (err || !result) {
                                            console.error("Error saving the widget details: ", err);
                                        } else {
                                            SettingsHome.tags = result.data
                                          
                                            $scope.$apply();
                                            updateMasterItem(SettingsHome.data);
                                            if (tmrDelay)clearTimeout(tmrDelay);
                                        }
                                    });
                                }
                            });
                        }
                    });
                    let ftqContainer = ftqFeatures.selector.childNodes[0]
                    ftqContainer.removeChild(ftqContainer.childNodes[0])
                    ftqContainer.childNodes[0].classList.remove("col-md-9")
                    ftqContainer.childNodes[0].classList.add("col-md-12")

                    let ftqButton = ftqContainer.childNodes[0].childNodes[0]
                    ftqButton.childNodes[0].style.float = "right !important"
                    ftqButton.childNodes[0].classList.remove("pull-left")
                    ftqButton.childNodes[0].classList.add("pull-right")


                };

                SettingsHome.openTagDialog = function() {
                    buildfire.auth.showTagsSearchDialog(null, (err, result) => {
                        if (err) return console.error(err);
                        SettingsHome.tags = result;
                        $scope.$apply();
                        buildfire.datastore.save(SettingsHome.tags,"Tags", function (err, result) {
                            if (err || !result) {
                                console.error("Error saving the widget details: ", err);
                            }
                        });
                      });
                }

                SettingsHome.removeTag = function(index) {
                    SettingsHome.tags.splice(index, 1);
                    buildfire.datastore.save(SettingsHome.tags,"Tags", function (err, result) {
                        if (err || !result) {
                            console.error("Error saving the widget details: ", err);
                        }
                    });
                }

                SettingsHome.changeCurrency = function(currency){
                    if(!SettingsHome.data.settings) {
                        SettingsHome.data.settings = {};
                    }else {
                        SettingsHome.data.settings.currency = currency;
                    }
                };
                SettingsHome.changePurchaseOption = function(purchaseOption){
                    if(!SettingsHome.data.settings) {
                        SettingsHome.data.settings = {
                            purchaseOption: purchaseOption
                        };
                    } else {
                        SettingsHome.data.settings.purchaseOption = purchaseOption;
                    }
                };
                SettingsHome.saveData = function (newObj, tag) {
                    if (typeof newObj === 'undefined') {
                        return;
                    }
                    buildfire.datastore.save(newObj, tag,function(err,data){
                        if(err)
                            console.error('Error while saving data : ', err);
                        else {
                            console.info('Saved data result: ', data);
                            updateMasterItem(newObj);
                        }
                    });
                    addEditApplication(newObj);
                };
                var tmrDelay = null;
                SettingsHome.convertHtml=function(html){
                    return $sce.trustAsHtml(html)
                };

                var addEditApplication = function(newObj) {
                    var _data = {
                        redemptionPasscode: newObj.settings.redemptionPasscode ? newObj.settings.redemptionPasscode : '12345',
                        unqiueId: SettingsHome.context.instanceId,
                        externalAppId: SettingsHome.context.appId,
                        appId: SettingsHome.context.appId,
                        name: SettingsHome.context.pluginId,
                        pointsPerVisit: newObj.settings.pointsPerVisit ? newObj.settings.pointsPerVisit : 1,
                        pointsPerDollar: newObj.settings.pointsPerDollar ? newObj.settings.pointsPerDollar : 1,
                        totalLimit: newObj.settings.totalLimit ? newObj.settings.totalLimit :5000,
                        dailyLimit: newObj.settings.dailyLimit ? newObj.settings.dailyLimit :1000,
                        settings: newObj.settings.purchaseOption ? newObj.settings.purchaseOption : {
                          purchaseOption: {
                            name: "Per Money Spent",
                            value: "perMoneySpent"
                          }
                        }
                    };
                    var success = function (result) {
                        // console.info('Saved data result: ', result);
                        // ContentHome.data = result;
                         updateMasterItem(result);
                        buildfire.messaging.sendMessageToWidget({
                            type: 'AppCreated'
                        });
                    },
                    error = function (err) {
                        console.log('Error while saving data : ', err);
                        if(err && err.code == 2000) {
                          buildfire.messaging.sendMessageToWidget({
                            type: 'AppCreated'
                          });
                        }
                    };
                    if (SettingsHome.currentLoggedInUser) {
                        _data.auth = SettingsHome.currentLoggedInUser.auth;
                        _data.userToken = SettingsHome.currentLoggedInUser.userToken;
                        _data.appId = _data.appId;
                        _data.externalAppId = _data.externalAppId;
                    }
                    if (_data && _data.auth)
                        LoyaltyAPI.addEditApplication(_data).then(success, error);
                }

                SettingsHome.saveDataWithDelay = function (newObj) {
                    if (newObj) {
                        if (isUnchanged(newObj)) {
                            return;
                        }
                        if (tmrDelay) {
                            clearTimeout(tmrDelay);
                        }
                        tmrDelay = setTimeout(function () {
                            SettingsHome.saveData(JSON.parse(angular.toJson(newObj)), TAG_NAMES.LOYALTY_INFO);
                        }, 500);
                    }
                };
                $scope.$watch(function () {
                    return SettingsHome.data;
                }, SettingsHome.saveDataWithDelay, true);

                SettingsHome.addNewCurrency = function () {
                    SettingsHome.newCurrency.push(SettingsHome.newSymbol);
                    SettingsHome.changeCurrency(SettingsHome.newSymbol);
                    SettingsHome.newSymbol =  {};
                    SettingsHome.saveData(SettingsHome.newCurrency,TAG_NAMES.NEW_CURRENCY);
                };

                init();


            }]);
})(window.angular);


