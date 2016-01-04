describe('Unit : loyaltyPlugin Plugin settings.home.controller.js', function () {
    var ContentHome, scope, $rootScope, $controller, Buildfire, ActionItems, TAG_NAMES, STATUS_CODE, STATUS_MESSAGES, q;
    beforeEach(module('loyaltyPluginSettings'));
    var editor;
    beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _TAG_NAMES_) {
        $rootScope = _$rootScope_;
        q = _$q_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        TAG_NAMES = _TAG_NAMES_;
        // Utils = __Utils__;
        Buildfire = {
            components: {
                carousel: {
                    editor: function (name) {
                        return {}
                    },
                    viewer: function (name) {
                        return {}
                    }
                }
            }
        };
        ActionItems = jasmine.createSpyObj('ActionItems', ['showDialog']);
        Utils = jasmine.createSpyObj('Utils', ['validLongLats']);
        Buildfire.components.carousel = jasmine.createSpyObj('Buildfire.components.carousel', ['editor', 'onAddItems']);

    }));

    beforeEach(function () {
        SettingsHome = $controller('SettingsCtrl', {
            $scope: scope,
            $q: q,
            Buildfire: Buildfire,
            TAG_NAMES: TAG_NAMES,
            ActionItems: ActionItems,
            Utils: Utils
        });


    });

    describe('Units: units should be Defined', function () {
        it('it should pass if ContentHome is defined', function () {
            expect(SettingsHome).not.toBeUndefined();
        });
    });

    describe('Units: test the method SettingsHome.changeCurrency', function () {

        it('it should pass if SettingsHome.changeCurrency is called', function () {
            var currency={name:"dollor",
            symbol:"#xyz"}
            SettingsHome.currency=[{
                name:"USD, AUD, NZD, CAD, Peso, Real, etc. ",
                symbol: '&#36;'
            },
                {
                    name:"Euro",
                    symbol: '&#128;'
                }];
            SettingsHome.data = {
                settings:""
            };
            SettingsHome.changeCurrency(currency);
            SettingsHome.convertHtml()
        });
        it('it should pass if SettingsHome.changeCurrency is called', function () {
            var currency={name:"dollor",
                symbol:"#xyz"}
            SettingsHome.currency=[{
                name:"USD, AUD, NZD, CAD, Peso, Real, etc. ",
                symbol: '&#36;'
            },
                {
                    name:"Euro",
                    symbol: '&#128;'
                }];
            SettingsHome.data = {
                settings:""
            };
             SettingsHome.changeCurrency(currency)
        });
    });

    describe('Units: test the method SettingsHome.convertHtml', function () {

        it('it should pass if SettingsHome.convertHtml is called', function () {
                var html='<div>HiTest</div>';
            SettingsHome.convertHtml(html);
        });
    });

    describe("Test the inner methods call", function() {


        it("Should pass if saveDataWithDelay called", function() {
            var tmrDelay= true, newObj = 'undefined';
            var x = function(a, b){
            console.log(";;;;;;;;;;;;>>>>>>>>>>>",a)
            }
                    buildfire.datastore.get(TAG_NAMES.LOYALTY_INFO,x)
            SettingsHome.saveDataWithDelay(newObj);
            SettingsHome.saveData(newObj,TAG_NAMES.LOYALTY_INFO)
            buildfire.datastore.save()
        });
    });
})
;