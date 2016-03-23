/// <reference path="../typings/main.d.ts" />
import { ok, equal, deepEqual } from 'assert'
import { Event, Handle, NamespacedHandler } from '../src/hook'

describe('Event', () => {
	let event

	beforeEach(() => {
		event = new Event()
	})

	describe('.constructor([options])', () => {
		it('should handle no options', () => {
			ok(event.eventName === '')
			ok(event.isDefaultPrevented === false)
			ok(event.isCancelled === false)
			ok(event.isPropagationStopped === false)
		})

		it('should handle the string parameter correctly', () => {
			event = new Event('customEvent')
			ok(event.eventName === 'customEvent')
			ok(event.isDefaultPrevented === false)
			ok(event.isCancelled === false)
			ok(event.isPropagationStopped === false)
		})

		it('should handle the object parameter correctly', () => {
			event = new Event({
				eventName: 'customEvent',
				isDefaultPrevented: true,
				isCancelled: true,
				isPropagationStopped: true,
			})

			ok(event.eventName === 'customEvent')
			ok(event.isDefaultPrevented === true)
			ok(event.isCancelled === true)
			ok(event.isPropagationStopped === true)
		})
	})

	describe('.preventDefault()', () => {
		it('should not prevent by default', () => {
			ok(event.eventName === '')
			ok(event.isDefaultPrevented === false)
			ok(event.isCancelled === false)
			ok(event.isPropagationStopped === false)
		})

		it('should preventDefault', () => {
			event.preventDefault()

			ok(event.eventName === '')
			ok(event.isDefaultPrevented === true)
			ok(event.isCancelled === false)
			ok(event.isPropagationStopped === false)
		})
	})

	describe('.cancel()', () => {
		it('should not cancel by default', () => {
			ok(event.eventName === '')
			ok(event.isDefaultPrevented === false)
			ok(event.isCancelled === false)
			ok(event.isPropagationStopped === false)
		})

		it('should cancel', () => {
			event.cancel()

			ok(event.eventName === '')
			ok(event.isDefaultPrevented === false)
			ok(event.isCancelled === true)
			ok(event.isPropagationStopped === false)
		})
	})

	describe('.stopPropagation()', () => {
		it('should not stop propagation by default', () => {
			ok(event.eventName === '')
			ok(event.isDefaultPrevented === false)
			ok(event.isCancelled === false)
			ok(event.isPropagationStopped === false)
		})

		it('should stop propagation', () => {
			event.stopPropagation()

			ok(event.eventName === '')
			ok(event.isDefaultPrevented === false)
			ok(event.isCancelled === false)
			ok(event.isPropagationStopped === true)
		})
	})

	describe('.hasNamespaces()', () => {
		it('should be negative for no namespaces', () => {
			event.eventName = 'event'
			equal(event.hasNamespaces(), false)
		})

		it('should be positive for one namespace', () => {
			event.eventName = 'event.namespace'
			equal(event.hasNamespaces(), true)
		})

		it('should be positive for multiple namespaces', () => {
			event.eventName = 'event.namespace.namespace2'
			equal(event.hasNamespaces(), true)
		})
	})

	describe('.getNamespaces()', () => {
		it('should handle no namespaces with an eventName', () => {
			event.eventName = 'event'
			deepEqual(event.getNamespaces(), [])
		})

		it('should handle one namespace with an eventName', () => {
			event.eventName = 'event.namespace'
			deepEqual(event.getNamespaces(), ['namespace'])
		})

		it('should handle multiple namespaces with an eventName', () => {
			event.eventName = 'event.namespace.namespace2'
			deepEqual(event.getNamespaces(), ['namespace', 'namespace2'])
		})

		it('should handle no namespaces without an eventName', () => {
			event.eventName = ''
			deepEqual(event.getNamespaces(), [])
		})

		it('should handle one namespace without an eventName', () => {
			event.eventName = '.namespace'
			deepEqual(event.getNamespaces(), ['namespace'])
		})

		it('should handle multiple namespaces without an eventName', () => {
			event.eventName = '.namespace.namespace2'
			deepEqual(event.getNamespaces(), ['namespace', 'namespace2'])
		})
	})

	describe('.hasEventName()', () => {
		it('should handle empty eventNames', () => {
			event.eventName = ''
			equal(event.hasEventName(), false)
		})

		it('should handle eventNames without namespaces', () => {
			event.eventName = 'event'
			equal(event.hasEventName(), true)
		})

		it('should handle eventNames with namespaces', () => {
			event.eventName = 'event.namespace'
			equal(event.hasEventName(), true)
		})

		it('should handle eventNames with namespaces but without eventNames', () => {
			event.eventName = '.namespace'
			equal(event.hasEventName(), false)
		})
	})

	describe('.getEventName()', () => {
		it('should handle empty eventNames', () => {
			event.eventName = ''
			equal(event.getEventName(), '')
		})

		it('should handle eventNames without namespaces', () => {
			event.eventName = 'event'
			equal(event.getEventName(), 'event')
		})

		it('should handle eventNames with namespaces', () => {
			event.eventName = 'event.namespace'
			equal(event.getEventName(), 'event')
		})

		it('should handle eventNames with namespaces but without eventNames', () => {
			event.eventName = '.namespace'
			equal(event.getEventName(), '')
		})
	})
})

describe('Handle', () => {
	let handle, event

	beforeEach(() => {
		handle = new Handle()
		event = new Event("customEvent")
	})

	describe(".constructor()", () => {
		it('should setup the object correctly', () => {
			deepEqual(handle.events, {})
			deepEqual(handle.namespacedHandlers, [])
		})
	})

	describe(".addHandler(event, handler)", () => {
		let handler1, handler2

		handler1 = () => {}
		handler2 = () => {}

		it('should add a handler to a new Handle with unnamespaced EventNames', () => {
			handle.addHandler(event, handler1)
			ok(Array.isArray(handle.events.customEvent))
			deepEqual(handle.namespacedHandlers, [])
			equal(handle.events.customEvent.length, 1)
			equal(handle.events.customEvent[0], handler1)
		})

		it('should add multiple handlers to a new Handle with unnamespaced EventNames', () => {
			handle.addHandler(event, handler1)
			handle.addHandler(event, handler2)
			ok(Array.isArray(handle.events.customEvent))
			deepEqual(handle.namespacedHandlers, [])
			equal(handle.events.customEvent.length, 2)
			equal(handle.events.customEvent[0], handler1)
			equal(handle.events.customEvent[1], handler2)
		})

		it('should add a handler to a new Handle with multiple unnamespaced EventNames', () => {
			event.eventName = "customEvent customEvent2"

			handle.addHandler(event, handler1)
			ok(Array.isArray(handle.events.customEvent))
			ok(Array.isArray(handle.events.customEvent2))
			deepEqual(handle.namespacedHandlers, [])
			equal(handle.events.customEvent.length, 1)
			equal(handle.events.customEvent[0], handler1)
			equal(handle.events.customEvent2.length, 1)
			equal(handle.events.customEvent2[0], handler1)
		})

		// TODO: Add multiple events test cases

		it('should add a handler to a new Handle with namespaced EventNames', () => {
			event.eventName = "customEvent.namespace"

			handle.addHandler(event, handler1)
			deepEqual(handle.events, {})
			ok(Array.isArray(handle.namespacedHandlers))
			deepEqual(handle.namespacedHandlers[0], new NamespacedHandler(event, handler1))
		})

		// TODO: Add multiple events test cases
	})

	describe(".removeHandler()", () => {
		let handler1, handler2

		handler1 = () => {}
		handler2 = () => {}

		it('should remove all handlers', () => {
			handle.addHandler(event, handler1)
			handle.removeHandler()
			deepEqual(handle.events, { customEvent: [] })
			deepEqual(handle.namespacedHandlers, [])

			handle.addHandler(event, handler1)
			handle.addHandler(event, handler2)
			handle.removeHandler()
			deepEqual(handle.events, { customEvent: [] })
			deepEqual(handle.namespacedHandlers, [])
		})
	})

	describe(".removeHandler(event)", () => {
		let handler1, handler2

		handler1 = () => {}
		handler2 = () => {}

		it('should remove all handlers for an event', () => {
			event.eventName = "customEvent"
			handle.addHandler(event, handler1)
			handle.removeHandler(event)
			deepEqual(handle.events, { customEvent: [] })
			deepEqual(handle.namespacedHandlers, [])
		})

		it('should remove all handlers for an event with multiple eventNames', () => {
			event.eventName = "customEvent customEvent2"
			handle.addHandler(event, handler1)
			handle.removeHandler(event)
			deepEqual(handle.events, { customEvent: [], customEvent2: [] })
			deepEqual(handle.namespacedHandlers, [])
		})

		it('should remove all handlers for an namespaced Events', () => {
			event.eventName = "customEvent.namespace"
			handle.addHandler(event, handler1)
			handle.removeHandler(event)
			deepEqual(handle.events, {})
			deepEqual(handle.namespacedHandlers, [])
		})
	})

	describe(".removeHandler(event, handler)", () => {
		var handler1, handler2

		handler1 = () => {}
		handler2 = () => {}

		it('should remove only specified handlers', () => {
			handle.addHandler(event, handler1)
			handle.addHandler(event, handler2)

			handle.removeHandler(event, handler1)
			ok(Array.isArray(handle.events.customEvent))
			deepEqual(handle.namespacedHandlers, [])
			equal(handle.events.customEvent.length, 1)
			equal(handle.events.customEvent[0], handler2)

			handle.removeHandler(event, handler2)

			deepEqual(handle.events, { customEvent: [] })
			deepEqual(handle.namespacedHandlers, [])
		})
	})

	describe(".triggerHandlers(event)", () => {
		let data, handler1, handler2, obj

		obj = {}
		data = {}

		//TODO: Improve those async tests

		it('should trigger handlers for all events', () => {
			handler1 = (e) => {
				ok(true)
				equal(e, event)
			}

			handler2 = (e, passedData) => {
				handler1(e, passedData)
				equal(data, passedData)
			}

			handle.addHandler(event, handler1)
			handle.triggerHandlers(obj, event)

			handle.addHandler(event, handler1)
			handle.triggerHandlers(obj, event)

			handle.removeHandler(event)
			handle.addHandler(event, handler2)
			handle.triggerHandlers(obj, event, [data])

			handle.removeHandler()
			handle.addHandler(event, handler1)
			event.eventName = "customEvent.namespace"

			handle.addHandler(event, handler1)
			handle.triggerHandlers(obj, event)

			event.eventName = "customEvent"
			handle.triggerHandlers(obj, event)

			event.eventName = "customEvent.namespace.namespace2"
			handle.addHandler(event, handler1)
			event.eventName = "namespace.namespace2"
			handle.triggerHandlers(obj, event)

			event.eventName = "event.namespace"

			handle.addHandler(event, handler1)
			event.eventName = "event"
			handle.triggerHandlers(obj, event)
		})
	})
})

describe('NamespacedHandler', () => {
	describe(".matches", () => {
		let event, handler
		event = new Event("event.namespace")
		handler = new NamespacedHandler(event, () => {})

		it('should match the eventName', () => {
			equal(handler.matches(new Event("event")), true)
		})

		it('should match the namespace', () => {
			equal(handler.matches(new Event(".namespace")), true)
		})

		it('should match the eventName and namespace', () => {
			equal(handler.matches(new Event("event.namespace")), true)
		})

		it('should not match incorrect namespace', () => {
			equal(handler.matches(new Event(".nonamespace")), false)
		})

		it('should not match correct eventName and incorrect namespace', () => {
			equal(handler.matches(new Event("event.nonamespace")), false)
		})

		it('should not match correct eventName and namespace with additional incorrect namespace', () => {
			equal(handler.matches(new Event("event.namespace.namespace2")), false)
		})
	})
})
