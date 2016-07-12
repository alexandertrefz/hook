let IEvent;
let IEventOptions;

class Event {
    constructor(options = {}) {
        this.eventName = '';
        this.isCancelled = false;
        this.isDefaultPrevented = false;
        this.isPropagationStopped = false;
        if (typeof options === 'string') {
            this.eventName = options;
        }
        else {
            let { eventName = this.eventName, isDefaultPrevented = this.isDefaultPrevented, isCancelled = this.isCancelled, isPropagationStopped = this.isPropagationStopped, } = options;
            this.eventName = eventName;
            this.isDefaultPrevented = isDefaultPrevented;
            this.isCancelled = isCancelled;
            this.isPropagationStopped = isPropagationStopped;
        }
    }
    preventDefault() {
        this.isDefaultPrevented = true;
    }
    cancel() {
        this.isCancelled = true;
    }
    stopPropagation() {
        this.isPropagationStopped = true;
    }
    hasNamespaces() {
        return !!~this.eventName.indexOf('.');
    }
    getNamespaces() {
        let events = this.eventName.split(' ');
        let results = [];
        let event, namespaces;
        for (let i = 0; i < events.length; i++) {
            event = events[i];
            namespaces = event.split('.');
            namespaces.shift(); // remove the eventName
            results = results.concat(namespaces);
        }
        return results;
    }
    hasEventName() {
        return this.getEventName() !== '';
    }
    getEventName() {
        return this.eventName.split('.')[0];
    }
}

class NamespacedHandler {
    constructor(event, handler) {
        this.handler = handler;
        this.namespaces = event.getNamespaces();
        this.eventName = event.getEventName();
    }
    matches(event) {
        let eventName = event.getEventName();
        let namespaces;
        if (!(eventName === this.eventName || eventName === '')) {
            return false;
        }
        namespaces = event.getNamespaces();
        for (let i = 0; i < namespaces.length; i++) {
            let namespace = namespaces[i];
            if (!(~this.namespaces.indexOf(namespace))) {
                return false;
            }
        }
        return true;
    }
}

class Handle {
    constructor() {
        this.events = {};
        this.namespacedHandlers = [];
        this.namespacedEvents = [];
    }
    _getEventsArr(event) {
        return this.events[event.eventName];
    }
    _splitEvent(event, origArgs, methodName) {
        let args, eventNames;
        eventNames = event.eventName.split(' ');
        for (let i = 0; i < eventNames.length; i++) {
            args = Array.prototype.slice.call(origArgs, 0);
            args[0] = new Event(args[0]);
            args[0].eventName = eventNames[i];
            this[methodName].apply(this, args);
        }
    }
    addHandler(event, handler) {
        if (~event.eventName.split('').indexOf(' ')) {
            this._splitEvent(event, arguments, 'addHandler');
            return;
        }
        if (!event.hasNamespaces()) {
            let eventArr = this._getEventsArr(event);
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
    }
    removeHandler(event, handler) {
        let i;
        if (event !== undefined && ~event.eventName.split('').indexOf(' ')) {
            this._splitEvent(event, arguments, 'removeHandler');
            return;
        }
        if (event === undefined && handler === undefined) {
            this.namespacedHandlers = [];
            for (let eventName in this.events) {
                if (this.events.hasOwnProperty(eventName)) {
                    this.events[eventName] = [];
                }
            }
            return;
        }
        if (event === undefined) {
            return;
        }
        if (!event.hasNamespaces()) {
            if (typeof handler === 'function') {
                let eventArr = this._getEventsArr(event);
                if (typeof eventArr !== 'undefined') {
                    eventArr.splice(eventArr.indexOf(handler), 1);
                }
            }
            else {
                this.events[event.eventName] = [];
            }
        }
        else {
            i = 0;
            while (true) {
                if (typeof handler === 'function') {
                    if (this.namespacedHandlers[i].handler === handler) {
                        this.namespacedHandlers.splice(i, 1);
                    }
                }
                else {
                    if (this.namespacedHandlers[i].matches(event)) {
                        this.namespacedHandlers.splice(i, 1);
                    }
                }
                i++;
                if (i >= this.namespacedHandlers.length) {
                    break;
                }
            }
        }
    }
    triggerHandlers(obj, event, data = []) {
        if (~event.eventName.split('').indexOf(' ')) {
            this._splitEvent(event, arguments, 'triggerHandlers');
            return;
        }
        event.data = data;
        if (!Array.isArray(data)) {
            data = [data];
        }
        let handlerArgs = [event, ...data];
        if (!event.hasNamespaces()) {
            let eventArr = this._getEventsArr(event);
            if (eventArr !== undefined) {
                for (let i = 0; i < eventArr.length; i++) {
                    eventArr[i].apply(obj, handlerArgs);
                }
            }
        }
        if (!event.hasEventName() || ~this.namespacedEvents.indexOf(event.getEventName())) {
            let handler;
            for (let i = 0; i < this.namespacedHandlers.length; i++) {
                handler = this.namespacedHandlers[i];
                if (handler.matches(event)) {
                    handler.handler.apply(obj, handlerArgs);
                }
            }
        }
    }
}

export { IEvent, IEventOptions, Event, NamespacedHandler, Handle };