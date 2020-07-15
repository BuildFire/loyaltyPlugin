'use strict';

(function (angular, buildfire) {
  angular.module('loyaltyPluginTests')
    .provider('Buildfire', [function () {
      var Buildfire = this;
      Buildfire.$get = function () {
        return buildfire
      };
      return Buildfire;
    }])
    .factory('LoyaltyAPI', ['$q', 'STATUS_CODE', 'STATUS_MESSAGES', 'SERVER', '$http',
      function ($q, STATUS_CODE, STATUS_MESSAGES, SERVER, $http) {
        var getProxyServerUrl = function () {
          return SERVER.URL;
        };
        var addApplication = function (app) {
          var deferred = $q.defer();
          if (!app) {
            deferred.reject(new Error('Undefined app data'));
          }
          $http.post(getProxyServerUrl() + '/api/loyaltyApp', app).success(function (response) {
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

        var getApplication = function (id) {
          var deferred = $q.defer();
          if (!id) {
            deferred.reject(new Error('Undefined app id'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyApp/' + id).success(function (response) {
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
          $http.get(getProxyServerUrl() + '/api/loyaltyRewards/' + id).success(function (response) {
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

        var getLoyaltyPoints = function (userId, userToken, loyaltyUnqiueId) {
          var deferred = $q.defer();
          if (!userId) {
            deferred.reject(new Error('Undefined user Id'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyUser/' + userId + '?userToken=' + encodeURIComponent(userToken) + '&loyaltyUnqiueId=' + loyaltyUnqiueId).success(function (response) {
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

        var addLoyaltyPoints = function (userId, userToken, loyaltyUnqiueId, passcode, amount) {
          var deferred = $q.defer();
          if (!loyaltyUnqiueId) {
            deferred.reject(new Error('Undefined application'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyUserAddPoint/' + userId + '?userToken=' + encodeURIComponent(userToken) + '&loyaltyUnqiueId=' + loyaltyUnqiueId + '&redemptionPasscode=' + passcode + '&purchaseAmount=' + amount)
            .success(function (response) {
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

        var validatePasscode = function (userToken, loyaltyUnqiueId, passcode) {
          var deferred = $q.defer();
          if (!loyaltyUnqiueId) {
            deferred.reject(new Error('Undefined application'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyAppPassCode/' + loyaltyUnqiueId + '?userToken=' + encodeURIComponent(userToken) + '&redemptionPasscode=' + passcode)
            .success(function (response) {
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

        var redeemPoints = function (userId, userToken, loyaltyUnqiueId, rewardId) {
          var deferred = $q.defer();
          if (!userToken) {
            deferred.reject(new Error('Undefined user'));
          }
          $http.get(getProxyServerUrl() + '/api/loyaltyUserRedeem/' + userId + '?loyaltyUnqiueId=' + loyaltyUnqiueId + '&userToken=' + encodeURIComponent(userToken) + '&redeemId=' + rewardId)
            .success(function (response) {
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
          addApplication: addApplication,
          getApplication: getApplication,
          getRewards: getRewards,
          addReward: addReward,
          getLoyaltyPoints: getLoyaltyPoints,
          addLoyaltyPoints: addLoyaltyPoints,
          validatePasscode: validatePasscode,
          redeemPoints: redeemPoints
        };
      }])
    .factory("Transactions", ['Buildfire', '$q', 'TAG_NAMES', function (Buildfire, $q, TAG_NAMES ) {
      return {
        buyPoints: function (purchaseAmount, pointsEarned, currentPointsAmount, pointsPerPurchase, user) {
          const data = {
            createdBy: user,
            createdAt: new Date(),
            type: "earnPoints",
            purchaseAmount: purchaseAmount,
            pointsEarned: pointsEarned,
            currentPointsAmount: currentPointsAmount,
            pointsPerPurchase: pointsPerPurchase,
            _buildfire: {
              index: {
                date1: new Date(),
                text: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
                array1: [{ string1: "earnPoints" }]
              }
            }
          }
          var deferred = $q.defer();
          Buildfire.publicData.insert(data, TAG_NAMES.TRANSACTIONS, function (err, result) {
            if (err) {
              return deferred.reject(err);
            } else if (result) {
              buildfire.analytics.trackAction('points-earned', { pointsEarned : pointsEarned });
              return deferred.resolve(result);
            }
            else{
              return deferred.reject(new Error('Result Not Found'));
            }
          });
          return deferred.promise;
        },
        buyProducts: function (items, currentPointsAmount, pointsPerPurchase, user) {
          items.forEach(function(item) {
            const data = {
              createdBy: user,
              createdAt: new Date(),
              type: "earnPoints",
              itemTitle: item.name,
              itemId: item.id,
              itemQuantity: item.quantity,
              pointsPerProduct: item.pointsPerProduct,
              pointsPerPurchase: pointsPerPurchase,
              moneySpent: item.pointsPerProduct * item.quantity,
              currentPointsAmount: currentPointsAmount,
              _buildfire: {
                index: {
                  string1: item.name,
                  date1: new Date(),
                  text: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
                  array1: [{ string1: "earnPoints" }]
                }
              }
            }
            var deferred = $q.defer();
            Buildfire.publicData.insert(data, TAG_NAMES.TRANSACTIONS, function (err, result) {
              if (err) {
                return deferred.reject(err);
              } else if (result) {
                buildfire.analytics.trackAction('points-earned', { pointsEarned : item.pointsPerProduct * item.quantity });
                return deferred.resolve(result);
              }
              else{
                return deferred.reject(new Error('Result Not Found'));
              }
            });
          });
          return items;
        },
        redeemReward: function (item, pointsSpent, currentPointsAmount, user) {
          const data = {
            createdBy: user,
            createdAt: new Date(),
            type: "redeemReward",
            itemTitle: item.name,
            itemId: item.id,
            pointsSpent: pointsSpent,
            currentPointsAmount: currentPointsAmount,
            _buildfire: {
              index: {
                date1: new Date(),
                text: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
                array1: [{ string1: "redeemReward" }]
              }
            }
          }
          Buildfire.publicData.insert(data, TAG_NAMES.TRANSACTIONS, data, function (err, result) {
            if (err) {
              return deferred.reject(err);
            } else if (result) {
              buildfire.analytics.trackAction('reward-redeemed', { pointsSpent : point});
              return deferred.resolve(result);
            }
            else{
              return deferred.reject(new Error('Result Not Found'));
            }
          });
          return deferred.promise;
        }
      }
    }])
})(window.angular, window.buildfire);