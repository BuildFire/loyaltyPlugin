'use strict';

(function (angular) {
  angular
    .module('loyaltyPluginContent')
    .controller('RemoveLoyaltyPopupCtrl', ['$scope', '$modalInstance', 'loyaltyPluginData',
      function ($scope, $modalInstance, loyaltyPluginData) {
        var RemoveLoyaltyPopup = this;
        if (loyaltyPluginData) {
          RemoveLoyaltyPopup.loyaltyPluginData = loyaltyPluginData;
        }
        RemoveLoyaltyPopup.ok = function () {
          $modalInstance.close('yes');
        };
        RemoveLoyaltyPopup.cancel = function () {
          $modalInstance.dismiss('No');
        };
      }])
})(window.angular);
