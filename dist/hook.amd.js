define(['exports'], function (exports) { 'use strict';

    var IEvent;

    var IEventOptions;

    var Event = (function () {
        function Event(options) {
            if (options === void 0) { options = {}; }
            this.eventName = '';
            this.isCancelled = false;
            this.isDefaultPrevented = false;
            this.isPropagationStopped = false;
            if (typeof options === 'string') {
                this.eventName = options;
            }
            else if (options != null) {
                var _a = options.eventName, eventName = _a === void 0 ? this.eventName : _a, _b = options.isDefaultPrevented, isDefaultPrevented = _b === void 0 ? this.isDefaultPrevented : _b, _c = options.isCancelled, isCancelled = _c === void 0 ? this.isCancelled : _c, _d = options.isPropagationStopped, isPropagationStopped = _d === void 0 ? this.isPropagationStopped : _d;
                this.eventName = eventName;
                this.isDefaultPrevented = isDefaultPrevented;
                this.isCancelled = isCancelled;
                this.isPropagationStopped = isPropagationStopped;
            }
        }
        Event.prototype.preventDefault = function () {
            this.isDefaultPrevented = true;
        };
        Event.prototype.cancel = function () {
            this.isCancelled = true;
        };
        Event.prototype.stopPropagation = function () {
            this.isPropagationStopped = true;
        };
        Event.prototype.hasNamespaces = function () {
            return !!~this.eventName.indexOf('.');
        };
        Event.prototype.getNamespaces = function () {
            var events = this.eventName.split(' ');
            var results = [];
            var event, namespaces;
            for (var i = 0; i < events.length; i++) {
                event = events[i];
                namespaces = event.split('.');
                namespaces.shift(); // remove the eventName
                results = results.concat(namespaces);
            }
            return results;
        };
        Event.prototype.hasEventName = function () {
            return this.getEventName() !== '';
        };
        Event.prototype.getEventName = function () {
            return this.eventName.split('.')[0];
        };
        return Event;
    }());

    var NamespacedHandler = (function () {
        function NamespacedHandler(event, handler) {
            this.handler = handler;
            this.namespaces = event.getNamespaces();
            this.eventName = event.getEventName();
        }
        NamespacedHandler.prototype.matches = function (event) {
            var eventName = event.getEventName();
            var namespaces;
            if (!(eventName === this.eventName || eventName === '')) {
                return false;
            }
            namespaces = event.getNamespaces();
            for (var i = 0; i < namespaces.length; i++) {
                var namespace = namespaces[i];
                if (!(~this.namespaces.indexOf(namespace))) {
                    return false;
                }
            }
            return true;
        };
        return NamespacedHandler;
    }());

    var Handle = (function () {
        function Handle() {
            this.events = {};
            this.namespacedHandlers = [];
            this.namespacedEvents = [];
        }
        Handle.prototype._getEventsArr = function (event) {
            return this.events[event.eventName];
        };
        Handle.prototype._splitEvent = function (event, origArgs, methodName) {
            var args, eventNames;
            eventNames = event.eventName.split(' ');
            for (var i = 0; i < eventNames.length; i++) {
                args = Array.prototype.slice.call(origArgs, 0);
                args[0] = new Event(args[0]);
                args[0].eventName = eventNames[i];
                this[methodName].apply(this, args);
            }
        };
        Handle.prototype.addHandler = function (event, handler) {
            if (~event.eventName.split('').indexOf(' ')) {
                this._splitEvent(event, arguments, 'addHandler');
                return;
            }
            if (!event.hasNamespaces()) {
                var eventArr = this._getEventsArr(event);
                if (eventArr) {
                    eventArr.push(handler);
                }
                else {
                    this.events[event.eventName] = [];
                    this.addHandler.apply(this, arguments);
                }
            }
            else {
                if (event.hasEventName()) {
                    this.namespacedEvents.push(event.getEventName());
                }
                this.namespacedHandlers.push(new NamespacedHandler(event, handler));
            }
        };
        Handle.prototype.removeHandler = function (event, handler) {
            var i;
            if (event != null && ~event.eventName.split('').indexOf(' ')) {
                this._splitEvent(event, arguments, 'removeHandler');
                return;
            }
            if (event == null && handler == null) {
                this.namespacedHandlers = [];
                for (var eventName in this.events) {
                    if (this.events.hasOwnProperty(eventName)) {
                        this.events[eventName] = [];
                    }
                }
                return;
            }
            if (!event.hasNamespaces()) {
                if (event != null && handler != null && typeof handler === 'function') {
                    var eventArr = this._getEventsArr(event);
                    if (typeof eventArr !== 'undefined' && eventArr !== null) {
                        eventArr.splice(eventArr.indexOf(handler), 1);
                    }
                }
                else if (event != null && handler == null) {
                    this.events[event.eventName] = [];
                }
            }
            else {
                if (event != null && handler != null && typeof handler === 'function') {
                    i = 0;
                    while (true) {
                        if (this.namespacedHandlers[i].handler === handler) {
                            this.namespacedHandlers.splice(i, 1);
                        }
                        i++;
                        if (i >= this.namespacedHandlers.length) {
                            break;
                        }
                    }
                }
                else if (event != null && handler == null) {
                    i = 0;
                    while (true) {
                        if (this.namespacedHandlers[i].matches(event)) {
                            this.namespacedHandlers.splice(i, 1);
                        }
                        i++;
                        if (i >= this.namespacedHandlers.length) {
                            break;
                        }
                    }
                }
            }
        };
        Handle.prototype.triggerHandlers = function (obj, event, data) {
            if (data === void 0) { data = []; }
            if (~event.eventName.split('').indexOf(' ')) {
                this._splitEvent(event, arguments, 'triggerHandlers');
                return;
            }
            event.data = data;
            if (!Array.isArray(data)) {
                data = [data];
            }
            var handlerArgs = [event].concat(data);
            if (!event.hasNamespaces()) {
                var eventArr = this._getEventsArr(event);
                if (eventArr != null) {
                    for (var i = 0; i < eventArr.length; i++) {
                        eventArr[i].apply(obj, handlerArgs);
                    }
                }
            }
            if (!event.hasEventName() || ~this.namespacedEvents.indexOf(event.getEventName())) {
                var handler = void 0;
                for (var i = 0; i < this.namespacedHandlers.length; i++) {
                    handler = this.namespacedHandlers[i];
                    if (handler.matches(event)) {
                        handler.handler.apply(obj, handlerArgs);
                    }
                }
            }
        };
        return Handle;
    }());

    exports.IEvent = IEvent;
    exports.IEventOptions = IEventOptions;
    exports.Event = Event;
    exports.NamespacedHandler = NamespacedHandler;
    exports.Handle = Handle;

});