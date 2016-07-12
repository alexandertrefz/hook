let IEvent, IEventOptions

interface IEvent {
	eventName: string
	isDefaultPrevented: boolean
	isCancelled: boolean
	isPropagationStopped: boolean
	data: Array<any>
	preventDefault(): void
	cancel(): void
	stopPropagation(): void
	hasNamespaces(): boolean
	getNamespaces(): Array<string>
	hasEventName(): boolean
	getEventName(): string
}

interface IEventOptions {
	eventName?: string
	isDefaultPrevented?: boolean
	isCancelled?: boolean
	isPropagationStopped?: boolean
}

export { IEvent, IEventOptions }