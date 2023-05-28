'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginResults')
    .controller('ResultsHomeCtrl', ['$scope', '$rootScope', 'Buildfire', 'Transactions', '$location', '$filter', 'LoyaltyAPI', 'context',
      function ($scope, $rootScope, Buildfire, Transactions, $location, $filter, LoyaltyAPI, context) {
        var ResultsHome = this;
        ResultsHome.dateSort = -1;
        ResultsHome.dateSearch = {
          from: undefined,
          to: undefined,
        };
        ResultsHome.title = ""
        ResultsHome.transactions = [];
        ResultsHome.typesMapping = {
          earnPoints: 'Earn Points',
          redeemReward: 'Redeem Reward',
          importPoints: 'Import points'
        }

        ResultsHome.goToDetails = function(result) {
          $rootScope.result = result;
          $location.path('/details');
        }

        ResultsHome.sortData = function() {
          $scope.skip = 0;
          if(ResultsHome.dateSort == -1){
            ResultsHome.dateSort = 1;
          } else {
            ResultsHome.dateSort = -1;
          }
          init();
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

        ResultsHome.DownloadTemplateCsv = function() {
          ResultsHome.exporting = true;
          function generateCsv() {
            let csvContent = '';
            csvContent += "Email,Points \r\n"
            var blob = new Blob([csvContent],{type: 'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "Template.csv");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            ResultsHome.exporting = false;
          }
          generateCsv();
        }

        ResultsHome.importCsv = function() {
          ResultsHome.exporting = true;

          function uploadFile() {
            LoyaltyAPI.getApplication(context.instanceId).then(loyaltyApp => {
              ResultsHome.getCurrentUser().then(user => {
                if (user && Object.keys(user).length && loyaltyApp && Object.keys(loyaltyApp).length) {
                  ResultsHome.currentUser = user
                  ResultsHome.application = loyaltyApp;
                  buildfire.services.publicFiles.showDialog(
                    { filter: ["text/csv"], allowMultipleFilesUpload: false },
                    (onProgress) => {
                      // console.log("onProgress" + JSON.stringify(onProgress));
                    },
                    (onComplete) => {
                      // console.log("onComplete" + JSON.stringify(onComplete));
                    },
                    (err, files) => {
                      if (err) {
                        ResultsHome.exporting = false;
                        buildfire.dialog.toast({
                          message: "Import failed",
                          type: "danger"
                        });
                        return console.error(err);
                      }

                      if (files[0]) {
                        // console.log("Files", files[0]);
                        processCSVFile(files[0]);
                      }
                    }
                  );
                } else {
                  ResultsHome.exporting = false;
                  buildfire.dialog.toast({
                    message: "Import failed",
                    type: "danger"
                  });
                }
              })
            });
          };

          function processCSVFile(file) {
            // Fetch the file content using the provided URL
            fetch(file.url)
              .then((response) => response.text())
              .then((csvData) => {
                // console.log("check data", csvData);
                ParseCsv(csvData, (err, res) => {
                  if (err) {
                    ResultsHome.exporting = false;
                    buildfire.dialog.toast({
                      message: "Import failed",
                      type: "danger"
                    });
                    return console.error(err);
                  }
                  buildfire.dialog.show(
                    {
                      title: "Import users",
                      message:
                        "Please wait while importing, it may take a while. Click Continue to proceed.",
                      isMessageHTML: false,
                      showCancelButton: true,
                      actionButtons: [
                        {
                          text: "Continue",
                          type: "primary",
                          action: () => {
                            addAllUsersPoints(res);
                          },
                        },
                      ],
                    },
                    (err, actionButton) => {
                      if (err) {
                        ResultsHome.exporting = false;
                        buildfire.dialog.toast({
                          message: "Import failed",
                          type: "danger"
                        });
                        console.error(err);
                      }
                    }
                  );
                })
              })
              .catch((error) => {
                ResultsHome.exporting = false;
                buildfire.dialog.toast({
                  message: "Import failed",
                  type: "danger"
                });
                console.error("Error fetching file:", error);
              });
          };

          function reloadPage() {
            ResultsHome.noMore = false;
            $scope.skip = 0;
            init();
          }

          function addAllUsersPoints(data) {
            function searchForUsers() {
              // Search for all users
              return ResultsHome.searchUsers({emails: data.emails})
                .then((searchResult) => {
                  if (searchResult && searchResult.length > 0) {
                    // Update each record
                    const updatePromises = data.emails.map((email, idx) => {return addUserPointsHelper(email, searchResult, data, idx)});

                    const filteredUpdatePromises = updatePromises.filter(e => e != null);
                    // Wait for all updates to complete
                    return Promise.all(filteredUpdatePromises)
                      .then(() => {
                        // Reload page to get new imported points transactions
                        reloadPage();
                        return Promise.resolve();
                      });
                  } 
                  else {
                    return Promise.resolve();
                  }
                })
                .catch((error) => {
                  console.error(`Error searching for records: ${error.message}`);
                  return Promise.reject(error);
                });
            }

            return searchForUsers()
              .then(() => {
                // console.log("All records updated successfully");
                ResultsHome.exporting = false;
                buildfire.dialog.toast({
                  message: "Import success",
                  type: "success"
                });
              })
              .catch(err => {
                console.error(err);
                ResultsHome.exporting = false;
                buildfire.dialog.toast({
                  message: "Import failed",
                  type: "danger"
                });
              });
          }

          const addUserPoint = ({ user, points }) => {
            return new Promise((resolve, reject) => {
              LoyaltyAPI.addLoyaltyPoints(user.userId, null, ResultsHome.application.unqiueId, ResultsHome.application.redemptionPasscode, null, points).then(result => {
                // add imported points transaction
                Transactions.requestApprovedImportPoints(points, ResultsHome.currentUser, 'IMPORTED POINTS', {_id: user.userId, email: user.email, userId: user.userId, displayName: user.displayName}).then(transaction => {
                  resolve(result);
                })
              }).catch(err => {
                if(err.code == 2107 && err.message == 'Invalid userId') {
                  resolve({});
                } else {
                  reject(err);
                }
              })
            })
          }

          function addUserPointsHelper(email, users, data, idx) {
            let user = users.find(user => user.email == email);
            let points = user ? data.points[idx] : null;

            if (!user || !points) {
              return null;
            }
            return addUserPoint({ user, points });
          }

          function ParseCsv(csvData, callback) {
            try {
              // Split the CSV data into rows
              const rows = csvData.split("\n");

              // Extract the headers from the first row
              const headers = rows[0].replace("\r", "").split(",");

              // Find the indices of the "email" and "points" columns
              const emailIndex = headers.indexOf("Email");
              const pointsIndex = headers.indexOf("Points");

              // Initialize arrays for storing emails and points
              const emails = [];
              const points = [];

              // Iterate over the remaining rows and extract the email and points values
              for (let i = 1; i < rows.length; i++) {
                const row = rows[i].replace("\r", "").split(",");

                // Extract the email and points values based on the column indices
                const email = row[emailIndex];
                const point = !isNaN(parseInt(row[pointsIndex])) ? parseInt(row[pointsIndex]) : 0;

                // Push the email and points values to the respective arrays
                if (point && email) {
                  emails.push(email);
                  points.push(point);
                }
              }

              // console.log("Emails:", emails);
              // console.log("Points:", points);
              return callback(null, {emails, points})
            } catch (error) {
              return callback(error)
            }
          }
            uploadFile();
        }

        ResultsHome.searchUsers = function ({ emails }) {
          let _emails = [...emails];
          let allUsers = [];
          return new Promise((resolve, reject) => {
            function _fetchUsers(users, skip) {
              const params = {
                emails: users,
                limit: 20,
                skip
              }
              buildfire.auth.searchUsers(
                params, (err, result) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  allUsers.push(...result);
                  if (_emails.length > 0) {
                    _fetchUsers(_emails.splice(0, 20), skip + 20);
                  } else {
                    resolve(allUsers);
                  }

                }
              );
            }
            if (_emails.length > 0) {
              _fetchUsers(_emails.splice(0, 20), 0);
            } else {
              resolve([]);
            }
          });
        }

        ResultsHome.getCurrentUser = function () {
          return new Promise((resolve, reject) => {
            buildfire.auth.getCurrentUser((err, user) => {
              if (err) reject(err);
              if(user) {
                resolve(user);
              } else {
                resolve(null);
              }
            });
          });
        }

        ResultsHome.openExportActions = function() {
          const locationDropdown = document.querySelector('#export-bulk-dropdown');
          toggleDropdown(locationDropdown);

          function toggleDropdown(dropdownElement, forceClose) {
            if (!dropdownElement) {
              return;
            }
            if (dropdownElement.classList.contains("open") || forceClose) {
              dropdownElement.classList.remove("open");
            } else {
              dropdownElement.classList.add("open");
            }
          };
        }

        ResultsHome.search = function(){
          init();
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
          }
          function error(err) {
            console.error(err);
          }
          Transactions.get($scope.skip).then(success, error);
        };

        function init(){
          ResultsHome.loading = true;
          function success(result) {
            var transactions = result.map(function (result){
              return result.data
            });
            // console.log(transactions)
            ResultsHome.transactions = transactions;
            $rootScope.transactions = transactions;
            if(transactions.length < 50) {
              ResultsHome.noMore = true;
            }
            ResultsHome.loading = false;
          }
          function error(err) {
            console.error(err);
            ResultsHome.loading = false;

          }
          Transactions.get(0, ResultsHome.dateSort, ResultsHome.dateSearch.from, ResultsHome.dateSearch.to, ResultsHome.title).then(success, error);
        }
        $scope.$watch(function () {
          return ResultsHome.dateSearch;
        }, init, true);

        if($rootScope.transactions && $rootScope.transactions.length > 0) {
          ResultsHome.transactions = $rootScope.transactions
        } else {
          init();
        }
      
      }]);
})(window.angular, window.buildfire);

