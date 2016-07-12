import { IEvent } from './interfaces'

import Event from './Event'
import NamespacedHandler from './NamespacedHandler'

export default class Handle {
	public events: Object
	public namespacedHandlers: Array<NamespacedHandler>
	public namespacedEvents: Array<string>

	constructor() {
		this.events = {}
		this.namespacedHandlers = []
		this.namespacedEvents = []
	}

	private _getEventsArr(event: IEvent): Array<Function> {
		return this.events[event.eventName]
	}

	private _splitEvent(event: IEvent, origArgs: any, methodName: string): void {
		let args, eventNames
		eventNames = event.eventName.split(' ')

		for (let i = 0; i < eventNames.length; i++) {
			args = Array.prototype.slice.call(origArgs, 0)
			args[0] = new Event(args[0])
			args[0].eventName = eventNames[i]
			this[methodName].apply(this, args)
		}
	}

	public addHandler(event: IEvent, handler: Function): void {
		if (~event.eventName.split('').indexOf(' ')) {
			this._splitEvent(event, arguments, 'addHandler')
			return
		}

		if (!event.hasNamespaces()) {
			let eventArr = this._getEventsArr(event)

			if (eventArr) {
				eventArr.push(handler)
			} else {
				this.events[event.eventName] = []
				this.addHandler.apply(this, arguments)
			}
		} else {
			if (event.hasEventName()) {
				this.namespacedEvents.push(event.getEventName())
			}

			this.namespacedHandlers.push(new NamespacedHandler(event, handler))
		}
	}

	public removeHandler(event?: IEvent, handler?: Function): void {
		let i

		if (event != null && ~event.eventName.split('').indexOf(' ')) {
			this._splitEvent(event, arguments, 'removeHandler')
			return
		}

		if (event == null && handler == null) {
			this.namespacedHandlers = []

			for (let eventName in this.events) {
				if (this.events.hasOwnProperty(eventName)) {
					this.events[eventName] = []
				}
			}

			return
		}

		if (!event.hasNamespaces()) {
			if (event != null && handler != null && typeof handler === 'function') {
				let eventArr = this._getEventsArr(event)
				if (typeof eventArr !== 'undefined' && eventArr !== null) {
					eventArr.splice(eventArr.indexOf(handler), 1)
				}
			} else if (event != null && handler == null) {
				this.events[event.eventName] = []
			}
		} else {
			if (event != null && handler != null && typeof handler === 'function') {
				i = 0
				while (true) {
					if (this.namespacedHandlers[i].handler === handler) {
						this.namespacedHandlers.splice(i, 1)
					}

					i++
					if (i >= this.namespacedHandlers.length) {
						break
					}
				}
			} else if (event != null && handler == null) {
				i = 0
				while (true) {
					if (this.namespacedHandlers[i].matches(event)) {
						this.namespacedHandlers.splice(i, 1)
					}

					i++
					if (i >= this.namespacedHandlers.length) {
						break
					}
				}
			}
		}
	}

	public triggerHandlers(obj: any, event: IEvent, data: Array<any> = []): void {
		if (~event.eventName.split('').indexOf(' ')) {
			this._splitEvent(event, arguments, 'triggerHandlers')
			return
		}

		event.data = data

		if (!Array.isArray(data)) {
			data = [data]
		}

		let handlerArgs = [event, ...data]

		if (!event.hasNamespaces()) {
			let eventArr = this._getEventsArr(event)

			if (eventArr != null) {
				for (let i = 0; i < eventArr.length; i++) {
					eventArr[i].apply(obj, handlerArgs)
				}
			}
		}

		if (!event.hasEventName() || ~this.namespacedEvents.indexOf(event.getEventName())) {
			let handler
			for (let i = 0; i < this.namespacedHandlers.length; i++) {
				handler = this.namespacedHandlers[i]
				if (handler.matches(event)) {
					handler.handler.apply(obj, handlerArgs)
				}
			}
		}
	}
}
