(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.tinybind = factory());
}(this, function () { 'use strict';

  var OPTIONS = ['prefix', 'templateDelimiters', 'rootInterface', 'preloadData', 'handler'];
  var EXTENSIONS = ['binders', 'formatters', 'adapters', 'wr'];

  var PRIMITIVE = 0;
  var KEYPATH = 1;
  var TEXT = 0;
  var BINDING = 1;
  var QUOTED_STR = /^'.*'$|^".*"$/; // Parser and tokenizer for getting the type and value from a string.

  function parseType(string) {
    var type = PRIMITIVE;
    var value = string;

    if (QUOTED_STR.test(string)) {
      value = string.slice(1, -1);
    } else if (string === 'true') {
      value = true;
    } else if (string === 'false') {
      value = false;
    } else if (string === 'null') {
      value = null;
    } else if (string === 'undefined') {
      value = undefined;
    } else if (!isNaN(string)) {
      value = Number(string);
    } else {
      type = KEYPATH;
    }

    return {
      type: type,
      value: value
    };
  } // Template parser and tokenizer for mustache-style text content bindings.
  // Parses the template and returns a set of tokens, separating static portions
  // of text from binding declarations.

  function parseTemplate(template, delimiters) {
    var tokens;
    var length = template.length;
    var index = 0;
    var lastIndex = 0;
    var open = delimiters[0],
        close = delimiters[1];

    while (lastIndex < length) {
      index = template.indexOf(open, lastIndex);

      if (index < 0) {
        if (tokens) {
          tokens.push({
            type: TEXT,
            value: template.slice(lastIndex)
          });
        }

        break;
      } else {
        tokens || (tokens = []);

        if (index > 0 && lastIndex < index) {
          tokens.push({
            type: TEXT,
            value: template.slice(lastIndex, index)
          });
        }

        lastIndex = index + open.length;
        index = template.indexOf(close, lastIndex);

        if (index < 0) {
          var substring = template.slice(lastIndex - close.length);
          var lastToken = tokens[tokens.length - 1];

          if (lastToken && lastToken.type === TEXT) {
            lastToken.value += substring;
          } else {
            tokens.push({
              type: TEXT,
              value: substring
            });
          }

          break;
        }

        var value = template.slice(lastIndex, index).trim();
        tokens.push({
          type: BINDING,
          value: value
        });
        lastIndex = index + close.length;
      }
    }

    return tokens;
  }

  var tinybind = {
    // WireBootstrap extension
    wr: {},
    // Global binders.
    binders: {},
    // Global formatters.
    formatters: {},
    // Global sightglass adapters.
    adapters: {},
    // Default attribute prefix.
    _prefix: 'rv',
    _fullPrefix: 'rv-',

    get prefix() {
      return this._prefix;
    },

    set prefix(value) {
      this._prefix = value;
      this._fullPrefix = value + '-';
    },

    parseTemplate: parseTemplate,
    parseType: parseType,
    // Default template delimiters.
    templateDelimiters: ['{', '}'],
    // Default sightglass root interface.
    rootInterface: '.',
    // Preload data by default.
    preloadData: true,
    // Default event handler.
    handler: function handler(context, ev, binding) {
      this.call(context, ev, binding.view.models);
    },
    // Sets the attribute on the element. If no binder above is matched it will fall
    // back to using this binder.
    fallbackBinder: function fallbackBinder(el, value) {
      if (value != null) {
        el.setAttribute(this.type, value);
      } else {
        el.removeAttribute(this.type);
      }
    },
    // Merges an object literal into the corresponding global options.
    configure: function configure(options) {
      var _this = this;

      if (!options) {
        return;
      }

      Object.keys(options).forEach(function (option) {
        var value = options[option];

        if (EXTENSIONS.indexOf(option) > -1) {
          Object.keys(value).forEach(function (key) {
            _this[option][key] = value[key];
          });
        } else {
          _this[option] = value;
        }
      });
    }
  };

  // Check if a value is an object than can be observed.
  function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  } // Error thrower.


  function error(message) {
    throw new Error("[Observer] " + message);
  }

  var adapters;
  var interfaces;
  var rootInterface; // Constructs a new keypath observer and kicks things off.

  var Observer =
  /*#__PURE__*/
  function () {
    Observer.updateOptions = function updateOptions(options) {
      adapters = options.adapters;
      interfaces = Object.keys(adapters);
      rootInterface = options.rootInterface;
    } // Tokenizes the provided keypath string into interface + path tokens for the
    // observer to work with.
    ;

    Observer.tokenize = function tokenize(keypath, root) {
      var tokens = [];
      var current = {
        i: root,
        path: ''
      };
      var index;
      var chr;

      for (index = 0; index < keypath.length; index++) {
        chr = keypath.charAt(index);

        if (!!~interfaces.indexOf(chr)) {
          tokens.push(current);
          current = {
            i: chr,
            path: ''
          };
        } else {
          current.path += chr;
        }
      }

      tokens.push(current);
      return tokens;
    };

    function Observer(obj, keypath, callback) {
      this.keypath = keypath;
      this.callback = callback;
      this.objectPath = [];
      this.parse();
      this.obj = this.getRootObject(obj);

      if (isObject(this.target = this.realize())) {
        this.set(true, this.key, this.target, this.callback);
      }
    } // Parses the keypath using the interfaces defined on the view. Sets variables
    // for the tokenized keypath as well as the end key.


    var _proto = Observer.prototype;

    _proto.parse = function parse() {
      var path;
      var root;

      if (!interfaces.length) {
        error('Must define at least one adapter interface.');
      }

      if (!!~interfaces.indexOf(this.keypath[0])) {
        root = this.keypath[0];
        path = this.keypath.substr(1);
      } else {
        root = rootInterface;
        path = this.keypath;
      }

      this.tokens = Observer.tokenize(path, root);
      this.key = this.tokens.pop();
    } // Realizes the full keypath, attaching observers for every key and correcting
    // old observers to any changed objects in the keypath.
    ;

    _proto.realize = function realize() {
      var current = this.obj;
      var unreached = -1;
      var prev;
      var token;

      for (var index = 0; index < this.tokens.length; index++) {
        token = this.tokens[index];

        if (isObject(current)) {
          if (typeof this.objectPath[index] !== 'undefined') {
            if (current !== (prev = this.objectPath[index])) {
              this.set(false, token, prev, this);
              this.set(true, token, current, this);
              this.objectPath[index] = current;
            }
          } else {
            this.set(true, token, current, this);
            this.objectPath[index] = current;
          }

          current = this.get(token, current);
        } else {
          if (unreached === -1) {
            unreached = index;
          }

          if (prev = this.objectPath[index]) {
            this.set(false, token, prev, this);
          }
        }
      }

      if (unreached !== -1) {
        this.objectPath.splice(unreached);
      }

      return current;
    } // Updates the keypath. This is called when any intermediary key is changed.
    ;

    _proto.sync = function sync() {
      var next;
      var oldValue;
      var newValue;

      if ((next = this.realize()) !== this.target) {
        if (isObject(this.target)) {
          this.set(false, this.key, this.target, this.callback);
        }

        if (isObject(next)) {
          this.set(true, this.key, next, this.callback);
        }

        oldValue = this.value();
        this.target = next;
        newValue = this.value();
        if (newValue !== oldValue || newValue instanceof Function) this.callback.sync();
      } else if (next instanceof Array) {
        this.callback.sync();
      }
    } // Reads the current end value of the observed keypath. Returns undefined if
    // the full keypath is unreachable.
    ;

    _proto.value = function value() {
      if (isObject(this.target)) {
        return this.get(this.key, this.target);
      }
    } // Sets the current end value of the observed keypath. Calling setValue when
    // the full keypath is unreachable is a no-op.
    ;

    _proto.setValue = function setValue(value) {
      if (isObject(this.target)) {
        adapters[this.key.i].set(this.target, this.key.path, value);
      }
    } // Gets the provided key on an object.
    ;

    _proto.get = function get(key, obj) {
      return adapters[key.i].get(obj, key.path);
    } // Observes or unobserves a callback on the object using the provided key.
    ;

    _proto.set = function set(active, key, obj, callback) {
      var action = active ? 'observe' : 'unobserve';
      adapters[key.i][action](obj, key.path, callback);
    } // Unobserves the entire keypath.
    ;

    _proto.unobserve = function unobserve() {
      var obj;
      var token;

      for (var index = 0; index < this.tokens.length; index++) {
        token = this.tokens[index];

        if (obj = this.objectPath[index]) {
          this.set(false, token, obj, this);
        }
      }

      if (isObject(this.target)) {
        this.set(false, this.key, this.target, this.callback);
      }
    } // traverse the scope chain to find the scope which has the root property
    // if the property is not found in chain, returns the root scope
    ;

    _proto.getRootObject = function getRootObject(obj) {
      var rootProp;
      var current;

      if (!obj.$parent) {
        return obj;
      }

      if (this.tokens.length) {
        rootProp = this.tokens[0].path;
      } else {
        rootProp = this.key.path;
      }

      current = obj;

      while (current.$parent && current[rootProp] === undefined) {
        current = current.$parent;
      }

      return current;
    };

    return Observer;
  }();

  function getInputValue(el) {
    if (el.type === 'checkbox') {
      return el.checked;
    } else if (el.type === 'select-multiple') {
      var results = [];
      var option;

      for (var i = 0; i < el.options.length; i++) {
        option = el.options[i];

        if (option.selected) {
          results.push(option.value);
        }
      }

      return results;
    } else {
      return el.value;
    }
  }

  var FORMATTER_ARGS = /[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g;
  var FORMATTER_SPLIT = /\s+/; // A single binding between a model attribute and a DOM element.

  var Binding =
  /*#__PURE__*/
  function () {
    // All information about the binding is passed into the constructor; the
    // containing view, the DOM node, the type of binding, the model object and the
    // keypath at which to listen for changes.
    function Binding(view, el, type, keypath, binder, arg, formatters) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.keypath = keypath;
      this.binder = binder;
      this.arg = arg;
      this.formatters = formatters;
      this.formatterObservers = {};
      this.model = undefined;
    } // Observes the object keypath


    var _proto = Binding.prototype;

    _proto.observe = function observe(obj, keypath) {
      return new Observer(obj, keypath, this);
    };

    _proto.parseTarget = function parseTarget() {
      if (this.keypath) {
        var token = parseType(this.keypath);

        if (token.type === 0) {
          this.value = token.value;
        } else {
          this.observer = this.observe(this.view.models, this.keypath);
          this.model = this.observer.target;
        }
      } else {
        this.value = undefined;
      }
    };

    _proto.parseFormatterArguments = function parseFormatterArguments(args, formatterIndex) {
      var _this = this;

      return args.map(parseType).map(function (_ref, ai) {
        var type = _ref.type,
            value = _ref.value;

        if (type === 0) {
          return value;
        } else {
          if (!_this.formatterObservers[formatterIndex]) {
            _this.formatterObservers[formatterIndex] = {};
          }

          var observer = _this.formatterObservers[formatterIndex][ai];

          if (!observer) {
            observer = _this.observe(_this.view.models, value);
            _this.formatterObservers[formatterIndex][ai] = observer;
          }

          return observer.value();
        }
      });
    } // Applies all the current formatters to the supplied value and returns the
    // formatted value.
    ;

    _proto.formattedValue = function formattedValue(value) {
      var _this2 = this;

      return this.formatters.reduce(function (result, declaration, index) {
        var args = declaration.match(FORMATTER_ARGS);
        var id = args.shift();
        var formatter = _this2.view.options.formatters[id];

        var processedArgs = _this2.parseFormatterArguments(args, index);

        if (formatter && formatter.read instanceof Function) {
          result = formatter.read.apply(formatter, [result].concat(processedArgs));
        } else if (formatter instanceof Function) {
          result = formatter.apply(void 0, [result].concat(processedArgs));
        }

        return result;
      }, value);
    } // Returns an event handler for the binding around the supplied function.
    ;

    _proto.eventHandler = function eventHandler(fn) {
      var binding = this;
      var handler = binding.view.options.handler;
      return function (ev) {
        handler.call(fn, this, ev, binding);
      };
    } // Sets the value for the binding. This Basically just runs the binding routine
    // with the supplied value formatted.
    ;

    _proto.set = function set(value) {
      if (value instanceof Function && !this.binder.function) {
        value = this.formattedValue(value.call(this.model));
      } else {
        value = this.formattedValue(value);
      }

      var routineFn = this.binder.routine || this.binder;

      if (routineFn instanceof Function) {
        routineFn.call(this, this.el, value);
      }
    } // Syncs up the view binding with the model.
    ;

    _proto.sync = function sync() {
      if (this.observer) {

        this.model = this.observer.target;
        this.set(this.observer.value());

        // wire callback for view sync subscription        
        if(this.view.options.wr && this.view.options.wr.syncCallbackReady && this.view.options.wr.syncCallback && this.observer.target){
          this.view.options.wr.syncCallback.apply(this.observer.obj, [this.observer.target, this.observer.key.path, this.observer.value()]);
        }

      } else {
        this.set(this.value);
      }
    } // Publishes the value currently set on the input element back to the model.
    ;

    _proto.publish = function publish() {
      var _this3 = this;

      if (this.observer) {
        var value = this.formatters.reduceRight(function (result, declaration, index) {
          var args = declaration.split(FORMATTER_SPLIT);
          var id = args.shift();
          var formatter = _this3.view.options.formatters[id];

          var processedArgs = _this3.parseFormatterArguments(args, index);

          if (formatter && formatter.publish) {
            result = formatter.publish.apply(formatter, [result].concat(processedArgs));
          }

          return result;
        }, this.getValue(this.el));

        this.observer.setValue(value);

      }
    } // Subscribes to the model for changes at the specified keypath. Bi-directional
    // routines will also listen for changes on the element to propagate them back
    // to the model.
    ;

    _proto.bind = function bind() {
      this.parseTarget();

      if (this.binder.hasOwnProperty('bind')) {
        this.binder.bind.call(this, this.el);
      }

      if (this.view.options.preloadData) {
        this.sync();
      }
    } // Unsubscribes from the model and the element.
    ;

    _proto.unbind = function unbind() {
      var _this4 = this;

      if (this.binder.unbind) {
        this.binder.unbind.call(this, this.el);
      }

      if (this.observer) {
        this.observer.unobserve();
      }

      Object.keys(this.formatterObservers).forEach(function (fi) {
        var args = _this4.formatterObservers[fi];
        Object.keys(args).forEach(function (ai) {
          args[ai].unobserve();
        });
      });
      this.formatterObservers = {};
    } // Updates the binding's model from what is currently set on the view. Unbinds
    // the old model first and then re-binds with the new model.
    ;

    _proto.update = function update(models) {
      if (models === void 0) {
        models = {};
      }

      if (this.observer) {
        this.model = this.observer.target;
      }

      if (this.binder.update) {
        this.binder.update.call(this, models);
      }
    } // Returns elements value
    ;

    _proto.getValue = function getValue(el) {
      if (this.binder && this.binder.getValue) {
        return this.binder.getValue.call(this, el);
      } else {
        return getInputValue(el);
      }
    };

    return Binding;
  }();

  var textBinder = {
    routine: function routine(node, value) {
      node.data = value != null ? value : '';
    }
  };
  var DECLARATION_SPLIT = /((?:'[^']*')*(?:(?:[^\|']*(?:'[^']*')+[^\|']*)+|[^\|]+))|^$/g;

  var parseNode = function parseNode(view, node) {
    var block = false;

    if (node.nodeType === 3) {
      var tokens = parseTemplate(node.data, tinybind.templateDelimiters);

      if (tokens) {
        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];
          var text = document.createTextNode(token.value);
          node.parentNode.insertBefore(text, node);

          if (token.type === 1) {
            view.buildBinding(text, null, token.value, textBinder, null);
          }
        }

        node.parentNode.removeChild(node);
      }

      block = true;
    } else if (node.nodeType === 1) {
      block = view.traverse(node);
    }

    if (!block) {
      for (var _i = 0; _i < node.childNodes.length; _i++) {
        parseNode(view, node.childNodes[_i]);
      }
    }
  };

  var bindingComparator = function bindingComparator(a, b) {
    var aPriority = a.binder ? a.binder.priority || 0 : 0;
    var bPriority = b.binder ? b.binder.priority || 0 : 0;
    return bPriority - aPriority;
  };

  var trimStr = function trimStr(str) {
    return str.trim();
  }; // A collection of bindings built from a set of parent nodes.


  var View =
  /*#__PURE__*/
  function () {
    // The DOM elements and the model objects for binding are passed into the
    // constructor along with any local options that should be used throughout the
    // context of the view and it's bindings.
    function View(els, models, options) {
      if (els.jquery || els instanceof Array) {
        this.els = els;
      } else {
        this.els = [els];
      }

      this.models = models;
      this.options = options;
      this.build();
    }

    var _proto = View.prototype;

    _proto.buildBinding = function buildBinding(node, type, declaration, binder, arg) {
      var pipes = declaration.match(DECLARATION_SPLIT).map(trimStr);
      var keypath = pipes.shift();
      this.bindings.push(new Binding(this, node, type, keypath, binder, arg, pipes));
    } // Parses the DOM tree and builds `Binding` instances for every matched
    // binding declaration.
    ;

    _proto.build = function build() {
      this.bindings = [];
      var elements = this.els,
          i,
          len;

      for (i = 0, len = elements.length; i < len; i++) {
        parseNode(this, elements[i]);
      }

      this.bindings.sort(bindingComparator);
    };

    _proto.traverse = function traverse(node) {
      var bindingPrefix = tinybind._fullPrefix;
      var block = node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE';
      var attributes = node.attributes;
      var bindInfos = [];
      var starBinders = this.options.starBinders;
      var type, binder, identifier, arg;

      for (var i = 0, len = attributes.length; i < len; i++) {
        var attribute = attributes[i];

        if (attribute.name.indexOf(bindingPrefix) === 0) {
          type = attribute.name.slice(bindingPrefix.length);
          binder = this.options.binders[type];
          arg = undefined;

          if (!binder) {
            for (var k = 0; k < starBinders.length; k++) {
              identifier = starBinders[k];

              if (type.slice(0, identifier.length - 1) === identifier.slice(0, -1)) {
                binder = this.options.binders[identifier];
                arg = type.slice(identifier.length - 1);
                break;
              }
            }
          }

          if (!binder) {
            binder = tinybind.fallbackBinder;
          }

          if (binder.block) {
            this.buildBinding(node, type, attribute.value, binder, arg);
            node.removeAttribute(attribute.name);
            return true;
          }

          bindInfos.push({
            attr: attribute,
            binder: binder,
            type: type,
            arg: arg
          });
        }
      }

      for (var _i2 = 0; _i2 < bindInfos.length; _i2++) {
        var bindInfo = bindInfos[_i2];
        this.buildBinding(node, bindInfo.type, bindInfo.attr.value, bindInfo.binder, bindInfo.arg);
        node.removeAttribute(bindInfo.attr.name);
      }

      return block;
    } // Binds all of the current bindings for this view.
    ;

    _proto.bind = function bind() {
      this.bindings.forEach(function (binding) {
        binding.bind();
      });
    } // Unbinds all of the current bindings for this view.
    ;

    _proto.unbind = function unbind() {
      this.bindings.forEach(function (binding) {
        binding.unbind();
      });
    } // Syncs up the view with the model by running the routines on all bindings.
    ;

    _proto.sync = function sync() {
      this.bindings.forEach(function (binding) {
        binding.sync();
      });
    } // Publishes the input values from the view back to the model (reverse sync).
    ;

    _proto.publish = function publish() {
      this.bindings.forEach(function (binding) {
        if (binding.binder && binding.binder.publishes) {
          binding.publish();
        }
      });
    } // Updates the view's models along with any affected bindings.
    ;

    _proto.update = function update(models) {
      var _this = this;

      if (models === void 0) {
        models = {};
      }

      Object.keys(models).forEach(function (key) {
        _this.models[key] = models[key];
      });
      this.bindings.forEach(function (binding) {
        if (binding.update) {
          binding.update(models);
        }
      });
    };

    return View;
  }();

  // The default `.` adapter that comes with tinybind.js. Allows subscribing to
  // properties on plain objects, implemented in ES5 natives using
  // `Object.defineProperty`.
  var ARRAY_METHODS = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
  var adapter = {
    counter: 0,
    weakmap: {},
    weakReference: function weakReference(obj) {
      if (!obj.hasOwnProperty('__rv')) {
        var id = this.counter++;
        Object.defineProperty(obj, '__rv', {
          value: id
        });
      }

      if (!this.weakmap[obj.__rv]) {
        this.weakmap[obj.__rv] = {
          callbacks: {}
        };
      }

      return this.weakmap[obj.__rv];
    },
    cleanupWeakReference: function cleanupWeakReference(data, refId) {
      if (!Object.keys(data.callbacks).length) {
        if (!(data.pointers && Object.keys(data.pointers).length)) {
          delete this.weakmap[refId];
        }
      }
    },
    stubFunction: function stubFunction(obj, fn) {
      var original = obj[fn];
      var data = this.weakReference(obj);
      var weakmap = this.weakmap;

      obj[fn] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var response = original.apply(obj, args);
        Object.keys(data.pointers).forEach(function (refId) {
          var k = data.pointers[refId];

          if (weakmap[refId]) {
            if (weakmap[refId].callbacks[k] instanceof Array) {
              weakmap[refId].callbacks[k].forEach(function (callback) {
                callback.sync();
              });
            }
          }
        });
        return response;
      };
    },
    observeArray: function observeArray(value, refId, keypath) {
      var _this = this;

      if (value instanceof Array) {
        var data = this.weakReference(value);

        if (!data.pointers) {
          data.pointers = {};
          ARRAY_METHODS.forEach(function (fn) {
            _this.stubFunction(value, fn);
          });
        }

        if (!data.pointers[refId]) {
          data.pointers[refId] = [];
        }

        if (data.pointers[refId].indexOf(keypath) === -1) {
          data.pointers[refId].push(keypath);
        }
      }
    },
    unobserveArray: function unobserveArray(value, refId, keypath) {
      if (value instanceof Array && value.__rv != null) {
        var data = this.weakmap[value.__rv];

        if (data) {
          var pointers = data.pointers[refId];

          if (pointers) {
            var idx = pointers.indexOf(keypath);

            if (idx > -1) {
              pointers.splice(idx, 1);
            }

            if (!pointers.length) {
              delete data.pointers[refId];
            }

            this.cleanupWeakReference(data, value.__rv);
          }
        }
      }
    },
    observe: function observe(obj, keypath, callback) {
      var _this2 = this;

      var value;
      var callbacks = this.weakReference(obj).callbacks;

      if (!callbacks[keypath]) {
        callbacks[keypath] = [];
        var desc = Object.getOwnPropertyDescriptor(obj, keypath);

        if (!desc || !(desc.get || desc.set || !desc.configurable)) {
          value = obj[keypath];
          Object.defineProperty(obj, keypath, {
            enumerable: true,
            get: function get() {
              return value;
            },
            set: function set(newValue) {
              if (newValue !== value) {
                _this2.unobserveArray(value, obj.__rv, keypath);

                value = newValue;
                var data = _this2.weakmap[obj.__rv];

                if (data) {
                  var _callbacks = data.callbacks[keypath];

                  if (_callbacks) {
                    _callbacks.forEach(function (cb) {
                      cb.sync();
                    });
                  }

                  _this2.observeArray(newValue, obj.__rv, keypath);
                }
              }
            }
          });
        }
      }

      if (callbacks[keypath].indexOf(callback) === -1) {
        callbacks[keypath].push(callback);
      }

      this.observeArray(obj[keypath], obj.__rv, keypath);
    },
    unobserve: function unobserve(obj, keypath, callback) {
      var data = this.weakmap[obj.__rv];

      if (data) {
        var callbacks = data.callbacks[keypath];

        if (callbacks) {
          var idx = callbacks.indexOf(callback);

          if (idx > -1) {
            callbacks.splice(idx, 1);

            if (!callbacks.length) {
              delete data.callbacks[keypath];
              this.unobserveArray(obj[keypath], obj.__rv, keypath);
            }
          }

          this.cleanupWeakReference(data, obj.__rv);
        }
      }
    },
    get: function get(obj, keypath) {
      return obj[keypath];
    },
    set: function set(obj, keypath, value) {
      obj.__wrDirty = true;
      obj[keypath] = value;
    }
  };

  var getString = function getString(value) {
    return value != null ? value.toString() : undefined;
  };

  var times = function times(n, cb) {
    for (var i = 0; i < n; i++) {
      cb();
    }
  };

  function createView(binding, data, anchorEl) {
    var template = binding.el.cloneNode(true);
    var view = new View(template, data, binding.view.options);
    view.bind();
    binding.marker.parentNode.insertBefore(template, anchorEl);
    return view;
  }

  var binders = {
    // Binds an event handler on the element.
    'on-*': {
      function: true,
      priority: 1000,
      unbind: function unbind(el) {
        if (this.handler) {
          el.removeEventListener(this.arg, this.handler);
        }
      },
      routine: function routine(el, value) {
        if (this.handler) {
          el.removeEventListener(this.arg, this.handler);
        }

        this.handler = this.eventHandler(value);
        el.addEventListener(this.arg, this.handler);
      }
    },
    // Appends bound instances of the element in place for each item in the array.
    'each-*': {
      block: true,
      priority: 4000,
      bind: function bind(el) {
        if (!this.marker) {
          this.marker = document.createComment(" tinybind: " + this.type + " ");
          this.iterated = [];
          el.parentNode.insertBefore(this.marker, el);
          el.parentNode.removeChild(el);
        } else {
          this.iterated.forEach(function (view) {
            view.bind();
          });
        }
      },
      unbind: function unbind(el) {
        if (this.iterated) {
          this.iterated.forEach(function (view) {
            view.unbind();
          });
        }
      },
      routine: function routine(el, collection) {
        var _this = this;

        var modelName = this.arg;
        collection = collection || [];
        var indexProp = el.getAttribute('index-property') || '$index';
        collection.forEach(function (model, index) {
          var data = {
            $parent: _this.view.models
          };
          data[indexProp] = index;
          data[modelName] = model;
          var view = _this.iterated[index];

          if (!view) {
            var previous = _this.marker;

            if (_this.iterated.length) {
              previous = _this.iterated[_this.iterated.length - 1].els[0];
            }

            view = createView(_this, data, previous.nextSibling);

            _this.iterated.push(view);
          } else {
            if (view.models[modelName] !== model) {
              // search for a view that matches the model
              var matchIndex, nextView;

              for (var nextIndex = index + 1; nextIndex < _this.iterated.length; nextIndex++) {
                nextView = _this.iterated[nextIndex];

                if (nextView.models[modelName] === model) {
                  matchIndex = nextIndex;
                  break;
                }
              }

              if (matchIndex !== undefined) {
                // model is in other position
                // todo: consider avoiding the splice here by setting a flag
                // profile performance before implementing such change
                _this.iterated.splice(matchIndex, 1);

                _this.marker.parentNode.insertBefore(nextView.els[0], view.els[0]);

                nextView.models[indexProp] = index;
              } else {
                //new model
                nextView = createView(_this, data, view.els[0]);
              }

              _this.iterated.splice(index, 0, nextView);
            } else {
              view.models[indexProp] = index;
            }
          }
        });

        if (this.iterated.length > collection.length) {
          times(this.iterated.length - collection.length, function () {
            var view = _this.iterated.pop();

            view.unbind();

            _this.marker.parentNode.removeChild(view.els[0]);
          });
        }

        if (el.nodeName === 'OPTION') {
          this.view.bindings.forEach(function (binding) {
            if (binding.el === _this.marker.parentNode && binding.type === 'value') {
              binding.sync();
            }
          });
        }
      },
      update: function update(models) {
        var _this2 = this;

        var data = {}; //todo: add test and fix if necessary

        Object.keys(models).forEach(function (key) {
          if (key !== _this2.arg) {
            data[key] = models[key];
          }
        });
        this.iterated.forEach(function (view) {
          view.update(data);
        });
      }
    },
    // Adds or removes the class from the element when value is true or false.
    'class-*': function _class(el, value) {
      var elClass = " " + el.className + " ";

      if (!value === elClass.indexOf(" " + this.arg + " ") > -1) {
        if (value) {
          el.className = el.className + " " + this.arg;
        } else {
          el.className = elClass.replace(" " + this.arg + " ", ' ').trim();
        }
      }
    },
    // Sets the element's text value.
    text: function text(el, value) {
      el.textContent = value != null ? value : '';
    },
    // Sets the element's HTML content.
    html: function html(el, value) {
      el.innerHTML = value != null ? value : '';
    },
    // Shows the element when value is true.
    show: function show(el, value) {
      el.style.display = value ? '' : 'none';
    },
    // Hides the element when value is true (negated version of `show` binder).
    hide: function hide(el, value) {
      el.style.display = value ? 'none' : '';
    },
    // Enables the element when value is true.
    enabled: function enabled(el, value) {
      el.disabled = !value;
    },
    // Disables the element when value is true (negated version of `enabled` binder).
    disabled: function disabled(el, value) {
      el.disabled = !!value;
    },
    // Checks a checkbox or radio input when the value is true. Also sets the model
    // property when the input is checked or unchecked (two-way binder).
    checked: {
      publishes: true,
      priority: 2000,
      bind: function bind(el) {
        var self = this;

        if (!this.callback) {
          this.callback = function () {
            self.publish();
          };
        }

        el.addEventListener('change', this.callback);
      },
      unbind: function unbind(el) {
        el.removeEventListener('change', this.callback);
      },
      routine: function routine(el, value) {
        if (el.type === 'radio') {
          el.checked = getString(el.value) === getString(value);
        } else {
          el.checked = !!value;
        }
      }
    },
    // Sets the element's value. Also sets the model property when the input changes
    // (two-way binder).
    value: {
      publishes: true,
      priority: 3000,
      bind: function bind(el) {
        this.isRadio = el.tagName === 'INPUT' && el.type === 'radio';

        if (!this.isRadio) {
          this.event = el.getAttribute('event-name') || (el.tagName === 'SELECT' ? 'change' : 'input');
          var self = this;

          if (!this.callback) {
            this.callback = function () {
              self.publish();
            };
          }

          el.addEventListener(this.event, this.callback);
        }
      },
      unbind: function unbind(el) {
        if (!this.isRadio) {
          el.removeEventListener(this.event, this.callback);
        }
      },
      routine: function routine(el, value) {
        if (this.isRadio) {
          el.setAttribute('value', value);
        } else {
          if (el.type === 'select-multiple') {
            if (value instanceof Array) {
              for (var i = 0; i < el.length; i++) {
                var option = el[i];
                option.selected = value.indexOf(option.value) > -1;
              }
            }
          } else if (getString(value) !== getString(el.value)) {
            el.value = value != null ? value : '';
          }
        }
      }
    },
    // Inserts and binds the element and it's child nodes into the DOM when true.
    if: {
      block: true,
      priority: 4000,
      bind: function bind(el) {
        if (!this.marker) {
          this.marker = document.createComment(' tinybind: ' + this.type + ' ' + this.keypath + ' ');
          this.attached = false;
          el.parentNode.insertBefore(this.marker, el);
          el.parentNode.removeChild(el);
        } else if (this.bound === false && this.nested) {
          this.nested.bind();
        }

        this.bound = true;
      },
      unbind: function unbind() {
        if (this.nested) {
          this.nested.unbind();
          this.bound = false;
        }
      },
      routine: function routine(el, value) {
        if (!!value !== this.attached) {
          if (value) {
            if (!this.nested) {
              this.nested = new View(el, this.view.models, this.view.options);
              this.nested.bind();
            }

            this.marker.parentNode.insertBefore(el, this.marker.nextSibling);
            this.attached = true;
          } else {
            el.parentNode.removeChild(el);
            this.attached = false;
          }
        }
      },
      update: function update(models) {
        if (this.nested) {
          this.nested.update(models);
        }
      }
    }
  };

  var formatters = {
    watch: function watch(value) {
      return value;
    },
    not: function not(value) {
      return !value;
    },
    negate: function negate(value) {
      return !value;
    }
  };

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  var Component =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inheritsLoose(Component, _HTMLElement);

    function Component() {
      return _HTMLElement.apply(this, arguments) || this;
    }

    var _proto = Component.prototype;

    _proto.connectedCallback = function connectedCallback() {
      var nodes = this.constructor.__templateEl.content.cloneNode(true);

      this.__tinybindView = tinybind.bind(nodes, this);

      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }

      this.appendChild(nodes);
    };

    _proto.disconnectedCallback = function disconnectedCallback() {
      this.__tinybindView.unbind();
    };

    _proto.attributeChangedCallback = function attributeChangedCallback(name, old, value) {
      if (old !== value) {
        var propName = this.constructor.__propAttributeMap[name];
        this[propName] = value;
      }
    };

    _createClass(Component, null, [{
      key: "observedAttributes",
      get: function get() {
        var template = this.template;

        if (!template) {
          throw new Error("No template declared for " + this.name);
        }

        this.__templateEl = document.createElement('template');
        this.__templateEl.innerHTML = template;
        var propAttributeMap = this.__propAttributeMap = {};
        var attributes = [];
        var properties = this.properties;

        if (properties) {
          Object.keys(properties).forEach(function (propName) {
            var propConfig = properties[propName];
            var attrName = typeof propConfig === 'string' ? propConfig : propName;
            propAttributeMap[attrName] = propName;
            attributes.push(attrName);
          });
        }

        return attributes;
      }
    }]);

    return Component;
  }(_wrapNativeSuper(HTMLElement));

  tinybind.binders = binders;
  tinybind.formatters = formatters;
  tinybind.adapters['.'] = adapter;
  tinybind.Component = Component; // Binds some data to a template / element. Returns a tinybind.View instance.

  tinybind.bind = function (el, models, options) {
    var viewOptions = {};
    models = models || {};
    options = options || {};
    EXTENSIONS.forEach(function (extensionType) {
      viewOptions[extensionType] = Object.create(null);

      if (options[extensionType]) {
        Object.keys(options[extensionType]).forEach(function (key) {
          viewOptions[extensionType][key] = options[extensionType][key];
        });
      }

      Object.keys(tinybind[extensionType]).forEach(function (key) {
        if (!viewOptions[extensionType][key]) {
          viewOptions[extensionType][key] = tinybind[extensionType][key];
        }
      });
    });
    OPTIONS.forEach(function (option) {
      var value = options[option];
      viewOptions[option] = value != null ? value : tinybind[option];
    });
    viewOptions.starBinders = Object.keys(viewOptions.binders).filter(function (key) {
      return key.indexOf('*') > 0;
    });
    Observer.updateOptions(viewOptions);
    var view = new View(el, models, viewOptions);
    view.bind();
    return view;
  };

  return tinybind;

}));
//# sourceMappingURL=tinybind.js.map

//
// Configuration
//

tinybind.configure({
    
    prefix: 'wr',
    
    fallbackBinder: function(el, value) {

        if (value != null) {
            
            if(typeof value == "object"){
                el[this.type] = value;
                el.setAttribute(this.type, "[wr-object]");
            }
            else
                el.setAttribute(this.type, value);

        } else
            el.removeAttribute(this.type);
        }      
});

//
// Binders
//


tinybind.binders['add-class'] = function (el, value) {
    if(value)
    el.className = (el.className == "" ? value : `${el.className} ${value}`);
}

tinybind.binders['import-*'] = function (el, a, b) {
    let name = "default";
    if (this.formatters && this.formatters.length)
        name = this.formatters[0];

    el.setAttribute(this.arg, "[wr-import]|{0}|{1}|{2}".format(this.arg, name, this.keypath));
}

tinybind.binders['select2'] = {
    publishes: true,
    priority: 2000,
    bind: function (el) {

        const self = this;

        $(el).on("select2:select select2:unselect", function () {
            self.publish();
        });      

    },
    unbind: function (el) {
        $(el).off("select2:select select2:unselect");
        $(el).off("databind.wire");
    },
    routine: function (el, value) {

        $(el).on("databind.wire", (e, d) => {
            debugger
            if (typeof value != "undefined")
                $(el).val(value).trigger("change")
        });

    }
}


//
// Tinybind daterangepicker model binding
//
tinybind.binders['daterangepicker'] = {
    publishes: true,
    priority: 2000,
    bind: function (el) {

        const self = this;

        $(el).on("apply.daterangepicker", function () {
            self.publish();
        });

    },
    unbind: function (el) {             
        $(el).off("apply.daterangepicker");
    },
    routine: function () {
        // not implemented
    }
}


// NOT NEEDED ? Create an anchor and style as button (wr-href="someurl")
// <a wr-navigate="someUrl"></a>
tinybind.binders['navigate'] = {
    function: true,
    priority: 1000,
    unbind: function unbind(el) {
      if (this._navigate) {
        el.removeEventListener("click", this._navigate);
      }
    },
    routine: function routine(el, value) {
  
      if (this._navigate) {
        el.removeEventListener("click", this.handler);
      }
  
      if (value) {
  
        this._navigate = function () {
          window.open(value, "_new");
        }
  
        el.addEventListener("click", this._navigate);
      }
      
    }
}

//
// Adaptors
//

tinybind.adapters['['] = {
    observe: function (obj, keypath, callback) {
        // not implmented
    },
    unobserve: function (obj, keypath, callback) {
        // not implemented
    },
    get: function (obj, keypath) {        
        let key = keypath.split("]")[0].replaceAll('"', "").replaceAll("'", "");
        key =  (wire.isNumeric(key) ? +key : key);
        return obj[key];
    },
    set: function (obj, keypath, value) {
        // not implemented
    }
}


//
// Formatters
//

//item | exp 'Edit {Name}' | -> two way-> watch item.Name
// <div wr-add-class="wrAttrib | exp '=`panel-${$obj.color||'inverse'}`'" class="panel">
tinybind.formatters.exp = function(obj, exp) {
    
    if(obj) 
        return `=(${exp})`.eval(obj);
    else
        return "";

}

tinybind.formatters.args = function (fn) {
    let args = Array.prototype.slice.call(arguments, 1);
    return function () {
      // ev, data (from tinybind), arg1, arg2, ...
      // async events loose all but second parameter so adding to data
      const data = arguments[1];
      data.args = args;
      data.el = this;
      return fn.apply(this, Array.prototype.concat.call(arguments[0], data, ...args));
    }
  }          

tinybind.formatters['date'] = function (dte, locale) {    
    if (dte)
        return new Date(dte).toLocaleDateString(locale || "en-US");
    else {
//        console.log("Binding 'date' received a null or undefined object with locale '{0}'".format(locale || '[null]'));
        return "";
    }
}

tinybind.formatters['property'] = function (obj, property) {
    if (obj)
        return obj[property];
    else {
  //      console.log("Binding 'property' received a null or undefined object with property '{0}'".format(property));
        return "";
    }
}
//
// Web component
//
class WebComponent extends tinybind.Component {

    constructor(props){
      super();
      this._connectedCallbackHasRun = false;
      if(props)
        this._wrProps = props;
    }

    wrUpdateBind() {
        if(this.__tinybindView) {
            this.__tinybindView.unbind();
            const nodes = this.constructor.__templateEl.content.cloneNode(true);
            this.__tinybindView.bind(nodes, this, options);
        }
    }

    //
    // Handle attach life-cycle event
    //
    connectedCallback() {
          
        const _getTemplate = (fn, fn2) => {

            let v = (fn? fn.call(this) : null);

            if(v)
              return v;
            else
              if(fn2) {
                if(typeof fn2 == "function")
                  return fn2.call(this);
                else
                  return fn2;
              }

        }

        const _config = (cb) => {
            
          const url = _getTemplate(this.configUrl, this.constructor.configUrl);
          
          if(url) {         
                      
              fetch(url)
                  .then(response => {
                      if (response.ok)
                          return response.json();
                      else {
                          console.log("Unable to load configuration from {0}".format(url));
                          throw response;
                      }
                  })
                  .then(config => {                
                      if(config){
                          if(this._wrProps){
                              wire.merge(config, this._wrProps);
                              this._wrProps = config;
                          }
                          else
                              this._wrProps = config;   
                      }
                      cb();
                  })
                  .catch(error => {
                      console.log("Unable to load configuration from {0}".format(url));
                      throw error;
                  });
          }
          else cb();

        }

        const _style = (cb) => {
            
            const setStyle = (style) => {

                const tag = document.createElement("style");

                tag.append(style);

                this.prepend(tag);

                cb();

            }

            const url = _getTemplate(this.styleUrl, this.constructor.styleUrl);

            if(url) {                
                fetch(url)
                    .then(response => {
                        if (response.ok)
                            return response.text();
                        else {
                            console.log("Unable to load styles from {0}".format(url));
                            throw response;
                        }
                    })
                    .then(style => {                        
                        setStyle(style);
                    })
                    .catch(error => {
                        console.log("Unable to load styles from {0}".format(url));
                        throw error;
                    });
            }
            else cb();

        }

        const _templateUrl = (cb) => {
            
            const url = _getTemplate(this.templateUrl, this.constructor.templateUrl);

            fetch(url)
                .then(response => {
                    if (response.ok)
                        return response.text();
                    else {
                        console.log("Unable to load template from {0}".format(url));
                        throw response;
                    }
                })
                .then(template => {
                    this.constructor.__templateEl.innerHTML = template;
                    cb();
                })
                .catch(error => {
                    console.log("Unable to load template from {0}".format(url));
                    throw error;
                });
        
        }

        const _bindTemplate = ()=> {
            
          _config(() => {

              // call back when tinybind syncs model either way
              // set sync function 
              const viewOptions = {wr: { syncCallbackReady: false, syncCallback: (obj, prop, value)=> {        
                  
                  //new wire.data.DataEvent("object-changed.wr").row(obj).cell(prop, value) .raise();
                  
                // bubble/forward the observable change to inheriting class             
                this.wrObjectChanged.call(this, obj, prop, value);

              }}};
              
              if(this.children.length == 0) { 
                  // simple append and bind for template
                  //super.connectedCallback(); 

                  var nodes = this.constructor.__templateEl.content.cloneNode(true);

                  this.__tinybindView = tinybind.bind(nodes, this, viewOptions);
          
                  while (this.firstChild) {
                  this.removeChild(this.firstChild);
                  }
          
                  this.appendChild(nodes);

              }           
              else {

                  // preserve content/children inside the component if exists    

                  let tmpl = null;
                  
                  const container = _getTemplate(this.templateContainer, this.constructor.templateContainer);

                  if(container) {
                      
                  // content to be appended to a node in the template
                  tmpl = this.constructor.__templateEl.content.cloneNode(true); 

                  this.__tinybindView = tinybind.bind(tmpl, this, viewOptions);
                      
                  const parent = tmpl.querySelector(container);

                  if(parent) {
  
                      // drag/drop with existing content recursivly embed the same content inside each container
                      let isSelf = false;
                  
                      Array.from(this.children).forEach(child=>{
                          if(!isSelf)
                              isSelf = child.querySelector(container);
                          if(!isSelf)
                              parent.appendChild(child);
                      });
                      
                      if(!isSelf)
                          this.replaceChildren(tmpl);                        
                  }
                  else console.log(`templateContainer ${container} not found`); 
                  
              }
                  else {
                      // ignore template, child content is the template                                   
                      tmpl = this;                    
                      this.__tinybindView = tinybind.bind(tmpl, this, viewOptions);
                  }                
                  
              }
              
              _style(() => {

                  // race condition using the element id, use this event level id
                  new wire.Event("template-ready.webcomponent.wr").data({id: this.id}).raise();

                  //
                  // App ready
                  // turn on sync (noise if left on during initial bindings)
                  //            
                  if (this.wrIsAppReady) {                     
                      this.wrAppReady();
                  }
                  else
                      addEventListener('app-ready.wr', () => {
                          this.wrAppReady();
                      });                                              
              });

          });

        }
  

        //
        // Template processing
        // this.x is this class, this.contructor.x is the override
        //
        const url = _getTemplate(this.templateUrl, this.constructor.templateUrl);
        if(url)
            _templateUrl(() => {          
                _bindTemplate();
            });
        else {
            const id = _getTemplate(this.templateId, this.constructor.templateId);
            if(id) {
                let tmpl = document.getElementById(id);                
                this.constructor.__templateEl.innerHTML = tmpl.innerHTML;
                tmpl.remove();
                _bindTemplate();
            }
            else {
              if(typeof this.template == "function")
                this.constructor.__templateEl.innerHTML = this.template();              
              _bindTemplate();
            }
         }
          
         this._connectedCallbackHasRun = true;

         dispatchEvent(new Event("connectedCallback.wr"));
          
    }   

    async ensureConnectedCallback() {

        return new Promise((cb) => {
            if (this._connectedCallbackHasRun)
              cb();
            else
              addEventListener('connectedCallback.wr', cb);  
        });

    }

    async attributeChangedCallback(name, oldValue, newValue) {

        if (newValue.indexOf("[wr-import]") > -1) {

            const prop = newValue.split("|")[1];
            const name = newValue.split("|")[2];
            const path = newValue.split("|")[3];

            let d = await import(path);

            const obj = d[name];

            // import file.js?id=10
            const params = wire.location.path(path).params();

            if(obj.eq && params.length) {

                // add filters
                params.forEach(param => {
                    obj.eq(param.name, param.value);
                });

            }

            this[prop] = obj;
            
            this.wrObjectChanged(this[prop], prop);
        }
        else {
            if (newValue == "[wr-object]") {
                //this.removeAttribute(name);
                this.wrObjectChanged(this[name], name);
            }
            else
                super.attributeChangedCallback(name, oldValue, newValue);
        }
    }

    async wrAppReady() {
    }

    wrSetAppReady() {
        dispatchEvent(new Event("app-ready.wr"));
    }

    wrUseAppReady(useAppReady) {
        if (typeof useAppReady != "undefined") {
            wire.ui.customElements.useAppReady = useAppReady;
            wire.ui.customElements.appReady = false;
        }
        return wire.ui.customElements.useAppReady;
    }

    wrEventReady() {
      new wire.ui.Component().eventReady({source: this, element: this});
    }

    wrEventDataBind(data) {
      new wire.ui.Component().eventDataBind({source: this, element: this, data: data});
    }

    get wrIsAppReady() {
        return (wire.ui.customElements.useAppReady ? wire.ui.customElements.appReady : true);
    }    

    get wrApp(){
        return wire.ui.customElements.appState;
    }
  
    set wrApp(app){
      wire.ui.customElements.appReady = true;
      wire.ui.customElements.appState = app;
    }

    static wrGetApp(){
      return wire.ui.customElements.appState;
    }
  
    wrObjectChanged(obj, name) {
    }

    get wrProps(){
      return this.wrAttrib;
    }

    get wrAttrib() {

        //
        // Transform all attributes into a config object
        //

        var cfg = {};

        for (let i = 0; i < this.attributes.length; i++) {

            const attr = this.attributes[i];

            //if (attr.value.indexOf("wr-") == -1) {

                const num = attr.name.split("-").length;

                const f = wire.isBoolean;

                const json = `{"${attr.name.replaceAll('-', '":{"')}":${f(attr.value)?'':'"'}${attr.value}${f(attr.value)?'':'"'}${'}'.repeat(num)}`;
                
                wire.merge(cfg, JSON.parse(json));

            //}

        }

        cfg = wire.merge(this.constructor.propertyDefaults, cfg);

        if(this._wrProps)
            return wire.merge(this._wrProps, cfg);
        else
            return cfg;

    }
    
    //
    // Merged with wrAttrib
    //
    static get propertyDefaults() {
        return {};
    }    

    static get template() {
        return "<div></div>";
    }

    templateUrl() {
      return null;
    }

    templateId() {
      return null;
    }

    templateContainer() {
      return null;
    }

    styleUrl() {
      return null;
    }    

}

//
// Wire Component - wraps any WireBootstrap component
//

class WireWebComponent extends WebComponent {

    constructor() {
        super();
        // queue if wrObjectChanged called before this component was added to the DOM
        // or when waiting for app init to complete
        this._objChanged = null;
        this._component = null;
        this._firstChild = null;
    }

    connectedCallback() {

        super.connectedCallback();

        if (this._objChanged && super.wrIsAppReady)
            this._render(this._objChanged.obj, this._objChanged.name);
    }

    async wrAppReady() {

        if (this._objChanged)
            this._render(this._objChanged.obj, this._objChanged.name);

    }

    wrObjectChanged(obj, name) {       
        
        super.wrObjectChanged(obj, name);
       
        if (this.firstChild && super.wrIsAppReady)
            this._render(obj, name);
        else
            this._objChanged = {obj: obj, name: name};
    }
        
    wrRender(config) {

        this._render(config, "config");
        return this.wrComponent;

    }

    _render(obj, name) {
       
        let config = this.wrAttrib;

        config = config || {};

        if(name == "config")
            config = wire.merge(obj, config);
        else
            config[name] = obj;

        if(!config.component) 
            throw `Missing 'component' attribute on ${this.name}`;
        else {

            if(!this._component)
                this._component = wire.ui.Component.create(config.component);        

            if(!this._firstChild)
                this._firstChild = this.firstChild;

            this._component.render(this._firstChild, config);

        }

        this._objChanged = null;

    }

    get wrComponent() {
        return this._component;
    }    
    
    static get properties() {
        return {
            data: true,
            config: true            
        }
    }

  }

  customElements.define('wire-component', WireWebComponent);


//
// Web components state management
//

wire.ui.customElements = wire.ui.customElements || {
    appReady: null,
    appState: null,
    useAppReady: false
};


//
// Namespace objects
//
wire.ui.bind = tinybind.bind;
wire.ui.WebComponent = WebComponent;
wire.ui.WireWebComponent = WireWebComponent;