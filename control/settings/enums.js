'use strict';

(function (angular) {
    angular.module('loyaltyPluginSettings')
        .constant('TAG_NAMES', {
            LOYALTY_INFO: 'loyaltyInfo',
            NEW_CURRENCY: 'newCurrency'
        });
})(window.angular);