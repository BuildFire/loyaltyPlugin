describe('Unit : loyaltyPluginDesign design.home.controller.js', function () {
    var $scope, DesignHome, $rootScope, q, $controller, DataStore, TAG_NAMES, STATUS_CODE, STATUS_MESSAGES, $compile;
    beforeEach(module('loyaltyPluginDesign', function ($provide) {
        $provide.service('Buildfire', function () {
            this.datastore = jasmine.createSpyObj('datastore', ['get', 'save']);

       });

    }));

    beforeEach(inject(function (_$rootScope_, _$q_, _$controller_, _DataStore_, _TAG_NAMES_, _STATUS_CODE_, _STATUS_MESSAGES_, _$compile_) {
        $rootScope = _$rootScope_;
        q = _$q_;
        $scope = $rootScope.$new();
        $controller = _$controller_;
        DataStore = _DataStore_;
        TAG_NAMES = _TAG_NAMES_;
        STATUS_CODE = _STATUS_CODE_;
        STATUS_MESSAGES = _STATUS_MESSAGES_;
        $compile= _$compile_;
    }));

    beforeEach(function () {
        inject(function ($injector, $q) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            DesignHome = $injector.get('$controller')('DesignHomeCtrl', {
                $scope: $scope,
                data: {
                    design: {
                        listLayout: "test",
                        backgroundImage: "test1"
                    }
                },
                Buildfire: {
                    imageLib: {
                        showDialog: function (options, callback) {
                            DesignHome._callback(null, {selectedFiles: ['test']});
                        }
                    },
                    components: {
                        images: {
                            thumbnail: function () {

                            }
                        }
                    },
                    datastore: {
                        get: function () { },
                        save: function () { }
                    }
                }

            });
            DataStore = jasmine.createSpyObj('DataStore', ['get', 'save']);
            q = $q;
        });
        DesignHome.data = {
            "content": {
                "carouselImages": [],
                "description": '<p>&nbsp;<br></p>',
                "storeName": ""
            },
            "design": {
                "sectionListLayout": "test1",
                "itemListLayout": "test2",
                "itemDetailsBgImage": ""
            }
        };
    });

    describe('Units: test the method DesignHome.changeListLayout', function () {
        var html = '<div id="background"></div>';
        var background = angular.element(document.body).append(html);

        it('it should pass if DesignHome.changeListLayout is called', function () {
            var layout1="test";
            var tmrDelay = 1;
            DesignHome.changeListLayout(layout1);
            DesignHome.data.design.itemListLayout = layout1;
        });
    });

    describe('Units: test the method DesignHome.itemListBackground.onChange', function () {
         it('it should pass if DesignHome.itemListBackground.onChange is called', function () {
            var url="test.com";
            DesignHome.itemListBackground.onChange(url);
             expect(DesignHome.data.design.itemListbackgroundImage).toEqual(url);
        });
    });

    describe('Units: test the method DesignHome.itemListBackground.onDelete', function () {
        it('it should pass if DesignHome.itemListBackground.onDelete is called', function () {
            var url="test.com";
            DesignHome.itemListBackground.onDelete(url);
            expect(DesignHome.data.design.itemListbackgroundImage).toEqual("");
        });
    });

    describe('Units: test the method DesignHome.itemDetailsBackground.onChange', function () {
        it('it should pass if DesignHome.itemDetailsBackground.onChange is called', function () {
            var url="test.com";
            DesignHome.itemDetailsBackground.onChange(url);
            expect(DesignHome.data.design.itemDetailsBackgroundImage).toEqual(url);
        });
    });

    describe('Units: test the method DesignHome.itemDetailsBackground.onDelete', function () {
        it('it should pass if DesignHome.itemDetailsBackground.onDelete is called', function () {
            var url="test.com";
            DesignHome.itemDetailsBackground.onDelete(url);
            expect(DesignHome.data.design.itemDetailsBackgroundImage).toEqual("");
        });
    });
    describe('Units: Init()- DataStore.get returns error', function () {
        beforeEach(function () {
            DataStore.get.and.callFake(function () {
                var deferred = q.defer();
                deferred.resolve({
                    data:  {
                        "content": {
                            "carouselImages": [],
                            "description": "<p>&nbsp;<br></p>",
                            "rssUrl": ""
                        },
                        "design": {
                            "itemListLayout": "ss",
                            "itemDetailsLayout": "ssa",
                            "itemListBgImage": "",
                            "itemDetailsBgImage": ""
                        }
                    }
                });
                return deferred.promise;
            });
            DataStore.save.and.callFake(function () {
                var deferred = q.defer();
                deferred.reject('Error');
                return deferred.promise;
            });

        });

        it('DataStore.get should be called with error callback', function () {
            $rootScope.$digest();
            DataStore.get(TAG_NAMES.LOYALTY_INFO);
        });
    });

})
;