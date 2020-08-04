'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginResults')
    .controller('ResultsHomeCtrl', ['$scope', '$rootScope', 'Buildfire', 'Transactions', '$location', '$filter',
      function ($scope, $rootScope, Buildfire, Transactions, $location, $filter) {
        var ResultsHome = this;
        ResultsHome.transactions = [];
        ResultsHome.typesMapping = {
          earnPoints: 'Earn Points',
          redeemReward: 'Redeem Reward'
        }

        ResultsHome.goToDetails = function(result) {
          $rootScope.result = result;
          $location.path('/details');
        }

        ResultsHome.loading = false;
        ResultsHome.noMore = false;
        ResultsHome.exporting = false;
        $scope.skip = 0;

        ResultsHome.exportCsv = function() {
          ResultsHome.exporting = true;
          var typesMapping = {
            earnPoints: 'Earn Points',
            redeemReward: 'Redeem Reward'
          }
          function generateCsv() {
            let csvContent = '';
            csvContent += "User Name,Date,Type,Item Bought,Item Redeemed,Points Earned,Points Spent,Money Spent,Item Quantity,Points per Item,Plugin Name,User's Current Points \r\n"
            ResultsHome.transactions.forEach(function(item) {
              let line = "";
              line += item.createdBy ? item.createdBy.displayName ? item.createdBy.displayName + "," : item.createdBy.email + "," : ",";
              line += item.createdAt ? $filter('date')(item.createdAt, 'dd MMM yyyy HH:mm') + "," : ",";
              line += typesMapping[item.type] + ",";
              line += item.type === 'earnPoints' ? item.item ? item.item.title + "," : "," : ",";
              line += item.type === 'redeemReward' ? item.item ? item.item.title + ",": "," : ",";
              line += item.pointsEarned ? item.pointsEarned + "," : ",";
              line += item.pointsSpent ? item.pointsSpent + "," : ",";
              line += item.purchaseAmount ? item.purchaseAmount + "," : ",";
              line += item.item && item.item.quantity ? item.item.quantity + "," : ",";
              line += item.item && item.item.pointsPerItem ? item.item.pointsPerItem + "," : ",";
              line += item.pluginTitle ? item.pluginTitle + "," :  ",";
              line += item.currentPointsAmount ? item.currentPointsAmount + "," : ",";
              line += "\r\n";
              csvContent += line;
            });
            var blob = new Blob([csvContent],{type: 'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "Results.csv");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            ResultsHome.exporting = false;
          }

          function getThreads() {
            $scope.skip += 50;
            function success(result) {
              var transactions = result.map(function (result){
                return result.data
              });
              ResultsHome.transactions = [...ResultsHome.transactions, ...transactions];
              $rootScope.transactions = [...ResultsHome.transactions, ...transactions];;
              if(transactions.length < 50) {
                ResultsHome.noMore = true;
                generateCsv();
              } else {
                getThreads();
              }
              ResultsHome.loading = false;
            }
            function error(err) {
              console.error(err);
              ResultsHome.loading = false;
            }
            ResultsHome.loading = true;
            Transactions.get($scope.skip).then(success, error);
          }
          
          if(!ResultsHome.noMore) {
            getThreads();
          } else {
            generateCsv();
          }
        }

        $scope.getMoreTransactions = function () {
          $scope.skip += 50;
          function success(result) {
            var transactions = result.map(function (result){
              return result.data
            });
            ResultsHome.transactions = [...ResultsHome.transactions, ...transactions];
            $rootScope.transactions = [...ResultsHome.transactions, ...transactions];;
            if(transactions.length < 50) {
              ResultsHome.noMore = true;
            }
            ResultsHome.loading = false;
          }
          function error(err) {
            console.error(err);
            ResultsHome.loading = false;
          }
          ResultsHome.loading = true;
          Transactions.get($scope.skip).then(success, error);
        };

        function init(){
          function success(result) {
            var transactions = result.map(function (result){
              return result.data
            });
            ResultsHome.transactions = transactions;
            $rootScope.transactions = transactions;
            if(transactions.length < 50) {
              ResultsHome.noMore = true;
            }
          }
          function error(err) {
            console.error(err);
          }
          Transactions.get().then(success, error);
        }

        if($rootScope.transactions && $rootScope.transactions.length > 0) {
          ResultsHome.transactions = $rootScope.transactions
        } else {
          init();
        }
      
      }]);
})(window.angular, window.buildfire);

