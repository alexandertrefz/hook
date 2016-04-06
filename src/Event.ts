import { IEvent } from './interfaces/IEvent'
import { IEventOptions } from './interfaces/IEventOptions'

export class Event implements IEvent, IEventOptions {
	public eventName: string
	public isDefaultPrevented: boolean
	public isCancelled: boolean
	public isPropagationStopped: boolean
	public data: any

	constructor(options: IEventOptions | string = {}) {
		this.eventName = ''
		this.isCancelled = false
		this.isDefaultPrevented = false
		this.isPropagationStopped = false

		if (typeof options === 'string') {
			this.eventName = options
		} else if (options != null) {
			let {
				eventName = this.eventName,
				isDefaultPrevented = this.isDefaultPrevented,
				isCancelled = this.isCancelled,
				isPropagationStopped = this.isPropagationStopped,
			} = options

			this.eventName = eventName
			this.isDefaultPrevented = isDefaultPrevented
			this.isCancelled = isCancelled
			this.isPropagationStopped = isPropagationStopped
		}
	}

	public preventDefault(): void {
		this.isDefaultPrevented = true
	}

	public cancel(): void {
		this.isCancelled = true
	}

	public stopPropagation(): void {
		this.isPropagationStopped = true
	}

	public hasNamespaces(): boolean {
		return !!~this.eventName.indexOf('.')
	}

	public getNamespaces(): string[] {
		let events = this.eventName.split(' ')
		let results = []
		let event, namespaces

		for (let i = 0; i < events.length; i++) {
			event = events[i]
			namespaces = event.split('.')
			namespaces.shift() // remove the eventName
			results = results.concat(namespaces)
		}

		return results
	}

	public hasEventName(): boolean {
		return this.getEventName() !== ''
	}

	public getEventName(): string {
		return this.eventName.split('.')[0]
	}
}
