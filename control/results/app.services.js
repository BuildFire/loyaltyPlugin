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
        get: function(skip = 0, datesort = -1, dateFrom = undefined, dateTo = undefined, title = "") {
          var deferred = $q.defer();
         
          var filter = {}
          if(dateFrom && dateTo){
            filter =  {'createdAt': {"$gte": dateFrom, "$lte": dateTo}}
          } else if(dateTo){
            filter =  {'createdAt': {"$lte": dateTo}}
          } else if(dateFrom){
            filter =  {'createdAt': {"$gte": dateFrom}}
          }
          if(title != ""){
            filter.$or = [
              { "item.title": { $regex: "test", $options: 'i' } },
            ];
          }
         
          Buildfire.publicData.search({
            "filter": filter,
            "skip": skip,
            "limit": 50,
            "sort": { '_buildfire.index.date1': datesort }
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