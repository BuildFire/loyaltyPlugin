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
				ResultsHome.notFoundEmails=[];
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
            csvContent += "Email,Points to add\r\n"
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

				ResultsHome.DownloadNotFoundEmailsCsv = function() {
          ResultsHome.exporting = true;
          function generateCsv() {
            let csvContent = '';
            csvContent += "Emails not imported / users not found \r\n"
						if(ResultsHome.notFoundEmails.length > 0){

							ResultsHome.notFoundEmails.forEach((email)=>{
								csvContent += email;
								csvContent += "\r\n";
							})
							// csvContent += ResultsHome.notFoundEmails;
							var blob = new Blob([csvContent],{type: 'text/csv;charset=utf-8;'});
							var url = URL.createObjectURL(blob);
							var link = document.createElement("a");
							link.setAttribute("href", url);
							link.setAttribute("download", "Errors.csv");
							document.body.appendChild(link);
							link.click();
							link.parentNode.removeChild(link);
							ResultsHome.exporting = false;
						}
          }
          generateCsv();
        }

        ResultsHome.importCsv = function() {
          ResultsHome.exporting = true;

          function uploadFile() {
            LoyaltyAPI.getApplication(`${context.appId}_${context.instanceId}`).then(loyaltyApp => {
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
												ResultsHome.notFoundEmails=[];
												ResultsHome.updateWaitingPopup()
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
						ResultsHome.openExportActions()
						ResultsHome.openWaitingPopup(true)
            fetch(file.url)
              .then((response) => response.text())
              .then((csvData) => {
                ParseCsv(csvData, (err, res) => {
                  if (err) {
                    ResultsHome.exporting = false;
										ResultsHome.openWaitingPopup(false)
                    buildfire.dialog.toast({
                      message: "Import failed",
                      type: "danger"
                    });
                    return console.error(err);
                  }
									addAllUsersPoints(res);
                })
              })
              .catch((error) => {
                ResultsHome.exporting = false;
								ResultsHome.openWaitingPopup(false)
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
						ResultsHome.updateWaitingPopup()
            function searchForUsers() {
              // Search for all users
              return ResultsHome.searchUsers({emails: data.emails})
                .then((searchResult) => {
                  if (searchResult && searchResult.length > 0) {
                    // Update each record
                    const updatePromises = data.emails.map((email, idx) => {return addUserPointsHelper(email, searchResult, data, idx)});

                    const filteredUpdatePromises = updatePromises.filter(e => e != null);
                    // Wait for all updates to complete
											return new Promise((resolve, reject) => {
												let _filteredUpdatePromises = [...filteredUpdatePromises]
												function _addPoints(items) {
													Promise.all(items).then(()=>{
														if (_filteredUpdatePromises.length > 0) {
															ResultsHome.updateWaitingPopup(filteredUpdatePromises, _filteredUpdatePromises);
															_addPoints(_filteredUpdatePromises.splice(0, 20));
														} else {
															reloadPage();
															ResultsHome.openWaitingPopup(false)
															ResultsHome.DownloadNotFoundEmailsCsv();
															return Promise.resolve();
														}
													})
												}
												if (_filteredUpdatePromises.length > 0) {
													ResultsHome.updateWaitingPopup(filteredUpdatePromises, _filteredUpdatePromises);
													_addPoints(_filteredUpdatePromises.splice(0, 20));
												} else {
													reloadPage();
													ResultsHome.DownloadNotFoundEmailsCsv();
													ResultsHome.openWaitingPopup(false)
													return Promise.resolve();
												}
											});
                  }
                  else {
										ResultsHome.openWaitingPopup(false)
										ResultsHome.notFoundEmails=[...data.emails]
										ResultsHome.DownloadNotFoundEmailsCsv();
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
									ResultsHome.openWaitingPopup(false);
									buildfire.dialog.toast({
                    message: "The daily point limit has been exceeded; please update it in the settings tab.",
                    type: "danger"
                  });
                  reject(err);
                }
              })
            })
          }

          function addUserPointsHelper(email, users, data, idx) {
            let user = users.find(user => user.email == email);
            let points = user ? data.points[idx] : null;

            if (!user || !points) {
							ResultsHome.notFoundEmails.push(email);
              return null;
            }
            return addUserPoint({ user, points });
          }

          function ParseCsv(csvData, callback) {
            try {
              // Split the CSV data into rows
              const rows = csvData.split("\n");

              // Extract the headers from the first row
              const headers = rows[0].replaceAll("\r", "").replaceAll('"', '').replaceAll("'", '').replaceAll('\\',"").trim().split(",");
							headers.map((el)=>el.trim());
              // Find the indices of the "email" and "points" columns
              const emailIndex = headers.indexOf("Email");
              const pointsIndex = headers.indexOf("Points to add");

              // Initialize arrays for storing emails and points
              const emails = [];
              const points = [];

              // Iterate over the remaining rows and extract the email and points values
              for (let i = 1; i < rows.length; i++) {
                const row = rows[i].replaceAll("\r", "").replaceAll('"', '').replaceAll("'", '').replaceAll('\\',"").trim().split(",");

                // Extract the email and points values based on the column indices
                const email = row[emailIndex];
                const point = !isNaN(parseInt(row[pointsIndex])) ? parseInt(row[pointsIndex]) : 0;

                // Push the email and points values to the respective arrays
                if (point && email) {
                  emails.push(email);
                  points.push(point);
                }
              }

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
              }
              buildfire.auth.searchUsers(
                params, (err, result) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  allUsers.push(...result);
                  if (_emails.length > 0) {
                    _fetchUsers(_emails.splice(0, 20));
                  } else {
                    resolve(allUsers);
                  }

                }
              );
            }
            if (_emails.length > 0) {
              _fetchUsers(_emails.splice(0, 20));
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

				ResultsHome.openWaitingPopup = function(show) {
          const waitingPopup = document.querySelector('#importModal');
          openPopup(waitingPopup,show);

          function openPopup(waitingPopup, show) {
            if (!waitingPopup) {
              return;
            }
            if (show) {
              waitingPopup.classList.remove("hide");
              waitingPopup.classList.add("show");
            } else {
              waitingPopup.classList.add("hide");
							waitingPopup.classList.remove("show");

            }
          };
        }

				ResultsHome.updateWaitingPopup = function(a,b) {
          const waitingPopupText = document.querySelector('#modalMessage');
          updateText(waitingPopupText,a,b);

          function updateText(waitingPopupText, a,b) {
            if (!waitingPopupText) {
              return;
            }
            if (a && b) {
              waitingPopupText.innerHTML= `We are importing your data, please wait (${a.length - b.length}/${a.length})...`
            } else {
              waitingPopupText.innerHTML ='We are importing your data, please wait ...'

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

