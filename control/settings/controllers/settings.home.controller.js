'use strict';
(function (angular) {
    angular
        .module('loyaltyPluginSettings')
        .controller('SettingsCtrl', ['$scope', 'Buildfire', 'LoyaltyAPI', 'TAG_NAMES', '$sce',
            function ($scope, Buildfire, LoyaltyAPI, TAG_NAMES, $sce) {
                var SettingsHome = this;
                SettingsHome.data = null;
                SettingsHome.userTagsInput = null;
                SettingsHome.ftqFeatureItems = [];
                SettingsHome.tags = [];
                SettingsHome.redemptionCodeError = false;
                SettingsHome.showRedemptionCode = true;
                SettingsHome.enableGetMorePointsButton = true;
                SettingsHome.currency = [{
                    name: "USD, AUD, NZD, CAD, Peso, Real, etc. ",
                    symbol: '&#36;'
                },
                {
                    name: "Euro",
                    symbol: '&#128;'
                },
                {
                    name: "Yuan and Yen",
                    symbol: "&#165;"
                },
                {
                    name: "Duetsche Mark",
                    symbol: "DM"
                },
                {
                    name: "Franc",
                    symbol: "&#8355;"
                },
                {
                    name: "Pound",
                    symbol: "&#163;"
                },
                {
                    name: "Lira",
                    symbol: "&#8356;"
                },
                {
                    name: "Rouble",
                    symbol: '<del>P</del>'
                },
                {
                    name: "Switz Franc",
                    symbol: "SFr"
                },
                {
                    name: "Rand",
                    symbol: "ZAR"
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

                buildfire.datastore.get("Features", function (err, result) {
                    if (err || !result) {
                        console.error(err, 'Error while getting datastore.');
                        buildfire.dialog.toast({
                            message: "Error while loading data. Retrying again in 2 seconds...",
                            duration: 1999
                        });
                        setTimeout(function () {
                            location.reload();
                        }, 2000);
                        return;
                    }

                    if (result && result.data && result.data.length > 0) {
                        SettingsHome.ftqFeatureItems = result.data;
                        if (!$scope.$$phase) $scope.$digest();
                        changeActionItemIcon();
                    }
                })

                var changeActionItemIcon = function () {
                    Array.from(document.querySelectorAll(".btn-icon.btn-delete-icon")).forEach(
                        (el) => {
                            el.classList.remove("btn-icon", "btn-delete-icon", "btn-danger");
                            el.classList.add("icon", "icon-cross2");
                        }
                    );
                }

                SettingsHome.openActionItemsDialog = function () {
                    window.buildfire.pluginInstance.showDialog({}, (error, response) => {
                        let croppedImage = buildfire.imageLib.cropImage(
                            response[0].iconUrl,
                            { size: "half_width", aspect: "16:9" }
                        );
                        response[0].iconUrl = croppedImage;
                        SettingsHome.ftqFeatureItems.push(response[0])
                        if (!$scope.$$phase) $scope.$digest();
                        buildfire.datastore.save(SettingsHome.ftqFeatureItems, "Features", function (err, result) {
                            if (err || !result) {
                                console.error("Error saving the widget details: ", err);
                            }
                        });
                    })
                }
                SettingsHome.removeActionItemFeature = function (index) {
                    SettingsHome.ftqFeatureItems.splice(index, 1);
                    buildfire.datastore.save(SettingsHome.ftqFeatureItems, "Features", function (err, result) {
                        if (err || !result) {
                            console.error("Error saving the widget details: ", err);
                        }
                    });

                }

                SettingsHome.currentLoggedInUser = null;
                SettingsHome.context = null;

                buildfire.auth.getCurrentUser(function (err, user) {
                    if (user && user._cpUser) {
                        SettingsHome.currentLoggedInUser = user._cpUser;
                        if (!$scope.$$phase) $scope.$digest();
                    }
                });
                buildfire.getContext(function (err, context) {
                    if (!err) {
                        SettingsHome.context = context;
                    } else console.error(err);
                });
                SettingsHome.newCurrency = [];

                var _data = {
                    "settings": {
                        currency: ""
                    }
                };
                SettingsHome.masterData = [];
                updateMasterItem(_data);

                function updateMasterItem(data) {
                    SettingsHome.masterData = angular.copy(data);
                }
                function isUnchanged(data) {
                    return angular.equals(data, SettingsHome.masterData);
                }

                var init = function () {

                    handleUserTagsInput();
                    buildfire.datastore.get(TAG_NAMES.LOYALTY_INFO, function (err, data) {
                        if (err)
                            console.error('Error while getting data', err);
                        else {
                            buildfire.datastore.get(TAG_NAMES.NEW_CURRENCY, function (err, currencyData) {
                                if (err)
                                    console.error('Error while getting data', err);
                                else {
                                    if (currencyData.data && currencyData.data.length > 0)
                                        SettingsHome.newCurrency = currencyData.data;
                                    SettingsHome.data = data.data;
                                    if (SettingsHome.data && SettingsHome.data.settings) {
                                        if (!SettingsHome.data.settings.approvalType) {
                                            SettingsHome.data.settings.approvalType = "ON_SITE_VIA_PASSCODE"
                                        }
                                        if (!SettingsHome.data.settings.hasOwnProperty('enableGetMorePointsButton')) {
                                            SettingsHome.data.settings.enableGetMorePointsButton = true
                                        }
                                    } else {
                                        SettingsHome.data.settings = {
                                            approvalType: "ON_SITE_VIA_PASSCODE",
                                            enableGetMorePointsButton: true
                                        }
                                    }

                                    if (SettingsHome.data && SettingsHome.data.settings && SettingsHome.data.settings.approvalType
                                        && SettingsHome.data.settings.approvalType == "REMOVE_VIA_APP" && SettingsHome.data.settings.purchaseOption
                                        && SettingsHome.data.settings.purchaseOption.value == "scoreFromFreeTextQuestionnaire") {
                                        SettingsHome.showRedemptionCode = false;

                                    }
                                    buildfire.datastore.get("Tags", function (err, result) {
                                        if (err || !result) {
                                            console.error("Error saving the widget details: ", err);
                                        } else {
                                            SettingsHome.tags = result.data;
                                            if (SettingsHome.tags && SettingsHome.tags.length > 0) {
                                                SettingsHome.tags = SettingsHome.tags.map(tag => {
                                                    return {
                                                        ...tag,
                                                        value: tag.tagName
                                                    };
                                                });
                                                SettingsHome.userTagsInput.append(SettingsHome.tags);
                                            }
                                            if (!$scope.$$phase) $scope.$apply();
                                            updateMasterItem(SettingsHome.data);
                                            if (tmrDelay) clearTimeout(tmrDelay);
                                        }
                                    });
                                }
                            });
                        }
                    });
                };
                var handleUserTagsInput = function () {
                    SettingsHome.userTagsInput = new buildfire.components.control.userTagsInput('#customTagsInputContainer', {
                        languageSettings: {
                            placeholder: 'User Tags',
                        },
                    });
                    SettingsHome.userTagsInput.onUpdate = function (data) {
                        if (SettingsHome.tags.length === data.tags.length) {
                            return ;
                        }
                        SettingsHome.tags = data.tags;
                        buildfire.datastore.save(SettingsHome.tags, "Tags", function (err, result) {
                            if (err || !result) {
                                console.error("Error saving the widget details: ", err);
                            }
                        });
                    }
                }

                SettingsHome.changeCurrency = function (currency) {
                    if (!SettingsHome.data.settings) {
                        SettingsHome.data.settings = {};
                    } else {
                        SettingsHome.data.settings.currency = currency;
                    }
                };
                SettingsHome.changePurchaseOption = function (purchaseOption) {
                    if (!SettingsHome.data.settings) {
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
                    buildfire.datastore.save(newObj, tag, function (err, data) {
                        if (err)
                            console.error('Error while saving data : ', err);
                        else {
                            buildfire.messaging.sendMessageToWidget({
                                type: 'SettingsUpdated',
                                data: data
                            });
                            console.info('Saved data result: ', data);
                            updateMasterItem(newObj);
                        }
                    });
                    addEditApplication(newObj);
                };
                var tmrDelay = null;
                SettingsHome.convertHtml = function (html) {
                    return $sce.trustAsHtml(html)
                };

                var addEditApplication = function (newObj) {
                    let isPurchaseOptionFtqSelected = false;
                    if (newObj.settings.purchaseOption && newObj.settings.purchaseOption.value == "scoreFromFreeTextQuestionnaire"
                        && newObj.settings.approvalType && newObj.settings.approvalType == "REMOVE_VIA_APP") {
                        isPurchaseOptionFtqSelected = true;
                    }
                    if (newObj.settings && newObj.settings.approvalType
                        && newObj.settings.approvalType == "REMOVE_VIA_APP" && newObj.settings.purchaseOption
                        && newObj.settings.purchaseOption.value == "scoreFromFreeTextQuestionnaire") {
                        SettingsHome.showRedemptionCode = false;
                    } else {
                        SettingsHome.showRedemptionCode = true;

                    }
                    var _data = {
                        redemptionPasscode: isPurchaseOptionFtqSelected ? "12345" : (newObj.settings.redemptionPasscode ? newObj.settings.redemptionPasscode : '12345'),
                        unqiueId: `${SettingsHome.context.appId}_${SettingsHome.context.instanceId}`,
                        externalAppId: SettingsHome.context.appId,
                        appId: SettingsHome.context.appId,
                        name: SettingsHome.context.pluginId,
                        pointsPerVisit: isPurchaseOptionFtqSelected ? 0 : ((typeof (newObj.settings.pointsPerVisit) != undefined && newObj.settings.pointsPerVisit != null) ? newObj.settings.pointsPerVisit : 1),
                        pointsPerDollar: isPurchaseOptionFtqSelected ? 0 : ((typeof (newObj.settings.pointsPerDollar) != undefined && newObj.settings.pointsPerDollar != null) ? newObj.settings.pointsPerDollar : 1),
                        totalLimit: isPurchaseOptionFtqSelected ? 50000 : ((typeof (newObj.settings.totalLimit) != undefined && newObj.settings.totalLimit != null) ? newObj.settings.totalLimit : 5000),
                        dailyLimit: isPurchaseOptionFtqSelected ? 10000 : ((typeof (newObj.settings.dailyLimit) != undefined && newObj.settings.dailyLimit != null) ? newObj.settings.dailyLimit : 1000),
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
                            if (err && err.code == 2000) {
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
                        if (newObj.settings.purchaseOption && newObj.settings.purchaseOption.value === "scoreFromFreeTextQuestionnaire"
                            && newObj.settings.approvalType && newObj.settings.approvalType === "REMOVE_VIA_APP") {
                            newObj.settings.redemptionPasscode = "12345"
                            newObj.settings.pointsPerVisit = 0
                            newObj.settings.pointsPerDollar = 0
                            newObj.settings.totalLimit = 50000
                            newObj.settings.dailyLimit = 10000
                        }
                        if (newObj.settings.purchaseOption && newObj.settings.purchaseOption.value !== "scoreFromFreeTextQuestionnaire"){
                            SettingsHome.data.settings.enableGetMorePointsButton = true;
                        }

                        if (newObj.settings.redemptionPasscode && newObj.settings.redemptionPasscode.length != 5) {
                            SettingsHome.redemptionCodeError = true
                        } else {
                            SettingsHome.redemptionCodeError = false

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
                    SettingsHome.newSymbol = {};
                    SettingsHome.saveData(SettingsHome.newCurrency, TAG_NAMES.NEW_CURRENCY);
                };

                init();


            }]);
})(window.angular);


