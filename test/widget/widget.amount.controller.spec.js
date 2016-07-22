describe('Unit : loyaltyPluginWidget Plugin widget.amount.controller.js', function () {
    var WidgetHome, scope, $rootScope, $controller, Buildfire, TAG_NAMES, STATUS_CODE, LAYOUTS, STATUS_MESSAGES, CONTENT_TYPE, q, LoyaltyAPI;
    beforeEach(module('loyaltyPluginWidget'));
    var editor;


    beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _TAG_NAMES_, _STATUS_CODE_, _LAYOUTS_, _STATUS_MESSAGES_, _LoyaltyAPI_) {
        $rootScope = _$rootScope_;
        q = _$q_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        TAG_NAMES = _TAG_NAMES_;
        STATUS_CODE = _STATUS_CODE_;
        STATUS_MESSAGES = _STATUS_MESSAGES_;
        LAYOUTS = _LAYOUTS_;
        LoyaltyAPI = _LoyaltyAPI_;
    }));

    beforeEach(function () {
        WidgetAmount = $controller('WidgetAmountCtrl', {
            $scope: scope,
            $q: q,
            Buildfire: Buildfire,
            TAG_NAMES: TAG_NAMES,
            STATUS_CODE: STATUS_CODE,
            CONTENT_TYPE: CONTENT_TYPE,
            LAYOUTS: LAYOUTS
        });
    });
    xdescribe('call the inner controller methods', function () {
        it('should invoke when get  WidgetAmount.safeHtml called with html', function () {
            var html = "<p>Hi</p>";
            WidgetAmount.safeHtml(html);
        });

        it('should invoke when get  WidgetAmount.onUpdateCallback  called', function () {
            var event = {
                tag:"hi"
            }
            WidgetAmount.onUpdateCallback (event);
        });

        it('should invoke when get  WidgetAmount.preventClickBehavior  called', function () {
            var event = {
                tag:"hi",
                stopPropagation: function(){}
            }
            WidgetAmount.preventClickBehavior (event);
        });

        it('should invoke when get WidgetAmount.confirmCode called', function () {
                    WidgetAmount.confirmCode ();

        });
    });
});
