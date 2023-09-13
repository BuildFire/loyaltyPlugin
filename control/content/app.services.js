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
    }]).factory('StateSeeder', ['Context', 'LoyaltyAPI', '$rootScope', 'Buildfire' ,function(Context, LoyaltyAPI, $rootScope, Buildfire) {
      let itemsList;
      let currentUser;
      let currentContext;
      let stateSeederInstance;
      let jsonTemplate = {
          items: [
            {
              title: "",
              pointsToRedeem: 0,
              description: "",
              listImage: "",
              pointsPerItem: 0
            },
          ],
        };
       let handleAIReq = function(err, data) {
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
    
          itemsList = data.data.items;
          //Check image URLs
          let items = itemsList.map(item => {
            return new Promise((resolve, reject) => {
              elimanateNotFoundImages(item.listImage).then(res => {
                if (res.isValid) {
                  item.listImage = res.newURL;
                  resolve(item);
                } else {
                  reject('image URL not valid');
                }
              })
            })
          })
    
          // Check image URLs
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
              stateSeederInstance.requestResult?.complete();
              return buildfire.dialog.toast({
                message: "Bad AI request, please try changing your request.",
                type: "danger",
              });
            }
            
            // reset old data
            deleteAll().then(() => {
              // save new data
              itemsList.forEach((item, i) => {
                item = _applyDefaults(item);
                LoyaltyAPI.addReward(item).then(result => {
                  console.info('Saved data result: ', result);
                  item.deepLinkUrl = Buildfire.deeplink.createLink({id: result._id});
                  item = Object.assign(item, result);
                }).catch(err => {
                  console.error('Error while saving data : ', err);
                }).finally(() => {
                  if (i == (itemsList.length - 1)) {
                    $rootScope.reloadRewards = true;
                    buildfire.messaging.sendMessageToWidget({
                      type: 'refresh'
                    });
                  }
                })
              })
            stateSeederInstance.requestResult?.complete();
            }).catch(err => console.warn('old data delete error', err));
          })
        }
    
        // UTILITIES
      let _applyDefaults = function(item) {
          if (item.title) {
            return {
              title: item.title,
              pointsToRedeem: item.pointsToRedeem || 10,
              description: item.description || "",
              listImage: item.listImage || "",
              pointsPerItem: item.pointsPerItem || 10,
              appId: currentContext.appId,
              loyaltyUnqiueId: currentContext.instanceId,
              userToken: currentUser && currentUser.userToken,
              auth: currentUser && currentUser.auth,
            }
          }
          return null
        }

        let elimanateNotFoundImages = function(url) {
          const optimisedURL = url.replace('1080x720', '100x100'); 
          return new Promise((resolve) => {
            if (url.includes("http")){
              const xhr = new XMLHttpRequest();
              xhr.open("GET", optimisedURL);
              xhr.onerror = (error) => {
                console.warn('provided URL is not a valid image', error);
                resolve({isValid: false, newURL: null});
              }
              xhr.onload = () => {
                if (xhr.responseURL.includes('source-404') || xhr.status == 404) {
                  return resolve({isValid: false ,newURL: null});
                } else {
                  return resolve({isValid: true, newURL: xhr.responseURL.replace('h=100', 'h=720').replace('w=100', 'w=1080') });
                }
              };
              xhr.send();
            } else resolve(false);
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
            LoyaltyAPI.getRewards(currentContext.instanceId).then(items => {
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

        let getUserAndContext = function() {
          getCurrentUser().then((user) => {
            currentUser = user;
            Context.getContext().then(context => {
              currentContext = context;
            })
          })
        }
      return {
          initStateSeeder: function() {
              getUserAndContext();
              stateSeederInstance = new buildfire.components.aiStateSeeder({
                  generateOptions: {
                  userMessage: `Generate a sample redeemable items for a new [business-type].`,
                  maxRecords: 5, 
                  systemMessage:
                  'listImage URL related to title and the list type use source.unsplash.com for image URL, URL should not have premium_photo or source.unsplash.com/random, cost to redeem which is a number greater than zero and less than 100, return description as HTML.',
                  jsonTemplate: jsonTemplate,
                  callback: handleAIReq.bind(this),
                  hintText: 'Replace values between brackets to match your requirements.',
                  },
                  importOptions: {
                  jsonTemplate: jsonTemplate,
                  sampleCSV: "Hotel Voucher, 50, Redeem this voucher for a one-night stay at a luxurious hotel of your choice. Experience top-notch service and enjoy a comfortable stay, 15, https://source.unsplash.com/featured/?hotel\nFlight Upgrade, 30, Upgrade your economy class ticket to business class and enjoy a more luxurious and comfortable flight experience, 10, https://source.unsplash.com/featured/?flight\nCity Tour, 20, Explore the city with a guided tour that covers all the major attractions and landmarks. Get to know the history and culture of the city, 5, https://source.unsplash.com/featured/?city\nAdventure Activity, 80, Embark on an adrenaline-pumping adventure activity such as bungee jumping, skydiving, or white-water rafting. Experience the thrill of a lifetime!, 55, https://source.unsplash.com/featured/?adventure",
                  maxRecords: 15,
                  hintText: 'Please enter values in the following order: Item title, Cost to redeem, Item description, Points earned, Image URL',
                  systemMessage: ``,
                  callback: handleAIReq.bind(this),
                  },
          }).smartShowEmptyState();
          },
      }
  }])
})(window.angular, window.buildfire);