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
        },
        requestApprovedImportPoints: function (purchaseAmount, pointsEarned, currentPointsAmount, user, title, imageUrl, importedUserId) {
          var pluginTitle = buildfire.getContext().title;
          let date = new Date();
          const data = {
            createdBy: user,
            createdAt: date,
            approvedBy: user.email,
            approvedOn: date,
            type: TRANSACTION_TYPES.IMPORT_POINTS,
            purchaseAmount: null,
            pointsEarned: pointsEarned,
            status: STATUS.Approved,
            currentPointsAmount: null,
            item: {
              title: 'IMPORT POINTS',
              listImage: null
            },
            imageUrl: null,
            pluginTitle: pluginTitle,
            _buildfire :{ 
              index: {
                text: user.displayName ? user.displayName : user.email,
                date1: new Date(),
              }
            }
          }
          var deferred = $q.defer();
          Buildfire.publicData.insert(data, TAG_NAMES.TRANSACTIONS, function (err, result) {
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
    .factory('LoyaltyAPI', ['$q', 'STATUS_CODE', 'STATUS_MESSAGES', 'SERVER', '$http',
    function ($q, STATUS_CODE, STATUS_MESSAGES, SERVER, $http) {

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

      var addLoyaltyPoints = function (userId, userToken, loyaltyUnqiueId, passcode, amount, points) {
        var deferred = $q.defer();
        if (!loyaltyUnqiueId) {
          deferred.reject(new Error('Undefined application'));
        }
        $http.get(SERVER.URL + '/api/loyaltyUserAddPoint/' + userId + '?userToken=' + encodeURIComponent(userToken) + '&loyaltyUnqiueId=' + loyaltyUnqiueId + '&redemptionPasscode=' + passcode + '&purchaseAmount=' + amount + '&points=' + points)
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
        getApplication: getApplication,
        addLoyaltyPoints: addLoyaltyPoints
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