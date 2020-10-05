'use strict';

(function (angular, buildfire) {
  angular.module('loyaltyPluginResults')
    .provider('Buildfire', [function () {
      var Buildfire = this;
      Buildfire.$get = function () {
        return buildfire
      };
      return Buildfire;
    }])
  .factory("Transactions", ['Buildfire', '$q', 'TAG_NAMES', function (Buildfire, $q, TAG_NAMES) {
      return {
        get: function(skip = 0) {
          var deferred = $q.defer();
          Buildfire.publicData.search({
            "skip": skip,
            "limit": 50,
            "sort": { '_buildfire.index.date1': -1 }
          }, TAG_NAMES.TRANSACTIONS, function (err, result) {
            if (err) {
              return deferred.reject(err);
            } else if (result) {
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