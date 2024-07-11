'use strict';

(function (angular, buildfire) {
  angular.module('loyaltyPluginContent')
    .provider('Buildfire', [function () {
      var Buildfire = this;
      Buildfire.$get = function () {
        return buildfire
      };
      return Buildfire;
    }])
    .factory('LoyaltyAPI', ['$q', 'STATUS_CODE', 'STATUS_MESSAGES', 'SERVER', '$http',
      function ($q, STATUS_CODE, STATUS_MESSAGES, SERVER, $http) {
        var addEditApplication = function (app) {
          var deferred = $q.defer();
          if (!app) {
            deferred.reject(new Error('Undefined app data'));
          }
          $http.post(SERVER.URL + '/api/loyaltyApp', app).success(function (response) {
            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var getApplication = function (id) {
          var deferred = $q.defer();
          if (!id) {
            deferred.reject(new Error('Undefined app id'));
          }
          $http.get(SERVER.URL + '/api/loyaltyApp/' + id).success(function (response) {

            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          }).error(function (error) {
            deferred.reject(error);
          });
          return deferred.promise;
        };

        var addReward = function (data) {
          var deferred = $q.defer();
          if (!data) {
            deferred.reject(new Error('Undefined reward data'));
          }
          $http.post(SERVER.URL + '/api/loyaltyRewards', data).success(function (response) {
            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var getRewards = function (id) {
          var deferred = $q.defer();
          if (!id) {
            deferred.reject(new Error('Undefined app id'));
          }
          $http.get(SERVER.URL + '/api/loyaltyRewards/' + id).success(function (response) {
            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var updateReward = function (data) {
          var deferred = $q.defer();
          if (!data._id) {
            deferred.reject(new Error('Undefined reward id'));
          }
          $http.post(SERVER.URL + '/api/loyaltyRewards', data).success(function (response) {
            if (response.statusCode == 200)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var removeReward = function (id, data) {
          var deferred = $q.defer();
          if (!id) {
            deferred.reject(new Error('Undefined reward id'));
          }
          $http.delete(SERVER.URL + '/api/loyaltyRewards/' + id + "?appId=" + data.appId + "&userToken=" + data.userToken + "&auth=" + encodeURIComponent(data.auth)).success(function (response, status) {
            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        var sortRewards = function (data) {
          var deferred = $q.defer();
          if (!data.appId) {
            deferred.reject(new Error('Undefined app Id'));
          }
          $http.post(SERVER.URL + '/api/loyaltyRewardsSort', data).success(function (response) {
            if (response)
              deferred.resolve(response);
            else
              deferred.resolve(null);
          })
            .error(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        };

        return {
          addEditApplication: addEditApplication,
          getApplication: getApplication,
          addReward: addReward,
          getRewards: getRewards,
          updateReward: updateReward,
          removeReward: removeReward,
          sortRewards: sortRewards
        };
      }])
    .factory('RewardCache', [function () {
      var reward = {};

      return {
        setReward: function (data) {
          reward = data;
        },
        getReward: function () {
          return reward;
        }
      };
    }])
    .factory('Context', ['$q', function ($q) {
      return {
        getContext: function () {
          var deferred = $q.defer();
          buildfire.getContext(function (err, context) {
            if (err)
              deferred.resolve(null);
            else deferred.resolve(context);
          });
          return deferred.promise;
        }
      };
    }]).factory('StateSeeder', ['Context', 'LoyaltyAPI', '$rootScope', 'Buildfire', '$timeout' ,function(Context, LoyaltyAPI, $rootScope, Buildfire, $timeout) {
      let itemsList;
      let orderedItems = [];
      let currentUser;
      let currentContext;
      let stateSeederInstance;
      let generateJSONTemplate = {
          items: [
            {
              title: "",
              pointsToRedeem: 0,
              description: "",
              listImage: "",
            },
          ],
        };
        let importJSONTemplate = {
          items: [
            {
              title: "",
              pointsToRedeem: 0,
              pointsPerItem: 0,
              description: "",
              listImage: "",
            },
          ],
        };
      let handleAIReq = function(isImport, err, data) {
        if (
          err ||
          !data ||
          typeof data !== "object" ||
          !Object.keys(data).length || !data.data || !data.data.items || !data.data.items.length
        ) {
          return buildfire.dialog.toast({
            message: "Bad AI request, please try changing your request.",
            type: "danger",
          });
        }
        let initPromises = [
          new Promise((resolve, reject) => {
            getCurrentUser().then((user) => {
              currentUser = user;
              resolve();
          }).catch(err => reject(err))
          }),
          new Promise((resolve, reject) => {
            Context.getContext().then(context => {
              currentContext = context;
              resolve();
            }).catch(err => reject(err))
          })
        ]
        Promise.all(initPromises).then(() => {
          itemsList = data.data.items;
          //Check image URLs
          let items = itemsList.map((item, i) => {
            return elimanateNotFoundImages(item.listImage).then(res => {
              if (res.isValid) {
                item.listImage = res.newURL;
                item.order = i;
                orderedItems.push(item);
                return item;
              } else {
                throw new Error('image URL not valid');
              }
            });
          });

          Promise.allSettled(items).then(results => {
            itemsList = [];
            results.forEach(res => {
              if(res.status == 'fulfilled') {
                const item = res.value;
                if (item) {
                  itemsList.push(item);
                }
              }
            })
            if (!itemsList.length) {
              stateSeederInstance?.requestResult?.complete();
              return buildfire.dialog.toast({
                message: isImport ? "Each row must have a valid image URL." : "Bad AI request, please try changing your request.",
                type: "danger",
              });
            }

            // reset old data
            deleteAll().then(() => {
              // save new data
              let promises = itemsList.map((item, i) => {
                return new Promise((resolve, reject) => {
                  itemsList[i] = _applyDefaults(item);
                  LoyaltyAPI.addReward(itemsList[i]).then(result => {
                    console.info('Saved data result: ', result);
                    itemsList[i].deepLinkUrl = Buildfire.deeplink.createLink({id: result._id});
                    itemsList[i] = Object.assign(itemsList[i], result);
                    resolve();
                  })
                  .catch(err => {
                    console.error('Error while saving data : ', err);
                    resolve('Error while saving data : ', err);
                  })
                })
              })
              Promise.allSettled(promises).then(res => {
                if (isImport) {
                  let sortedItems = orderedItems.sort((a,b) => a.order - b.order);
                  let sortedIds =[];
                  LoyaltyAPI.getRewards(`${currentContext.appId}_${currentContext.instanceId}`).then(results => {
                    sortedItems.forEach(item => {
                      if (results) {
                        results.forEach(result => {
                          if (item.title == result.title && item.listImage == result.listImage ) {
                           sortedIds.push(result._id);
                          }
                        })
                     }
                    })
                    results.forEach(result => {
                      if (!sortedIds.includes(result._id))
                      sortedIds.push(result._id);
                    })
                    const data = {
                      appId: currentContext.appId,
                      loyaltyUnqiueId: `${currentContext.appId}_${currentContext.instanceId}`,
                      userToken: currentUser && currentUser.userToken,
                      auth: currentUser && currentUser.auth,
                      loyaltyRewardIds: sortedIds
                    }
                    LoyaltyAPI.sortRewards(data).finally(() => {
                      $timeout(() => {
                        sortedItems = [];
                        orderedItems = [];
                        $rootScope.reloadRewards = true;
                        buildfire.messaging.sendMessageToWidget({
                          type: 'refresh'
                        });
                        stateSeederInstance?.requestResult?.complete();
                      })
                    });
                  });
                } else {
                  $timeout(() => {
                  $rootScope.reloadRewards = true;
                  orderedItems = [];
                  buildfire.messaging.sendMessageToWidget({
                    type: 'refresh'
                  });
                  stateSeederInstance?.requestResult?.complete();
                })
                }
              })
            }).catch(err => console.warn('old data delete error', err));
          })
        }).catch(err => {
          console.error(err);
          stateSeederInstance?.requestResult?.complete();
        })
      }

    // UTILITIES
    let _applyDefaults = function(item) {
        if (item.title) {
          const points = checkPoints(item.pointsToRedeem, item.pointsPerItem);
          return {
            title: item.title,
            pointsToRedeem: points.pointsToRedeem,
            description: item.description || "",
            listImage: item.listImage || "",
            pointsPerItem: points.pointsPerItem,
            appId: currentContext.appId,
            loyaltyUnqiueId: `${currentContext.appId}_${currentContext.instanceId}`,
            userToken: currentUser && currentUser.userToken,
            auth: currentUser && currentUser.auth,
          }
        }
        return null
      }

      let checkPoints = function(pointsToRedeem, pointsPerItem) {
        let points = {
          pointsToRedeem: 0,
          pointsPerItem: 0,
        };
        if (pointsToRedeem && pointsToRedeem > 0) {
          points.pointsToRedeem = pointsToRedeem;
        } else {
          points.pointsToRedeem = 100;
        }

        if (pointsPerItem && pointsPerItem > 0) {
          points.pointsPerItem = pointsPerItem;
        } else {
          points.pointsPerItem = Math.ceil(points.pointsToRedeem * 0.1);
        }
        return points;
      }

      let elimanateNotFoundImages = function(url) {
        return new Promise((resolve) => {
          if (url.includes("http")) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onerror = (error) => {
              console.warn('Provided URL is not a valid image', error);
              resolve({isValid: false, newURL: null});
            };
            xhr.onload = () => {
              if (xhr.responseURL.includes('source-404') || xhr.status == 404) {
                resolve({isValid: false, newURL: null});
              } else {
                resolve({isValid: true, newURL: xhr.responseURL});
              }
            };
            xhr.send();
          } else {
            resolve({isValid: false, newURL: null});
          }
        });
      };

      let deleteAll = function() {
        const data = {
          userToken: currentUser.userToken,
          auth: currentUser.auth,
          appId: currentContext.appId
        };
        return new Promise(resolve => {
          if (stateSeederInstance.requestResult.resetData){
            LoyaltyAPI.getRewards(`${currentContext.appId}_${currentContext.instanceId}`).then(items => {
              const promises = items.map((item) => deleteItem(item._id, data));
              resolve(Promise.all(promises));
            }).catch(err => console.warn('old data get error', err));
          }
          else {
            resolve();
          }
        })
      }

      let deleteItem = function(itemId, data) {
        return new Promise((resolve, reject) => {
          LoyaltyAPI.removeReward(itemId, data).then(res => {
          Deeplink.deleteById(itemId);
          resolve(res);
          }).catch(err => {
            if (err) reject(err);
          })
        });
      }

      let getCurrentUser = function() {
        return new Promise(resolve => {
          buildfire.auth.getCurrentUser(function (err, user) {
            if (user && user._cpUser) {
              resolve(user._cpUser);
            }
          });
        })
      }

      return {
      initStateSeeder: function() {
  stateSeederInstance = new buildfire.components.aiStateSeeder({
    generateOptions: {
      userMessage: `Generate a sample of redeemable items for a new [business-type].`,
      maxRecords: 5,
      systemMessage:
      'listImage URL related to the title or the list type. Use https://app.buildfire.com/api/stockImages/?topic={topic}&imageType=medium, A maximum of 2 comma-separated topics can be used for each URL. cost to redeem which is a number greater than zero and less than 100, return description as HTML.',
      jsonTemplate: generateJSONTemplate,
      callback: handleAIReq.bind(this, false),
      hintText: 'Replace values between brackets to match your requirements.',
    },
    importOptions: {
      jsonTemplate: importJSONTemplate,
      sampleCSV: "Hotel Voucher, 50, 10, Redeem this voucher for a one-night stay at a luxurious hotel of your choice, https://app.buildfire.com/api/stockImages/?topic=hotel&imageType=medium\nFlight Upgrade, 30, 15, Upgrade your economy class ticket to business class, https://app.buildfire.com/api/stockImages/?topic=flight&imageType=medium\nCity Tour, 20, 5, Explore the city with a guided tour that covers all the major attractions and landmarks, https://app.buildfire.com/api/stockImages/?topic=city&imageType=medium\nAdventure Activity, 80, 30, Embark on an adrenaline-pumping adventure activity such as bungee jumping or skydiving, https://app.buildfire.com/api/stockImages/?topic=adventure&imageType=medium",
      maxRecords: 15,
      hintText: 'Each row should start with a loyalty item title, cost to redeem, points earned, description, and image URL.',
      systemMessage: ``,
      callback: handleAIReq.bind(this, true),
    },
  }).smartShowEmptyState();
},
      }
  }])
})(window.angular, window.buildfire);
