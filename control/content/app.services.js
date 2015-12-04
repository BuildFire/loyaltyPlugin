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
        var addApplication = function (app) {
          var deferred = $q.defer();
          if (!app) {
            deferred.reject(new Error('Undefined app data'));
          }
          $http.post(SERVER.URL + '/api/loyaltyApp', {
            data: app
          }).success(function (response) {
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
          $http.post(SERVER.URL + '/api/loyaltyRewards', {data: data}).success(function (response) {
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
          $http.post(SERVER.URL + '/api/loyaltyRewards', {data: data}).success(function (response) {
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

        var removeReward = function (id) {
          var deferred = $q.defer();
          if (!id) {
            deferred.reject(new Error('Undefined reward id'));
          }
          $http.delete(SERVER.URL + '/api/loyaltyRewards/' + id).success(function (response) {
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

        var sortRewards = function (data) {
          var deferred = $q.defer();
          if (!data.appId) {
            deferred.reject(new Error('Undefined app Id'));
          }
          $http.post(SERVER.URL + '/api/loyaltyRewardsSort', {data: data}).success(function (response) {
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
          addReward: addReward,
          getRewards: getRewards,
          updateReward: updateReward,
          removeReward: removeReward,
          sortRewards : sortRewards
        };
      }])
})(window.angular, window.buildfire);