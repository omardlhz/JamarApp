"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PromiseFactory = exports.PromiseFactory = function () {
  function PromiseFactory() {
    _classCallCheck(this, PromiseFactory);
  }

  _createClass(PromiseFactory, null, [{
    key: "all",
    value: function all(arr) {
      return Promise.all(arr);
    }
  }, {
    key: "create",
    value: function create(fun) {
      return new Promise(fun);
    }
  }, {
    key: "createFromNode",
    value: function createFromNode(fun) {
      return new Promise(function (resolve, reject) {
        fun(function (err, data) {
          if (err) {
            reject(err);
          }

          resolve(data);
        });
      });
    }
  }]);

  return PromiseFactory;
}();