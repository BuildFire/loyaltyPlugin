describe('Unit : loyaltyPluginContent content Enums', function () {
  var STATUS_CODE, STATUS_MESSAGES, SERVER;


  beforeEach(module('loyaltyPluginContent'));

  beforeEach(inject(function (_STATUS_CODE_, _STATUS_MESSAGES_, _SERVER_) {
    STATUS_CODE = _STATUS_CODE_;
    STATUS_MESSAGES = _STATUS_MESSAGES_;
    SERVER = _SERVER_;
  }));

  describe('Enum : STATUS_CODE', function () {
    xit('STATUS_CODE should exist and be an object', function () {
      expect(typeof STATUS_CODE).toEqual('object');
    });
    xit('STATUS_CODE.INSERTED should exist and equals to "inserted"', function () {
      expect(STATUS_CODE.INSERTED).toEqual('inserted');
    });
    xit('STATUS_CODE.UPDATED should exist and equals to "updated"', function () {
      expect(STATUS_CODE.UPDATED).toEqual('updated');
    });
    xit('STATUS_CODE.UNDEFINED_DATA should exist and equals to "UNDEFINED_DATA"', function () {
      expect(STATUS_CODE.UNDEFINED_DATA).toEqual('UNDEFINED_DATA');
    });
    xit('STATUS_CODE.NOT_FOUND should exist and equals to "NOTFOUND"', function () {
      expect(STATUS_CODE.NOT_FOUND).toEqual('NOTFOUND');
    });
    xit('STATUS_CODE.UNDEFINED_OPTIONS should exist and equals to "UNDEFINED_OPTIONS"', function () {
      expect(STATUS_CODE.UNDEFINED_OPTIONS).toEqual('UNDEFINED_OPTIONS');
    });
    xit('STATUS_CODE.UNDEFINED_ID should exist and equals to "UNDEFINED_ID"', function () {
      expect(STATUS_CODE.UNDEFINED_ID).toEqual('UNDEFINED_ID');
    });
   xit('STATUS_CODE.ITEM_ARRAY_FOUND should exist and equals to "ITEM_ARRAY_FOUND"', function () {
      expect(STATUS_CODE.ITEM_ARRAY_FOUND).toEqual('ITEM_ARRAY_FOUND');
    });
    xit('STATUS_CODE.NOT_ITEM_ARRAY should exist and equals to "NOT_ITEM_ARRAY"', function () {
      expect(STATUS_CODE.NOT_ITEM_ARRAY).toEqual('NOT_ITEM_ARRAY');
    });

  });
  describe('Enum : STATUS_MESSAGES', function () {
    xit('STATUS_MESSAGES should exist and be an object', function () {
      expect(typeof STATUS_MESSAGES).toEqual('object');
    });
    xit('STATUS_MESSAGES.UNDEFINED_DATA should exist and equals to "Undefined data provided"', function () {
      expect(STATUS_MESSAGES.UNDEFINED_DATA).toEqual('Undefined data provided');
    });
    xit('STATUS_MESSAGES.UNDEFINED_OPTIONS should exist and equals to "Undefined options provided"', function () {
      expect(STATUS_MESSAGES.UNDEFINED_OPTIONS).toEqual('Undefined options provided');
    });
    xit('STATUS_MESSAGES.UNDEFINED_ID should exist and equals to "Undefined id provided"', function () {
      expect(STATUS_MESSAGES.UNDEFINED_ID).toEqual('Undefined id provided');
    });
    xit('STATUS_MESSAGES.NOT_ITEM_ARRAY should exist and equals to "Array of Items not provided"', function () {
      expect(STATUS_MESSAGES.NOT_ITEM_ARRAY).toEqual('Array of Items not provided');
    });
    xit('STATUS_MESSAGES.ITEM_ARRAY_FOUND should exist and equals to "Array of Items provided"', function () {
      expect(STATUS_MESSAGES.ITEM_ARRAY_FOUND).toEqual('Array of Items provided');
    });
  });

  describe('Enum : SERVER', function () {
    xit('SERVER should exist and be an object', function () {
      expect(typeof SERVER).toEqual('object');
    });
    xit('SERVER.URL should exist and equals to "http://loyalty.kaleoapps.com"', function () {
      expect(SERVER.URL).toEqual('http://loyalty.kaleoapps.com');
    });
  });
});

