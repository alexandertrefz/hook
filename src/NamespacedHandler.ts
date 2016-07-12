import { IEvent } from './interfaces'

export class NamespacedHandler {
	public namespaces: Array<string>
	public eventName: string
	public handler: Function

	constructor(event: IEvent, handler: Function) {
		this.handler = handler
		this.namespaces = event.getNamespaces()
		this.eventName = event.getEventName()
	}

	public matches(event: IEvent): boolean {
		let eventName = event.getEventName()
		let namespaces

		if (!(eventName === this.eventName || eventName === '')) {
			return false
		}

		namespaces = event.getNamespaces()

		for (let i = 0; i < namespaces.length; i++) {
			let namespace = namespaces[i]

			if (!(~this.namespaces.indexOf(namespace))) {
				return false
			}
		}

		return true
	}
}
