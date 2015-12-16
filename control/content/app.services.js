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
          console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", app);
          var deferred = $q.defer();
          if (!app) {
            deferred.reject(new Error('Undefined app data'));
          }
          $http.post(SERVER.URL + '/api/loyaltyApp', app).success(function (response) {
            console.log("+++++++++++_+_________+_+_", response);
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
          $http.delete(SERVER.URL + '/api/loyaltyRewards/' + id + "?appId=b036ab75-9ddd-11e5-88d3-124798dea82d&userToken=" + data.userToken + "&auth=" + encodeURIComponent(data.auth)).success(function (response, status) {
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
    }])
})(window.angular, window.buildfire);