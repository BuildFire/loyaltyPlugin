'use strict';

(function (angular) {
    angular
        .module('loyaltyPluginTests')
        .controller('TestsHomeCtrl', ['$scope', 'LoyaltyAPI', 'Transactions',
            function ($scope, LoyaltyAPI, Transactions) {
                var TestsHome = this;
                TestsHome.logs = [];
                TestsHome.test = "asd";

                buildfire.auth.getCurrentUser(function (err, user) {
                    if (user) {
                      TestsHome.currentLoggedInUser = user;
                      $scope.$digest();
                    }
                });
                buildfire.getContext(function (err, context) {
                    if(!err) {
                        TestsHome.context = context;
                    } else console.error(err);
                });
                
                TestsHome.runTests = function() {
                    setTimeout(buyPoints, 1000);
                    setTimeout(buyProducts, 2000);
                    setTimeout(redeemRewards, 3000);
                }
                function validatePasscode() {
                    TestsHome.logs.push({message: "Validating Passcode"});
                    function success() {
                        TestsHome.logs.push({message: "Validated Passcode!", type: "success"});
                    }
                    function error(err) {
                        TestsHome.logs.push({message: JSON.stringify(err), type: "danger"});
                    }
                    LoyaltyAPI.validatePasscode(TestsHome.currentLoggedInUser._cpUser.userToken, TestsHome.context.instanceId, '12345').then(success, error);
                }

                function buyPoints() {
                    TestsHome.logs.push({message: "Adding Loyalty Points"});
                    function success() {
                        TestsHome.logs.push({message: "Added Loyalty Points!", type: "success"});
                        TestsHome.logs.push({message: "Creating transaction..."});
                        Transactions.buyPoints(100, 100, 100, 2, TestsHome.currentLoggedInUser).then(function() {
                            TestsHome.logs.push({message: "Transaction created!", type: "success"});
                        }, function() {
                            TestsHome.logs.push({message: "Failed to create transaction!", type: "danger"});
                        }, );
                    }
                    function error(err) {
                        TestsHome.logs.push({message: JSON.stringify(err), type: "danger"});
                    }
                    LoyaltyAPI.addLoyaltyPoints(
                        TestsHome.currentLoggedInUser._id, 
                        TestsHome.currentLoggedInUser.userToken, 
                        TestsHome.context.instanceId, '12345', 100).then(success, error);
                }
                
                function buyProducts() {
                    TestsHome.logs.push({ message: "Buying some items..." });
                    const items = [{
                        id: "123",
                        name: "Test item 1",
                        quantity: 2,
                        pointsPerItem: 10,
                    }, 
                    {
                        id: "1233",
                        name: "Test item 2",
                        quantity: 3,
                        pointsPerItem: 15,
                    }];
                    let totalPointsAmount = 0;
                    items.forEach(function(item) {
                        totalPointsAmount += item.quantity * item.pointsPerProduct
                    });
                    function success() {
                        TestsHome.logs.push({message: "Points added for products bought!", type: "success"});
                        TestsHome.logs.push({ message: "Creating transactions" });
                        Transactions.buyProducts(items, 120, 2, TestsHome.currentLoggedInUser);
                        TestsHome.logs.push({message: "Transactions created", type: "success"});
                    }
                    function error(err) {
                        TestsHome.logs.push({message: JSON.stringify(err), type: "danger"});
                    }
                    LoyaltyAPI.addLoyaltyPoints(
                        TestsHome.currentLoggedInUser._id, 
                        TestsHome.currentLoggedInUser.userToken, 
                        TestsHome.context.instanceId, '12345', totalPointsAmount).then(success, error);
                }

                function redeemRewards() {
                    const item = {
                        title: "Reward Title",
                        pointsToRedeem: "100",
                        description: "Reward description",
                        pointsPerItem: 20,
                        appId: TestsHome.context.appId,
                        loyaltyUnqiueId: TestsHome.context.instanceId,
                        userToken: TestsHome.currentLoggedInUser && TestsHome.currentLoggedInUser._cpUser.userToken,
                        auth: TestsHome.currentLoggedInUser && TestsHome.currentLoggedInUser._cpUser.auth,
                    };
                    TestsHome.logs.push({message: "Redeemeing reward"});
                    function success(reward) {
                        LoyaltyAPI.redeemPoints(TestsHome.currentLoggedInUser._id, TestsHome.currentLoggedInUser.userToken, TestsHome.context.instanceId, reward._id)
                        .then(function () {
                            TestsHome.logs.push({message: "Reward Redeemed!", type: "success"});
                        }, function (err) {
                            TestsHome.logs.push({message: JSON.stringify(err), type: "danger"});
                        });
                    }
                    function error() {
                        console.error("error");
                    }
                    LoyaltyAPI.getRewards(TestsHome.context.instanceId).then(function (rewards) {
                        if(rewards.length === 0) {
                            LoyaltyAPI.addReward(item).then(success, error);
                        } else {
                            success(rewards[0]);
                        }
                    }, function (error) {
                        console.error(error);
                    })
                }
                
    }]);
})(window.angular);
