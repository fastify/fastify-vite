
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
//#region ../../../node_modules/.pnpm/react@19.1.0/node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({ "../../../node_modules/.pnpm/react@19.1.0/node_modules/react/cjs/react.development.js"(exports, module) {
	(function() {
		function defineDeprecationWarning(methodName, info) {
			Object.defineProperty(Component.prototype, methodName, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
			} });
		}
		function getIteratorFn(maybeIterable) {
			if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
			maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
			return "function" === typeof maybeIterable ? maybeIterable : null;
		}
		function warnNoop(publicInstance, callerName) {
			publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
			var warningKey = publicInstance + "." + callerName;
			didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, publicInstance), didWarnStateUpdateForUnmountedComponent[warningKey] = !0);
		}
		function Component(props, context, updater) {
			this.props = props;
			this.context = context;
			this.refs = emptyObject;
			this.updater = updater || ReactNoopUpdateQueue;
		}
		function ComponentDummy() {}
		function PureComponent(props, context, updater) {
			this.props = props;
			this.context = context;
			this.refs = emptyObject;
			this.updater = updater || ReactNoopUpdateQueue;
		}
		function testStringCoercion(value) {
			return "" + value;
		}
		function checkKeyStringCoercion(value) {
			try {
				testStringCoercion(value);
				var JSCompiler_inline_result = !1;
			} catch (e) {
				JSCompiler_inline_result = !0;
			}
			if (JSCompiler_inline_result) {
				JSCompiler_inline_result = console;
				var JSCompiler_temp_const = JSCompiler_inline_result.error;
				var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
				JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
				return testStringCoercion(value);
			}
		}
		function getComponentNameFromType(type) {
			if (null == type) return null;
			if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
			if ("string" === typeof type) return type;
			switch (type) {
				case REACT_FRAGMENT_TYPE: return "Fragment";
				case REACT_PROFILER_TYPE: return "Profiler";
				case REACT_STRICT_MODE_TYPE: return "StrictMode";
				case REACT_SUSPENSE_TYPE: return "Suspense";
				case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
				case REACT_ACTIVITY_TYPE: return "Activity";
			}
			if ("object" === typeof type) switch ("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof) {
				case REACT_PORTAL_TYPE: return "Portal";
				case REACT_CONTEXT_TYPE: return (type.displayName || "Context") + ".Provider";
				case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
				case REACT_FORWARD_REF_TYPE:
					var innerType = type.render;
					type = type.displayName;
					type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
					return type;
				case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
				case REACT_LAZY_TYPE:
					innerType = type._payload;
					type = type._init;
					try {
						return getComponentNameFromType(type(innerType));
					} catch (x) {}
			}
			return null;
		}
		function getTaskName(type) {
			if (type === REACT_FRAGMENT_TYPE) return "<>";
			if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
			try {
				var name = getComponentNameFromType(type);
				return name ? "<" + name + ">" : "<...>";
			} catch (x) {
				return "<...>";
			}
		}
		function getOwner() {
			var dispatcher = ReactSharedInternals.A;
			return null === dispatcher ? null : dispatcher.getOwner();
		}
		function UnknownOwner() {
			return Error("react-stack-top-frame");
		}
		function hasValidKey(config) {
			if (hasOwnProperty.call(config, "key")) {
				var getter = Object.getOwnPropertyDescriptor(config, "key").get;
				if (getter && getter.isReactWarning) return !1;
			}
			return void 0 !== config.key;
		}
		function defineKeyPropWarningGetter(props, displayName) {
			function warnAboutAccessingKey() {
				specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
			}
			warnAboutAccessingKey.isReactWarning = !0;
			Object.defineProperty(props, "key", {
				get: warnAboutAccessingKey,
				configurable: !0
			});
		}
		function elementRefGetterWithDeprecationWarning() {
			var componentName = getComponentNameFromType(this.type);
			didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
			componentName = this.props.ref;
			return void 0 !== componentName ? componentName : null;
		}
		function ReactElement(type, key, self, source, owner, props, debugStack, debugTask) {
			self = props.ref;
			type = {
				$$typeof: REACT_ELEMENT_TYPE,
				type,
				key,
				props,
				_owner: owner
			};
			null !== (void 0 !== self ? self : null) ? Object.defineProperty(type, "ref", {
				enumerable: !1,
				get: elementRefGetterWithDeprecationWarning
			}) : Object.defineProperty(type, "ref", {
				enumerable: !1,
				value: null
			});
			type._store = {};
			Object.defineProperty(type._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			});
			Object.defineProperty(type, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			});
			Object.defineProperty(type, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugStack
			});
			Object.defineProperty(type, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugTask
			});
			Object.freeze && (Object.freeze(type.props), Object.freeze(type));
			return type;
		}
		function cloneAndReplaceKey(oldElement, newKey) {
			newKey = ReactElement(oldElement.type, newKey, void 0, void 0, oldElement._owner, oldElement.props, oldElement._debugStack, oldElement._debugTask);
			oldElement._store && (newKey._store.validated = oldElement._store.validated);
			return newKey;
		}
		function isValidElement(object) {
			return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
		}
		function escape(key) {
			var escaperLookup = {
				"=": "=0",
				":": "=2"
			};
			return "$" + key.replace(/[=:]/g, function(match) {
				return escaperLookup[match];
			});
		}
		function getElementKey(element, index) {
			return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
		}
		function noop$1() {}
		function resolveThenable(thenable) {
			switch (thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
				default: switch ("string" === typeof thenable.status ? thenable.then(noop$1, noop$1) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
					"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
				}, function(error) {
					"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
				})), thenable.status) {
					case "fulfilled": return thenable.value;
					case "rejected": throw thenable.reason;
				}
			}
			throw thenable;
		}
		function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
			var type = typeof children;
			if ("undefined" === type || "boolean" === type) children = null;
			var invokeCallback = !1;
			if (null === children) invokeCallback = !0;
			else switch (type) {
				case "bigint":
				case "string":
				case "number":
					invokeCallback = !0;
					break;
				case "object": switch (children.$$typeof) {
					case REACT_ELEMENT_TYPE:
					case REACT_PORTAL_TYPE:
						invokeCallback = !0;
						break;
					case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
				}
			}
			if (invokeCallback) {
				invokeCallback = children;
				callback = callback(invokeCallback);
				var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
				isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
					return c;
				})) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + childKey), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
				return 1;
			}
			invokeCallback = 0;
			childKey = "" === nameSoFar ? "." : nameSoFar + ":";
			if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
			else if (i = getIteratorFn(children), "function" === typeof i) for (i === children.entries && (didWarnAboutMaps || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), didWarnAboutMaps = !0), children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
			else if ("object" === type) {
				if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
				array = String(children);
				throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
			}
			return invokeCallback;
		}
		function mapChildren(children, func, context) {
			if (null == children) return children;
			var result = [], count = 0;
			mapIntoArray(children, result, "", "", function(child) {
				return func.call(context, child, count++);
			});
			return result;
		}
		function lazyInitializer(payload) {
			if (-1 === payload._status) {
				var ctor = payload._result;
				ctor = ctor();
				ctor.then(function(moduleObject) {
					if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
				}, function(error) {
					if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
				});
				-1 === payload._status && (payload._status = 0, payload._result = ctor);
			}
			if (1 === payload._status) return ctor = payload._result, void 0 === ctor && console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", ctor), "default" in ctor || console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", ctor), ctor.default;
			throw payload._result;
		}
		function resolveDispatcher() {
			var dispatcher = ReactSharedInternals.H;
			null === dispatcher && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.");
			return dispatcher;
		}
		function noop() {}
		function enqueueTask(task) {
			if (null === enqueueTaskImpl) try {
				var requireString = ("require" + Math.random()).slice(0, 7);
				enqueueTaskImpl = (module && module[requireString]).call(module, "timers").setImmediate;
			} catch (_err) {
				enqueueTaskImpl = function(callback) {
					!1 === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = !0, "undefined" === typeof MessageChannel && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var channel = new MessageChannel();
					channel.port1.onmessage = callback;
					channel.port2.postMessage(void 0);
				};
			}
			return enqueueTaskImpl(task);
		}
		function aggregateErrors(errors) {
			return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
		}
		function popActScope(prevActQueue, prevActScopeDepth) {
			prevActScopeDepth !== actScopeDepth - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
			actScopeDepth = prevActScopeDepth;
		}
		function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
			var queue = ReactSharedInternals.actQueue;
			if (null !== queue) if (0 !== queue.length) try {
				flushActQueue(queue);
				enqueueTask(function() {
					return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
				});
				return;
			} catch (error) {
				ReactSharedInternals.thrownErrors.push(error);
			}
			else ReactSharedInternals.actQueue = null;
			0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
		}
		function flushActQueue(queue) {
			if (!isFlushing) {
				isFlushing = !0;
				var i = 0;
				try {
					for (; i < queue.length; i++) {
						var callback = queue[i];
						do {
							ReactSharedInternals.didUsePromise = !1;
							var continuation = callback(!1);
							if (null !== continuation) {
								if (ReactSharedInternals.didUsePromise) {
									queue[i] = callback;
									queue.splice(0, i);
									return;
								}
								callback = continuation;
							} else break;
						} while (1);
					}
					queue.length = 0;
				} catch (error) {
					queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
				} finally {
					isFlushing = !1;
				}
			}
		}
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
		Symbol.for("react.provider");
		var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
			isMounted: function() {
				return !1;
			},
			enqueueForceUpdate: function(publicInstance) {
				warnNoop(publicInstance, "forceUpdate");
			},
			enqueueReplaceState: function(publicInstance) {
				warnNoop(publicInstance, "replaceState");
			},
			enqueueSetState: function(publicInstance) {
				warnNoop(publicInstance, "setState");
			}
		}, assign = Object.assign, emptyObject = {};
		Object.freeze(emptyObject);
		Component.prototype.isReactComponent = {};
		Component.prototype.setState = function(partialState, callback) {
			if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, partialState, callback, "setState");
		};
		Component.prototype.forceUpdate = function(callback) {
			this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
		};
		var deprecatedAPIs = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		}, fnName;
		for (fnName in deprecatedAPIs) deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
		ComponentDummy.prototype = Component.prototype;
		deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
		deprecatedAPIs.constructor = PureComponent;
		assign(deprecatedAPIs, Component.prototype);
		deprecatedAPIs.isPureReactComponent = !0;
		var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = {
			H: null,
			A: null,
			T: null,
			S: null,
			V: null,
			actQueue: null,
			isBatchingLegacy: !1,
			didScheduleLegacyUpdate: !1,
			didUsePromise: !1,
			thrownErrors: [],
			getCurrentStack: null,
			recentlyCreatedOwnerStacks: 0
		}, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
			return null;
		};
		deprecatedAPIs = { "react-stack-bottom-frame": function(callStackForError) {
			return callStackForError();
		} };
		var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
		var didWarnAboutElementRef = {};
		var unknownOwnerDebugStack = deprecatedAPIs["react-stack-bottom-frame"].bind(deprecatedAPIs, UnknownOwner)();
		var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
		var didWarnAboutMaps = !1, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
			if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
				var event = new window.ErrorEvent("error", {
					bubbles: !0,
					cancelable: !0,
					message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
					error
				});
				if (!window.dispatchEvent(event)) return;
			} else if ("object" === typeof process && "function" === typeof process.emit) {
				process.emit("uncaughtException", error);
				return;
			}
			console.error(error);
		}, didWarnAboutMessageChannel = !1, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = !1, isFlushing = !1, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
			queueMicrotask(function() {
				return queueMicrotask(callback);
			});
		} : enqueueTask;
		deprecatedAPIs = Object.freeze({
			__proto__: null,
			c: function(size) {
				return resolveDispatcher().useMemoCache(size);
			}
		});
		exports.Children = {
			map: mapChildren,
			forEach: function(children, forEachFunc, forEachContext) {
				mapChildren(children, function() {
					forEachFunc.apply(this, arguments);
				}, forEachContext);
			},
			count: function(children) {
				var n = 0;
				mapChildren(children, function() {
					n++;
				});
				return n;
			},
			toArray: function(children) {
				return mapChildren(children, function(child) {
					return child;
				}) || [];
			},
			only: function(children) {
				if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
				return children;
			}
		};
		exports.Component = Component;
		exports.Fragment = REACT_FRAGMENT_TYPE;
		exports.Profiler = REACT_PROFILER_TYPE;
		exports.PureComponent = PureComponent;
		exports.StrictMode = REACT_STRICT_MODE_TYPE;
		exports.Suspense = REACT_SUSPENSE_TYPE;
		exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
		exports.__COMPILER_RUNTIME = deprecatedAPIs;
		exports.act = function(callback) {
			var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
			actScopeDepth++;
			var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = !1;
			try {
				var result = callback();
			} catch (error) {
				ReactSharedInternals.thrownErrors.push(error);
			}
			if (0 < ReactSharedInternals.thrownErrors.length) throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
			if (null !== result && "object" === typeof result && "function" === typeof result.then) {
				var thenable = result;
				queueSeveralMicrotasks(function() {
					didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				});
				return { then: function(resolve, reject) {
					didAwaitActCall = !0;
					thenable.then(function(returnValue) {
						popActScope(prevActQueue, prevActScopeDepth);
						if (0 === prevActScopeDepth) {
							try {
								flushActQueue(queue), enqueueTask(function() {
									return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
								});
							} catch (error$0) {
								ReactSharedInternals.thrownErrors.push(error$0);
							}
							if (0 < ReactSharedInternals.thrownErrors.length) {
								var _thrownError = aggregateErrors(ReactSharedInternals.thrownErrors);
								ReactSharedInternals.thrownErrors.length = 0;
								reject(_thrownError);
							}
						} else resolve(returnValue);
					}, function(error) {
						popActScope(prevActQueue, prevActScopeDepth);
						0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
					});
				} };
			}
			var returnValue$jscomp$0 = result;
			popActScope(prevActQueue, prevActScopeDepth);
			0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
				didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), ReactSharedInternals.actQueue = null);
			if (0 < ReactSharedInternals.thrownErrors.length) throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
			return { then: function(resolve, reject) {
				didAwaitActCall = !0;
				0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
					return recursivelyFlushAsyncActWork(returnValue$jscomp$0, resolve, reject);
				})) : resolve(returnValue$jscomp$0);
			} };
		};
		exports.cache = function(fn) {
			return function() {
				return fn.apply(null, arguments);
			};
		};
		exports.captureOwnerStack = function() {
			var getCurrentStack = ReactSharedInternals.getCurrentStack;
			return null === getCurrentStack ? null : getCurrentStack();
		};
		exports.cloneElement = function(element, config, children) {
			if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
			var props = assign({}, element.props), key = element.key, owner = element._owner;
			if (null != config) {
				var JSCompiler_inline_result;
				a: {
					if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(config, "ref").get) && JSCompiler_inline_result.isReactWarning) {
						JSCompiler_inline_result = !1;
						break a;
					}
					JSCompiler_inline_result = void 0 !== config.ref;
				}
				JSCompiler_inline_result && (owner = getOwner());
				hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
				for (propName in config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
			}
			var propName = arguments.length - 2;
			if (1 === propName) props.children = children;
			else if (1 < propName) {
				JSCompiler_inline_result = Array(propName);
				for (var i = 0; i < propName; i++) JSCompiler_inline_result[i] = arguments[i + 2];
				props.children = JSCompiler_inline_result;
			}
			props = ReactElement(element.type, key, void 0, void 0, owner, props, element._debugStack, element._debugTask);
			for (key = 2; key < arguments.length; key++) owner = arguments[key], isValidElement(owner) && owner._store && (owner._store.validated = 1);
			return props;
		};
		exports.createContext = function(defaultValue) {
			defaultValue = {
				$$typeof: REACT_CONTEXT_TYPE,
				_currentValue: defaultValue,
				_currentValue2: defaultValue,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			};
			defaultValue.Provider = defaultValue;
			defaultValue.Consumer = {
				$$typeof: REACT_CONSUMER_TYPE,
				_context: defaultValue
			};
			defaultValue._currentRenderer = null;
			defaultValue._currentRenderer2 = null;
			return defaultValue;
		};
		exports.createElement = function(type, config, children) {
			for (var i = 2; i < arguments.length; i++) {
				var node = arguments[i];
				isValidElement(node) && node._store && (node._store.validated = 1);
			}
			i = {};
			node = null;
			if (null != config) for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), hasValidKey(config) && (checkKeyStringCoercion(config.key), node = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
			var childrenLength = arguments.length - 2;
			if (1 === childrenLength) i.children = children;
			else if (1 < childrenLength) {
				for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++) childArray[_i] = arguments[_i + 2];
				Object.freeze && Object.freeze(childArray);
				i.children = childArray;
			}
			if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === i[propName] && (i[propName] = childrenLength[propName]);
			node && defineKeyPropWarningGetter(i, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
			var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
			return ReactElement(type, node, void 0, void 0, getOwner(), i, propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack, propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
		};
		exports.createRef = function() {
			var refObject = { current: null };
			Object.seal(refObject);
			return refObject;
		};
		exports.forwardRef = function(render) {
			null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : "function" !== typeof render ? console.error("forwardRef requires a render function but was given %s.", null === render ? "null" : typeof render) : 0 !== render.length && 2 !== render.length && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", 1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
			null != render && null != render.defaultProps && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var elementType = {
				$$typeof: REACT_FORWARD_REF_TYPE,
				render
			}, ownName;
			Object.defineProperty(elementType, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return ownName;
				},
				set: function(name) {
					ownName = name;
					render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
				}
			});
			return elementType;
		};
		exports.isValidElement = isValidElement;
		exports.lazy = function(ctor) {
			return {
				$$typeof: REACT_LAZY_TYPE,
				_payload: {
					_status: -1,
					_result: ctor
				},
				_init: lazyInitializer
			};
		};
		exports.memo = function(type, compare) {
			type ?? console.error("memo: The first argument must be a component. Instead received: %s", null === type ? "null" : typeof type);
			compare = {
				$$typeof: REACT_MEMO_TYPE,
				type,
				compare: void 0 === compare ? null : compare
			};
			var ownName;
			Object.defineProperty(compare, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return ownName;
				},
				set: function(name) {
					ownName = name;
					type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
				}
			});
			return compare;
		};
		exports.startTransition = function(scope) {
			var prevTransition = ReactSharedInternals.T, currentTransition = {};
			ReactSharedInternals.T = currentTransition;
			currentTransition._updatedFibers = new Set();
			try {
				var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
				null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
				"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
			} catch (error) {
				reportGlobalError(error);
			} finally {
				null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), ReactSharedInternals.T = prevTransition;
			}
		};
		exports.unstable_useCacheRefresh = function() {
			return resolveDispatcher().useCacheRefresh();
		};
		exports.use = function(usable) {
			return resolveDispatcher().use(usable);
		};
		exports.useActionState = function(action, initialState, permalink) {
			return resolveDispatcher().useActionState(action, initialState, permalink);
		};
		exports.useCallback = function(callback, deps) {
			return resolveDispatcher().useCallback(callback, deps);
		};
		exports.useContext = function(Context) {
			var dispatcher = resolveDispatcher();
			Context.$$typeof === REACT_CONSUMER_TYPE && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?");
			return dispatcher.useContext(Context);
		};
		exports.useDebugValue = function(value, formatterFn) {
			return resolveDispatcher().useDebugValue(value, formatterFn);
		};
		exports.useDeferredValue = function(value, initialValue) {
			return resolveDispatcher().useDeferredValue(value, initialValue);
		};
		exports.useEffect = function(create, createDeps, update) {
			create ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?");
			var dispatcher = resolveDispatcher();
			if ("function" === typeof update) throw Error("useEffect CRUD overload is not enabled in this build of React.");
			return dispatcher.useEffect(create, createDeps);
		};
		exports.useId = function() {
			return resolveDispatcher().useId();
		};
		exports.useImperativeHandle = function(ref, create, deps) {
			return resolveDispatcher().useImperativeHandle(ref, create, deps);
		};
		exports.useInsertionEffect = function(create, deps) {
			create ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?");
			return resolveDispatcher().useInsertionEffect(create, deps);
		};
		exports.useLayoutEffect = function(create, deps) {
			create ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?");
			return resolveDispatcher().useLayoutEffect(create, deps);
		};
		exports.useMemo = function(create, deps) {
			return resolveDispatcher().useMemo(create, deps);
		};
		exports.useOptimistic = function(passthrough, reducer) {
			return resolveDispatcher().useOptimistic(passthrough, reducer);
		};
		exports.useReducer = function(reducer, initialArg, init) {
			return resolveDispatcher().useReducer(reducer, initialArg, init);
		};
		exports.useRef = function(initialValue) {
			return resolveDispatcher().useRef(initialValue);
		};
		exports.useState = function(initialState) {
			return resolveDispatcher().useState(initialState);
		};
		exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
			return resolveDispatcher().useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
		};
		exports.useTransition = function() {
			return resolveDispatcher().useTransition();
		};
		exports.version = "19.1.0";
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
} });

//#endregion
//#region ../../../node_modules/.pnpm/react@19.1.0/node_modules/react/index.js
var require_react = __commonJS({ "../../../node_modules/.pnpm/react@19.1.0/node_modules/react/index.js"(exports, module) {
	module.exports = require_react_development();
} });

//#endregion
//#region ../../../node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/cjs/react-dom.development.js
var require_react_dom_development = __commonJS({ "../../../node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/cjs/react-dom.development.js"(exports) {
	(function() {
		function noop() {}
		function testStringCoercion(value) {
			return "" + value;
		}
		function createPortal$1(children, containerInfo, implementation) {
			var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
			try {
				testStringCoercion(key);
				var JSCompiler_inline_result = !1;
			} catch (e) {
				JSCompiler_inline_result = !0;
			}
			JSCompiler_inline_result && (console.error("The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", "function" === typeof Symbol && Symbol.toStringTag && key[Symbol.toStringTag] || key.constructor.name || "Object"), testStringCoercion(key));
			return {
				$$typeof: REACT_PORTAL_TYPE,
				key: null == key ? null : "" + key,
				children,
				containerInfo,
				implementation
			};
		}
		function getCrossOriginStringAs(as, input) {
			if ("font" === as) return "";
			if ("string" === typeof input) return "use-credentials" === input ? input : "";
		}
		function getValueDescriptorExpectingObjectForWarning(thing) {
			return null === thing ? "`null`" : void 0 === thing ? "`undefined`" : "" === thing ? "an empty string" : "something with type \"" + typeof thing + "\"";
		}
		function getValueDescriptorExpectingEnumForWarning(thing) {
			return null === thing ? "`null`" : void 0 === thing ? "`undefined`" : "" === thing ? "an empty string" : "string" === typeof thing ? JSON.stringify(thing) : "number" === typeof thing ? "`" + thing + "`" : "something with type \"" + typeof thing + "\"";
		}
		function resolveDispatcher() {
			var dispatcher = ReactSharedInternals.H;
			null === dispatcher && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.");
			return dispatcher;
		}
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var React = require_react(), Internals = {
			d: {
				f: noop,
				r: function() {
					throw Error("Invalid form element. requestFormReset must be passed a form that was rendered by React.");
				},
				D: noop,
				C: noop,
				L: noop,
				m: noop,
				X: noop,
				S: noop,
				M: noop
			},
			p: 0,
			findDOMNode: null
		}, REACT_PORTAL_TYPE = Symbol.for("react.portal"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
		"function" === typeof Map && null != Map.prototype && "function" === typeof Map.prototype.forEach && "function" === typeof Set && null != Set.prototype && "function" === typeof Set.prototype.clear && "function" === typeof Set.prototype.forEach || console.error("React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills");
		exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
		exports.createPortal = function(children, container) {
			var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
			if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error("Target container is not a DOM element.");
			return createPortal$1(children, container, null, key);
		};
		exports.flushSync = function(fn) {
			var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
			try {
				if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
			} finally {
				ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f() && console.error("flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task.");
			}
		};
		exports.preconnect = function(href, options) {
			"string" === typeof href && href ? null != options && "object" !== typeof options ? console.error("ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.", getValueDescriptorExpectingEnumForWarning(options)) : null != options && "string" !== typeof options.crossOrigin && console.error("ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.", getValueDescriptorExpectingObjectForWarning(options.crossOrigin)) : console.error("ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", getValueDescriptorExpectingObjectForWarning(href));
			"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
		};
		exports.prefetchDNS = function(href) {
			if ("string" !== typeof href || !href) console.error("ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", getValueDescriptorExpectingObjectForWarning(href));
			else if (1 < arguments.length) {
				var options = arguments[1];
				"object" === typeof options && options.hasOwnProperty("crossOrigin") ? console.error("ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.", getValueDescriptorExpectingEnumForWarning(options)) : console.error("ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.", getValueDescriptorExpectingEnumForWarning(options));
			}
			"string" === typeof href && Internals.d.D(href);
		};
		exports.preinit = function(href, options) {
			"string" === typeof href && href ? null == options || "object" !== typeof options ? console.error("ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.", getValueDescriptorExpectingEnumForWarning(options)) : "style" !== options.as && "script" !== options.as && console.error("ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are \"style\" and \"script\".", getValueDescriptorExpectingEnumForWarning(options.as)) : console.error("ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", getValueDescriptorExpectingObjectForWarning(href));
			if ("string" === typeof href && options && "string" === typeof options.as) {
				var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
				"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
					crossOrigin,
					integrity,
					fetchPriority
				}) : "script" === as && Internals.d.X(href, {
					crossOrigin,
					integrity,
					fetchPriority,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0
				});
			}
		};
		exports.preinitModule = function(href, options) {
			var encountered = "";
			"string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
			void 0 !== options && "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : options && "as" in options && "script" !== options.as && (encountered += " The `as` option encountered was " + getValueDescriptorExpectingEnumForWarning(options.as) + ".");
			if (encountered) console.error("ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s", encountered);
			else switch (encountered = options && "string" === typeof options.as ? options.as : "script", encountered) {
				case "script": break;
				default: encountered = getValueDescriptorExpectingEnumForWarning(encountered), console.error("ReactDOM.preinitModule(): Currently the only supported \"as\" type for this function is \"script\" but received \"%s\" instead. This warning was generated for `href` \"%s\". In the future other module types will be supported, aligning with the import-attributes proposal. Learn more here: (https://github.com/tc39/proposal-import-attributes)", encountered, href);
			}
			if ("string" === typeof href) if ("object" === typeof options && null !== options) {
				if (null == options.as || "script" === options.as) encountered = getCrossOriginStringAs(options.as, options.crossOrigin), Internals.d.M(href, {
					crossOrigin: encountered,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0
				});
			} else options ?? Internals.d.M(href);
		};
		exports.preload = function(href, options) {
			var encountered = "";
			"string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
			null == options || "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : "string" === typeof options.as && options.as || (encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".");
			encountered && console.error("ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel=\"preload\" as=\"...\" />` tag.%s", encountered);
			if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
				encountered = options.as;
				var crossOrigin = getCrossOriginStringAs(encountered, options.crossOrigin);
				Internals.d.L(href, encountered, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0,
					type: "string" === typeof options.type ? options.type : void 0,
					fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
					referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
					imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
					imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
					media: "string" === typeof options.media ? options.media : void 0
				});
			}
		};
		exports.preloadModule = function(href, options) {
			var encountered = "";
			"string" === typeof href && href || (encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".");
			void 0 !== options && "object" !== typeof options ? encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + "." : options && "as" in options && "string" !== typeof options.as && (encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".");
			encountered && console.error("ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel=\"modulepreload\" as=\"...\" />` tag.%s", encountered);
			"string" === typeof href && (options ? (encountered = getCrossOriginStringAs(options.as, options.crossOrigin), Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin: encountered,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0
			})) : Internals.d.m(href));
		};
		exports.requestFormReset = function(form) {
			Internals.d.r(form);
		};
		exports.unstable_batchedUpdates = function(fn, a) {
			return fn(a);
		};
		exports.useFormState = function(action, initialState, permalink) {
			return resolveDispatcher().useFormState(action, initialState, permalink);
		};
		exports.useFormStatus = function() {
			return resolveDispatcher().useHostTransitionStatus();
		};
		exports.version = "19.1.0";
		"undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
} });

//#endregion
//#region ../../../node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/index.js
var require_react_dom = __commonJS({ "../../../node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/index.js"(exports, module) {
	module.exports = require_react_dom_development();
} });

//#endregion
//#region ../../../node_modules/.pnpm/react-server-dom-webpack@19.1.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_webpack@5.98.0/node_modules/react-server-dom-webpack/cjs/react-server-dom-webpack-server.edge.development.js
var require_react_server_dom_webpack_server_edge_development = __commonJS({ "../../../node_modules/.pnpm/react-server-dom-webpack@19.1.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_webpack@5.98.0/node_modules/react-server-dom-webpack/cjs/react-server-dom-webpack-server.edge.development.js"(exports) {
	(function() {
		function voidHandler() {}
		function getIteratorFn(maybeIterable) {
			if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
			maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
			return "function" === typeof maybeIterable ? maybeIterable : null;
		}
		function _defineProperty(obj, key, value) {
			a: if ("object" == typeof key && key) {
				var e = key[Symbol.toPrimitive];
				if (void 0 !== e) {
					key = e.call(key, "string");
					if ("object" != typeof key) break a;
					throw new TypeError("@@toPrimitive must return a primitive value.");
				}
				key = String(key);
			}
			key = "symbol" == typeof key ? key : key + "";
			key in obj ? Object.defineProperty(obj, key, {
				value,
				enumerable: !0,
				configurable: !0,
				writable: !0
			}) : obj[key] = value;
			return obj;
		}
		function handleErrorInNextTick(error) {
			setTimeout(function() {
				throw error;
			});
		}
		function writeChunkAndReturn(destination, chunk) {
			if (0 !== chunk.byteLength) if (2048 < chunk.byteLength) 0 < writtenBytes && (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)), currentView = new Uint8Array(2048), writtenBytes = 0), destination.enqueue(chunk);
			else {
				var allowableBytes = currentView.length - writtenBytes;
				allowableBytes < chunk.byteLength && (0 === allowableBytes ? destination.enqueue(currentView) : (currentView.set(chunk.subarray(0, allowableBytes), writtenBytes), destination.enqueue(currentView), chunk = chunk.subarray(allowableBytes)), currentView = new Uint8Array(2048), writtenBytes = 0);
				currentView.set(chunk, writtenBytes);
				writtenBytes += chunk.byteLength;
			}
			return !0;
		}
		function stringToChunk(content) {
			return textEncoder.encode(content);
		}
		function byteLengthOfChunk(chunk) {
			return chunk.byteLength;
		}
		function closeWithError(destination, error) {
			"function" === typeof destination.error ? destination.error(error) : destination.close();
		}
		function isClientReference(reference) {
			return reference.$$typeof === CLIENT_REFERENCE_TAG$1;
		}
		function registerClientReferenceImpl(proxyImplementation, id, async) {
			return Object.defineProperties(proxyImplementation, {
				$$typeof: { value: CLIENT_REFERENCE_TAG$1 },
				$$id: { value: id },
				$$async: { value: async }
			});
		}
		function bind() {
			var newFn = FunctionBind.apply(this, arguments);
			if (this.$$typeof === SERVER_REFERENCE_TAG) {
				null != arguments[0] && console.error("Cannot bind \"this\" of a Server Action. Pass null or undefined as the first argument to .bind().");
				var args = ArraySlice.call(arguments, 1), $$typeof = { value: SERVER_REFERENCE_TAG }, $$id = { value: this.$$id };
				args = { value: this.$$bound ? this.$$bound.concat(args) : args };
				return Object.defineProperties(newFn, {
					$$typeof,
					$$id,
					$$bound: args,
					$$location: {
						value: this.$$location,
						configurable: !0
					},
					bind: {
						value: bind,
						configurable: !0
					}
				});
			}
			return newFn;
		}
		function getReference(target, name) {
			switch (name) {
				case "$$typeof": return target.$$typeof;
				case "$$id": return target.$$id;
				case "$$async": return target.$$async;
				case "name": return target.name;
				case "defaultProps": return;
				case "toJSON": return;
				case Symbol.toPrimitive: return Object.prototype[Symbol.toPrimitive];
				case Symbol.toStringTag: return Object.prototype[Symbol.toStringTag];
				case "__esModule":
					var moduleId = target.$$id;
					target.default = registerClientReferenceImpl(function() {
						throw Error("Attempted to call the default export of " + moduleId + " from the server but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
					}, target.$$id + "#", target.$$async);
					return !0;
				case "then":
					if (target.then) return target.then;
					if (target.$$async) return;
					var clientReference = registerClientReferenceImpl({}, target.$$id, !0), proxy = new Proxy(clientReference, proxyHandlers$1);
					target.status = "fulfilled";
					target.value = proxy;
					return target.then = registerClientReferenceImpl(function(resolve) {
						return Promise.resolve(resolve(proxy));
					}, target.$$id + "#then", !1);
			}
			if ("symbol" === typeof name) throw Error("Cannot read Symbol exports. Only named exports are supported on a client module imported on the server.");
			clientReference = target[name];
			clientReference || (clientReference = registerClientReferenceImpl(function() {
				throw Error("Attempted to call " + String(name) + "() from the server but " + String(name) + " is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
			}, target.$$id + "#" + name, target.$$async), Object.defineProperty(clientReference, "name", { value: name }), clientReference = target[name] = new Proxy(clientReference, deepProxyHandlers));
			return clientReference;
		}
		function trimOptions(options) {
			if (null == options) return null;
			var hasProperties = !1, trimmed = {}, key;
			for (key in options) null != options[key] && (hasProperties = !0, trimmed[key] = options[key]);
			return hasProperties ? trimmed : null;
		}
		function prepareStackTrace(error, structuredStackTrace) {
			error = (error.name || "Error") + ": " + (error.message || "");
			for (var i = 0; i < structuredStackTrace.length; i++) error += "\n    at " + structuredStackTrace[i].toString();
			return error;
		}
		function parseStackTrace(error, skipFrames) {
			a: {
				var previousPrepare = Error.prepareStackTrace;
				Error.prepareStackTrace = prepareStackTrace;
				try {
					var stack = String(error.stack);
					break a;
				} finally {
					Error.prepareStackTrace = previousPrepare;
				}
				stack = void 0;
			}
			stack.startsWith("Error: react-stack-top-frame\n") && (stack = stack.slice(29));
			error = stack.indexOf("react-stack-bottom-frame");
			-1 !== error && (error = stack.lastIndexOf("\n", error));
			-1 !== error && (stack = stack.slice(0, error));
			stack = stack.split("\n");
			for (error = []; skipFrames < stack.length; skipFrames++) if (previousPrepare = frameRegExp.exec(stack[skipFrames])) {
				var name = previousPrepare[1] || "";
				"<anonymous>" === name && (name = "");
				var filename = previousPrepare[2] || previousPrepare[5] || "";
				"<anonymous>" === filename && (filename = "");
				error.push([
					name,
					filename,
					+(previousPrepare[3] || previousPrepare[6]),
					+(previousPrepare[4] || previousPrepare[7])
				]);
			}
			return error;
		}
		function createTemporaryReference(temporaryReferences, id) {
			var reference = Object.defineProperties(function() {
				throw Error("Attempted to call a temporary Client Reference from the server but it is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
			}, { $$typeof: { value: TEMPORARY_REFERENCE_TAG } });
			reference = new Proxy(reference, proxyHandlers);
			temporaryReferences.set(reference, id);
			return reference;
		}
		function noop$1() {}
		function trackUsedThenable(thenableState$1, thenable, index) {
			index = thenableState$1[index];
			void 0 === index ? thenableState$1.push(thenable) : index !== thenable && (thenable.then(noop$1, noop$1), thenable = index);
			switch (thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
				default:
					"string" === typeof thenable.status ? thenable.then(noop$1, noop$1) : (thenableState$1 = thenable, thenableState$1.status = "pending", thenableState$1.then(function(fulfilledValue) {
						if ("pending" === thenable.status) {
							var fulfilledThenable = thenable;
							fulfilledThenable.status = "fulfilled";
							fulfilledThenable.value = fulfilledValue;
						}
					}, function(error) {
						if ("pending" === thenable.status) {
							var rejectedThenable = thenable;
							rejectedThenable.status = "rejected";
							rejectedThenable.reason = error;
						}
					}));
					switch (thenable.status) {
						case "fulfilled": return thenable.value;
						case "rejected": throw thenable.reason;
					}
					suspendedThenable = thenable;
					throw SuspenseException;
			}
		}
		function getSuspendedThenable() {
			if (null === suspendedThenable) throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
			var thenable = suspendedThenable;
			suspendedThenable = null;
			return thenable;
		}
		function getThenableStateAfterSuspending() {
			var state = thenableState || [];
			state._componentDebugInfo = currentComponentDebugInfo;
			thenableState = currentComponentDebugInfo = null;
			return state;
		}
		function unsupportedHook() {
			throw Error("This Hook is not supported in Server Components.");
		}
		function unsupportedRefresh() {
			throw Error("Refreshing the cache is not supported in Server Components.");
		}
		function unsupportedContext() {
			throw Error("Cannot read a Client Context from a Server Component.");
		}
		function resolveOwner() {
			if (currentOwner) return currentOwner;
			if (supportsComponentStorage) {
				var owner = componentStorage.getStore();
				if (owner) return owner;
			}
			return null;
		}
		function resetOwnerStackLimit() {
			var now = getCurrentTime();
			1e3 < now - lastResetTime && (ReactSharedInternalsServer.recentlyCreatedOwnerStacks = 0, lastResetTime = now);
		}
		function isObjectPrototype(object) {
			if (!object) return !1;
			var ObjectPrototype$1 = Object.prototype;
			if (object === ObjectPrototype$1) return !0;
			if (getPrototypeOf(object)) return !1;
			object = Object.getOwnPropertyNames(object);
			for (var i = 0; i < object.length; i++) if (!(object[i] in ObjectPrototype$1)) return !1;
			return !0;
		}
		function isSimpleObject(object) {
			if (!isObjectPrototype(getPrototypeOf(object))) return !1;
			for (var names = Object.getOwnPropertyNames(object), i = 0; i < names.length; i++) {
				var descriptor = Object.getOwnPropertyDescriptor(object, names[i]);
				if (!descriptor || !descriptor.enumerable && ("key" !== names[i] && "ref" !== names[i] || "function" !== typeof descriptor.get)) return !1;
			}
			return !0;
		}
		function objectName(object) {
			return Object.prototype.toString.call(object).replace(/^\[object (.*)\]$/, function(m, p0) {
				return p0;
			});
		}
		function describeKeyForErrorMessage(key) {
			var encodedKey = JSON.stringify(key);
			return "\"" + key + "\"" === encodedKey ? key : encodedKey;
		}
		function describeValueForErrorMessage(value) {
			switch (typeof value) {
				case "string": return JSON.stringify(10 >= value.length ? value : value.slice(0, 10) + "...");
				case "object":
					if (isArrayImpl(value)) return "[...]";
					if (null !== value && value.$$typeof === CLIENT_REFERENCE_TAG) return "client";
					value = objectName(value);
					return "Object" === value ? "{...}" : value;
				case "function": return value.$$typeof === CLIENT_REFERENCE_TAG ? "client" : (value = value.displayName || value.name) ? "function " + value : "function";
				default: return String(value);
			}
		}
		function describeElementType(type) {
			if ("string" === typeof type) return type;
			switch (type) {
				case REACT_SUSPENSE_TYPE: return "Suspense";
				case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
			}
			if ("object" === typeof type) switch (type.$$typeof) {
				case REACT_FORWARD_REF_TYPE: return describeElementType(type.render);
				case REACT_MEMO_TYPE: return describeElementType(type.type);
				case REACT_LAZY_TYPE:
					var payload = type._payload;
					type = type._init;
					try {
						return describeElementType(type(payload));
					} catch (x) {}
			}
			return "";
		}
		function describeObjectForErrorMessage(objectOrArray, expandedName) {
			var objKind = objectName(objectOrArray);
			if ("Object" !== objKind && "Array" !== objKind) return objKind;
			var start = -1, length = 0;
			if (isArrayImpl(objectOrArray)) if (jsxChildrenParents.has(objectOrArray)) {
				var type = jsxChildrenParents.get(objectOrArray);
				objKind = "<" + describeElementType(type) + ">";
				for (var i = 0; i < objectOrArray.length; i++) {
					var value = objectOrArray[i];
					value = "string" === typeof value ? value : "object" === typeof value && null !== value ? "{" + describeObjectForErrorMessage(value) + "}" : "{" + describeValueForErrorMessage(value) + "}";
					"" + i === expandedName ? (start = objKind.length, length = value.length, objKind += value) : objKind = 15 > value.length && 40 > objKind.length + value.length ? objKind + value : objKind + "{...}";
				}
				objKind += "</" + describeElementType(type) + ">";
			} else {
				objKind = "[";
				for (type = 0; type < objectOrArray.length; type++) 0 < type && (objKind += ", "), i = objectOrArray[type], i = "object" === typeof i && null !== i ? describeObjectForErrorMessage(i) : describeValueForErrorMessage(i), "" + type === expandedName ? (start = objKind.length, length = i.length, objKind += i) : objKind = 10 > i.length && 40 > objKind.length + i.length ? objKind + i : objKind + "...";
				objKind += "]";
			}
			else if (objectOrArray.$$typeof === REACT_ELEMENT_TYPE) objKind = "<" + describeElementType(objectOrArray.type) + "/>";
			else {
				if (objectOrArray.$$typeof === CLIENT_REFERENCE_TAG) return "client";
				if (jsxPropsParents.has(objectOrArray)) {
					objKind = jsxPropsParents.get(objectOrArray);
					objKind = "<" + (describeElementType(objKind) || "...");
					type = Object.keys(objectOrArray);
					for (i = 0; i < type.length; i++) {
						objKind += " ";
						value = type[i];
						objKind += describeKeyForErrorMessage(value) + "=";
						var _value2 = objectOrArray[value];
						var _substr2 = value === expandedName && "object" === typeof _value2 && null !== _value2 ? describeObjectForErrorMessage(_value2) : describeValueForErrorMessage(_value2);
						"string" !== typeof _value2 && (_substr2 = "{" + _substr2 + "}");
						value === expandedName ? (start = objKind.length, length = _substr2.length, objKind += _substr2) : objKind = 10 > _substr2.length && 40 > objKind.length + _substr2.length ? objKind + _substr2 : objKind + "...";
					}
					objKind += ">";
				} else {
					objKind = "{";
					type = Object.keys(objectOrArray);
					for (i = 0; i < type.length; i++) 0 < i && (objKind += ", "), value = type[i], objKind += describeKeyForErrorMessage(value) + ": ", _value2 = objectOrArray[value], _value2 = "object" === typeof _value2 && null !== _value2 ? describeObjectForErrorMessage(_value2) : describeValueForErrorMessage(_value2), value === expandedName ? (start = objKind.length, length = _value2.length, objKind += _value2) : objKind = 10 > _value2.length && 40 > objKind.length + _value2.length ? objKind + _value2 : objKind + "...";
					objKind += "}";
				}
			}
			return void 0 === expandedName ? objKind : -1 < start && 0 < length ? (objectOrArray = " ".repeat(start) + "^".repeat(length), "\n  " + objKind + "\n  " + objectOrArray) : "\n  " + objKind;
		}
		function defaultFilterStackFrame(filename) {
			return "" !== filename && !filename.startsWith("node:") && !filename.includes("node_modules");
		}
		function filterStackTrace(request, error, skipFrames) {
			request = request.filterStackFrame;
			error = parseStackTrace(error, skipFrames);
			for (skipFrames = 0; skipFrames < error.length; skipFrames++) {
				var callsite = error[skipFrames], functionName = callsite[0], url = callsite[1];
				if (url.startsWith("rsc://React/")) {
					var envIdx = url.indexOf("/", 12), suffixIdx = url.lastIndexOf("?");
					-1 < envIdx && -1 < suffixIdx && (url = callsite[1] = url.slice(envIdx + 1, suffixIdx));
				}
				request(url, functionName) || (error.splice(skipFrames, 1), skipFrames--);
			}
			return error;
		}
		function patchConsole(consoleInst, methodName) {
			var descriptor = Object.getOwnPropertyDescriptor(consoleInst, methodName);
			if (descriptor && (descriptor.configurable || descriptor.writable) && "function" === typeof descriptor.value) {
				var originalMethod = descriptor.value;
				descriptor = Object.getOwnPropertyDescriptor(originalMethod, "name");
				var wrapperMethod = function() {
					var request = resolveRequest();
					if (("assert" !== methodName || !arguments[0]) && null !== request) {
						var stack = filterStackTrace(request, Error("react-stack-top-frame"), 1);
						request.pendingChunks++;
						var owner = resolveOwner();
						emitConsoleChunk(request, methodName, owner, stack, arguments);
					}
					return originalMethod.apply(this, arguments);
				};
				descriptor && Object.defineProperty(wrapperMethod, "name", descriptor);
				Object.defineProperty(consoleInst, methodName, { value: wrapperMethod });
			}
		}
		function getCurrentStackInDEV() {
			var owner = resolveOwner();
			if (null === owner) return "";
			try {
				var info = "";
				if (owner.owner || "string" !== typeof owner.name) {
					for (; owner;) {
						var ownerStack = owner.debugStack;
						if (null != ownerStack) {
							if (owner = owner.owner) {
								var JSCompiler_temp_const = info;
								var error = ownerStack, prevPrepareStackTrace = Error.prepareStackTrace;
								Error.prepareStackTrace = prepareStackTrace;
								var stack = error.stack;
								Error.prepareStackTrace = prevPrepareStackTrace;
								stack.startsWith("Error: react-stack-top-frame\n") && (stack = stack.slice(29));
								var idx = stack.indexOf("\n");
								-1 !== idx && (stack = stack.slice(idx + 1));
								idx = stack.indexOf("react-stack-bottom-frame");
								-1 !== idx && (idx = stack.lastIndexOf("\n", idx));
								var JSCompiler_inline_result = -1 !== idx ? stack = stack.slice(0, idx) : "";
								info = JSCompiler_temp_const + ("\n" + JSCompiler_inline_result);
							}
						} else break;
					}
					var JSCompiler_inline_result$jscomp$0 = info;
				} else {
					JSCompiler_temp_const = owner.name;
					if (void 0 === prefix) try {
						throw Error();
					} catch (x) {
						prefix = (error = x.stack.trim().match(/\n( *(at )?)/)) && error[1] || "", suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
					}
					JSCompiler_inline_result$jscomp$0 = "\n" + prefix + JSCompiler_temp_const + suffix;
				}
			} catch (x) {
				JSCompiler_inline_result$jscomp$0 = "\nError generating stack: " + x.message + "\n" + x.stack;
			}
			return JSCompiler_inline_result$jscomp$0;
		}
		function defaultErrorHandler(error) {
			console.error(error);
		}
		function defaultPostponeHandler() {}
		function RequestInstance(type, model, bundlerConfig, onError, identifierPrefix, onPostpone, temporaryReferences, environmentName, filterStackFrame, onAllReady, onFatalError) {
			if (null !== ReactSharedInternalsServer.A && ReactSharedInternalsServer.A !== DefaultAsyncDispatcher) throw Error("Currently React only supports one RSC renderer at a time.");
			ReactSharedInternalsServer.A = DefaultAsyncDispatcher;
			ReactSharedInternalsServer.getCurrentStack = getCurrentStackInDEV;
			var abortSet = new Set(), pingedTasks = [], hints = new Set();
			this.type = type;
			this.status = OPENING;
			this.flushScheduled = !1;
			this.destination = this.fatalError = null;
			this.bundlerConfig = bundlerConfig;
			this.cache = new Map();
			this.pendingChunks = this.nextChunkId = 0;
			this.hints = hints;
			this.abortListeners = new Set();
			this.abortableTasks = abortSet;
			this.pingedTasks = pingedTasks;
			this.completedImportChunks = [];
			this.completedHintChunks = [];
			this.completedRegularChunks = [];
			this.completedErrorChunks = [];
			this.writtenSymbols = new Map();
			this.writtenClientReferences = new Map();
			this.writtenServerReferences = new Map();
			this.writtenObjects = new WeakMap();
			this.temporaryReferences = temporaryReferences;
			this.identifierPrefix = identifierPrefix || "";
			this.identifierCount = 1;
			this.taintCleanupQueue = [];
			this.onError = void 0 === onError ? defaultErrorHandler : onError;
			this.onPostpone = void 0 === onPostpone ? defaultPostponeHandler : onPostpone;
			this.onAllReady = onAllReady;
			this.onFatalError = onFatalError;
			this.environmentName = void 0 === environmentName ? function() {
				return "Server";
			} : "function" !== typeof environmentName ? function() {
				return environmentName;
			} : environmentName;
			this.filterStackFrame = void 0 === filterStackFrame ? defaultFilterStackFrame : filterStackFrame;
			this.didWarnForKey = null;
			type = createTask(this, model, null, !1, abortSet, null, null, null);
			pingedTasks.push(type);
		}
		function noop() {}
		function createRequest(model, bundlerConfig, onError, identifierPrefix, onPostpone, temporaryReferences, environmentName, filterStackFrame) {
			resetOwnerStackLimit();
			return new RequestInstance(20, model, bundlerConfig, onError, identifierPrefix, onPostpone, temporaryReferences, environmentName, filterStackFrame, noop, noop);
		}
		function createPrerenderRequest(model, bundlerConfig, onAllReady, onFatalError, onError, identifierPrefix, onPostpone, temporaryReferences, environmentName, filterStackFrame) {
			resetOwnerStackLimit();
			return new RequestInstance(PRERENDER, model, bundlerConfig, onError, identifierPrefix, onPostpone, temporaryReferences, environmentName, filterStackFrame, onAllReady, onFatalError);
		}
		function resolveRequest() {
			if (currentRequest) return currentRequest;
			if (supportsRequestStorage) {
				var store = requestStorage.getStore();
				if (store) return store;
			}
			return null;
		}
		function serializeThenable(request, task, thenable) {
			var newTask = createTask(request, null, task.keyPath, task.implicitSlot, request.abortableTasks, task.debugOwner, task.debugStack, task.debugTask);
			(task = thenable._debugInfo) && forwardDebugInfo(request, newTask.id, task);
			switch (thenable.status) {
				case "fulfilled": return newTask.model = thenable.value, pingTask(request, newTask), newTask.id;
				case "rejected": return erroredTask(request, newTask, thenable.reason), newTask.id;
				default:
					if (request.status === ABORTING) return request.abortableTasks.delete(newTask), newTask.status = ABORTED, task = stringify(serializeByValueID(request.fatalError)), emitModelChunk(request, newTask.id, task), newTask.id;
					"string" !== typeof thenable.status && (thenable.status = "pending", thenable.then(function(fulfilledValue) {
						"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
					}, function(error) {
						"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
					}));
			}
			thenable.then(function(value) {
				newTask.model = value;
				pingTask(request, newTask);
			}, function(reason) {
				newTask.status === PENDING$1 && (erroredTask(request, newTask, reason), enqueueFlush(request));
			});
			return newTask.id;
		}
		function serializeReadableStream(request, task, stream) {
			function progress(entry) {
				if (!aborted) if (entry.done) request.abortListeners.delete(abortStream), entry = streamTask.id.toString(16) + ":C\n", request.completedRegularChunks.push(stringToChunk(entry)), enqueueFlush(request), aborted = !0;
				else try {
					streamTask.model = entry.value, request.pendingChunks++, tryStreamTask(request, streamTask), enqueueFlush(request), reader.read().then(progress, error);
				} catch (x$0) {
					error(x$0);
				}
			}
			function error(reason) {
				aborted || (aborted = !0, request.abortListeners.delete(abortStream), erroredTask(request, streamTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
			}
			function abortStream(reason) {
				aborted || (aborted = !0, request.abortListeners.delete(abortStream), erroredTask(request, streamTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
			}
			var supportsBYOB = stream.supportsBYOB;
			if (void 0 === supportsBYOB) try {
				stream.getReader({ mode: "byob" }).releaseLock(), supportsBYOB = !0;
			} catch (x) {
				supportsBYOB = !1;
			}
			var reader = stream.getReader(), streamTask = createTask(request, task.model, task.keyPath, task.implicitSlot, request.abortableTasks, task.debugOwner, task.debugStack, task.debugTask);
			request.abortableTasks.delete(streamTask);
			request.pendingChunks++;
			task = streamTask.id.toString(16) + ":" + (supportsBYOB ? "r" : "R") + "\n";
			request.completedRegularChunks.push(stringToChunk(task));
			var aborted = !1;
			request.abortListeners.add(abortStream);
			reader.read().then(progress, error);
			return serializeByValueID(streamTask.id);
		}
		function serializeAsyncIterable(request, task, iterable, iterator) {
			function progress(entry) {
				if (!aborted) if (entry.done) {
					request.abortListeners.delete(abortIterable);
					if (void 0 === entry.value) var endStreamRow = streamTask.id.toString(16) + ":C\n";
					else try {
						var chunkId = outlineModel(request, entry.value);
						endStreamRow = streamTask.id.toString(16) + ":C" + stringify(serializeByValueID(chunkId)) + "\n";
					} catch (x) {
						error(x);
						return;
					}
					request.completedRegularChunks.push(stringToChunk(endStreamRow));
					enqueueFlush(request);
					aborted = !0;
				} else try {
					streamTask.model = entry.value, request.pendingChunks++, tryStreamTask(request, streamTask), enqueueFlush(request), callIteratorInDEV(iterator, progress, error);
				} catch (x$1) {
					error(x$1);
				}
			}
			function error(reason) {
				aborted || (aborted = !0, request.abortListeners.delete(abortIterable), erroredTask(request, streamTask, reason), enqueueFlush(request), "function" === typeof iterator.throw && iterator.throw(reason).then(error, error));
			}
			function abortIterable(reason) {
				aborted || (aborted = !0, request.abortListeners.delete(abortIterable), erroredTask(request, streamTask, reason), enqueueFlush(request), "function" === typeof iterator.throw && iterator.throw(reason).then(error, error));
			}
			var isIterator = iterable === iterator, streamTask = createTask(request, task.model, task.keyPath, task.implicitSlot, request.abortableTasks, task.debugOwner, task.debugStack, task.debugTask);
			request.abortableTasks.delete(streamTask);
			request.pendingChunks++;
			task = streamTask.id.toString(16) + ":" + (isIterator ? "x" : "X") + "\n";
			request.completedRegularChunks.push(stringToChunk(task));
			(iterable = iterable._debugInfo) && forwardDebugInfo(request, streamTask.id, iterable);
			var aborted = !1;
			request.abortListeners.add(abortIterable);
			callIteratorInDEV(iterator, progress, error);
			return serializeByValueID(streamTask.id);
		}
		function emitHint(request, code, model) {
			model = stringify(model);
			code = stringToChunk(":H" + code + model + "\n");
			request.completedHintChunks.push(code);
			enqueueFlush(request);
		}
		function readThenable(thenable) {
			if ("fulfilled" === thenable.status) return thenable.value;
			if ("rejected" === thenable.status) throw thenable.reason;
			throw thenable;
		}
		function createLazyWrapperAroundWakeable(wakeable) {
			switch (wakeable.status) {
				case "fulfilled":
				case "rejected": break;
				default: "string" !== typeof wakeable.status && (wakeable.status = "pending", wakeable.then(function(fulfilledValue) {
					"pending" === wakeable.status && (wakeable.status = "fulfilled", wakeable.value = fulfilledValue);
				}, function(error) {
					"pending" === wakeable.status && (wakeable.status = "rejected", wakeable.reason = error);
				}));
			}
			var lazyType = {
				$$typeof: REACT_LAZY_TYPE,
				_payload: wakeable,
				_init: readThenable
			};
			lazyType._debugInfo = wakeable._debugInfo || [];
			return lazyType;
		}
		function callWithDebugContextInDEV(request, task, callback, arg) {
			var componentDebugInfo = {
				name: "",
				env: task.environmentName,
				key: null,
				owner: task.debugOwner
			};
			componentDebugInfo.stack = null === task.debugStack ? null : filterStackTrace(request, task.debugStack, 1);
			componentDebugInfo.debugStack = task.debugStack;
			request = componentDebugInfo.debugTask = task.debugTask;
			currentOwner = componentDebugInfo;
			try {
				return request ? request.run(callback.bind(null, arg)) : callback(arg);
			} finally {
				currentOwner = null;
			}
		}
		function processServerComponentReturnValue(request, task, Component, result) {
			if ("object" !== typeof result || null === result || isClientReference(result)) return result;
			if ("function" === typeof result.then) return result.then(function(resolvedValue) {
				"object" === typeof resolvedValue && null !== resolvedValue && resolvedValue.$$typeof === REACT_ELEMENT_TYPE && (resolvedValue._store.validated = 1);
			}, voidHandler), "fulfilled" === result.status ? result.value : createLazyWrapperAroundWakeable(result);
			result.$$typeof === REACT_ELEMENT_TYPE && (result._store.validated = 1);
			var iteratorFn = getIteratorFn(result);
			if (iteratorFn) {
				var multiShot = _defineProperty({}, Symbol.iterator, function() {
					var iterator = iteratorFn.call(result);
					iterator !== result || "[object GeneratorFunction]" === Object.prototype.toString.call(Component) && "[object Generator]" === Object.prototype.toString.call(result) || callWithDebugContextInDEV(request, task, function() {
						console.error("Returning an Iterator from a Server Component is not supported since it cannot be looped over more than once. ");
					});
					return iterator;
				});
				multiShot._debugInfo = result._debugInfo;
				return multiShot;
			}
			return "function" !== typeof result[ASYNC_ITERATOR] || "function" === typeof ReadableStream && result instanceof ReadableStream ? result : (multiShot = _defineProperty({}, ASYNC_ITERATOR, function() {
				var iterator = result[ASYNC_ITERATOR]();
				iterator !== result || "[object AsyncGeneratorFunction]" === Object.prototype.toString.call(Component) && "[object AsyncGenerator]" === Object.prototype.toString.call(result) || callWithDebugContextInDEV(request, task, function() {
					console.error("Returning an AsyncIterator from a Server Component is not supported since it cannot be looped over more than once. ");
				});
				return iterator;
			}), multiShot._debugInfo = result._debugInfo, multiShot);
		}
		function renderFunctionComponent(request, task, key, Component, props, validated) {
			var prevThenableState = task.thenableState;
			task.thenableState = null;
			if (null === debugID) return outlineTask(request, task);
			if (null !== prevThenableState) var componentDebugInfo = prevThenableState._componentDebugInfo;
			else {
				var componentDebugID = debugID;
				componentDebugInfo = Component.displayName || Component.name || "";
				var componentEnv = (0, request.environmentName)();
				request.pendingChunks++;
				componentDebugInfo = {
					name: componentDebugInfo,
					env: componentEnv,
					key,
					owner: task.debugOwner
				};
				componentDebugInfo.stack = null === task.debugStack ? null : filterStackTrace(request, task.debugStack, 1);
				componentDebugInfo.props = props;
				componentDebugInfo.debugStack = task.debugStack;
				componentDebugInfo.debugTask = task.debugTask;
				outlineComponentInfo(request, componentDebugInfo);
				emitDebugChunk(request, componentDebugID, componentDebugInfo);
				task.environmentName = componentEnv;
				2 === validated && warnForMissingKey(request, key, componentDebugInfo, task.debugTask);
			}
			thenableIndexCounter = 0;
			thenableState = prevThenableState;
			currentComponentDebugInfo = componentDebugInfo;
			props = supportsComponentStorage ? task.debugTask ? task.debugTask.run(componentStorage.run.bind(componentStorage, componentDebugInfo, callComponentInDEV, Component, props, componentDebugInfo)) : componentStorage.run(componentDebugInfo, callComponentInDEV, Component, props, componentDebugInfo) : task.debugTask ? task.debugTask.run(callComponentInDEV.bind(null, Component, props, componentDebugInfo)) : callComponentInDEV(Component, props, componentDebugInfo);
			if (request.status === ABORTING) throw "object" !== typeof props || null === props || "function" !== typeof props.then || isClientReference(props) || props.then(voidHandler, voidHandler), null;
			props = processServerComponentReturnValue(request, task, Component, props);
			Component = task.keyPath;
			validated = task.implicitSlot;
			null !== key ? task.keyPath = null === Component ? key : Component + "," + key : null === Component && (task.implicitSlot = !0);
			request = renderModelDestructive(request, task, emptyRoot, "", props);
			task.keyPath = Component;
			task.implicitSlot = validated;
			return request;
		}
		function warnForMissingKey(request, key, componentDebugInfo, debugTask) {
			function logKeyError() {
				console.error("Each child in a list should have a unique \"key\" prop.%s%s See https://react.dev/link/warning-keys for more information.", "", "");
			}
			key = request.didWarnForKey;
			key ??= request.didWarnForKey = new WeakSet();
			request = componentDebugInfo.owner;
			if (null != request) {
				if (key.has(request)) return;
				key.add(request);
			}
			supportsComponentStorage ? debugTask ? debugTask.run(componentStorage.run.bind(componentStorage, componentDebugInfo, callComponentInDEV, logKeyError, null, componentDebugInfo)) : componentStorage.run(componentDebugInfo, callComponentInDEV, logKeyError, null, componentDebugInfo) : debugTask ? debugTask.run(callComponentInDEV.bind(null, logKeyError, null, componentDebugInfo)) : callComponentInDEV(logKeyError, null, componentDebugInfo);
		}
		function renderFragment(request, task, children) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				null === child || "object" !== typeof child || child.$$typeof !== REACT_ELEMENT_TYPE || null !== child.key || child._store.validated || (child._store.validated = 2);
			}
			if (null !== task.keyPath) return request = [
				REACT_ELEMENT_TYPE,
				REACT_FRAGMENT_TYPE,
				task.keyPath,
				{ children },
				null,
				null,
				0
			], task.implicitSlot ? [request] : request;
			if (i = children._debugInfo) {
				if (null === debugID) return outlineTask(request, task);
				forwardDebugInfo(request, debugID, i);
				children = Array.from(children);
			}
			return children;
		}
		function renderAsyncFragment(request, task, children, getAsyncIterator) {
			if (null !== task.keyPath) return request = [
				REACT_ELEMENT_TYPE,
				REACT_FRAGMENT_TYPE,
				task.keyPath,
				{ children },
				null,
				null,
				0
			], task.implicitSlot ? [request] : request;
			getAsyncIterator = getAsyncIterator.call(children);
			return serializeAsyncIterable(request, task, children, getAsyncIterator);
		}
		function outlineTask(request, task) {
			task = createTask(request, task.model, task.keyPath, task.implicitSlot, request.abortableTasks, task.debugOwner, task.debugStack, task.debugTask);
			retryTask(request, task);
			return task.status === COMPLETED ? serializeByValueID(task.id) : "$L" + task.id.toString(16);
		}
		function renderElement(request, task, type, key, ref, props, validated) {
			if (null !== ref && void 0 !== ref) throw Error("Refs cannot be used in Server Components, nor passed to Client Components.");
			jsxPropsParents.set(props, type);
			"object" === typeof props.children && null !== props.children && jsxChildrenParents.set(props.children, type);
			if ("function" !== typeof type || isClientReference(type) || type.$$typeof === TEMPORARY_REFERENCE_TAG) {
				if (type === REACT_FRAGMENT_TYPE && null === key) return 2 === validated && (validated = {
					name: "Fragment",
					env: (0, request.environmentName)(),
					key,
					owner: task.debugOwner,
					stack: null === task.debugStack ? null : filterStackTrace(request, task.debugStack, 1),
					props,
					debugStack: task.debugStack,
					debugTask: task.debugTask
				}, warnForMissingKey(request, key, validated, task.debugTask)), validated = task.implicitSlot, null === task.keyPath && (task.implicitSlot = !0), request = renderModelDestructive(request, task, emptyRoot, "", props.children), task.implicitSlot = validated, request;
				if (null != type && "object" === typeof type && !isClientReference(type)) switch (type.$$typeof) {
					case REACT_LAZY_TYPE:
						type = callLazyInitInDEV(type);
						if (request.status === ABORTING) throw null;
						return renderElement(request, task, type, key, ref, props, validated);
					case REACT_FORWARD_REF_TYPE: return renderFunctionComponent(request, task, key, type.render, props, validated);
					case REACT_MEMO_TYPE: return renderElement(request, task, type.type, key, ref, props, validated);
					case REACT_ELEMENT_TYPE: type._store.validated = 1;
				}
			} else return renderFunctionComponent(request, task, key, type, props, validated);
			ref = task.keyPath;
			null === key ? key = ref : null !== ref && (key = ref + "," + key);
			null !== task.debugOwner && outlineComponentInfo(request, task.debugOwner);
			request = [
				REACT_ELEMENT_TYPE,
				type,
				key,
				props,
				task.debugOwner,
				null === task.debugStack ? null : filterStackTrace(request, task.debugStack, 1),
				validated
			];
			task = task.implicitSlot && null !== key ? [request] : request;
			return task;
		}
		function pingTask(request, task) {
			var pingedTasks = request.pingedTasks;
			pingedTasks.push(task);
			1 === pingedTasks.length && (request.flushScheduled = null !== request.destination, request.type === PRERENDER || request.status === OPENING ? scheduleMicrotask(function() {
				return performWork(request);
			}) : setTimeout(function() {
				return performWork(request);
			}, 0));
		}
		function createTask(request, model, keyPath, implicitSlot, abortSet, debugOwner, debugStack, debugTask) {
			request.pendingChunks++;
			var id = request.nextChunkId++;
			"object" !== typeof model || null === model || null !== keyPath || implicitSlot || request.writtenObjects.set(model, serializeByValueID(id));
			var task = {
				id,
				status: PENDING$1,
				model,
				keyPath,
				implicitSlot,
				ping: function() {
					return pingTask(request, task);
				},
				toJSON: function(parentPropertyName, value) {
					var parent = this, originalValue = parent[parentPropertyName];
					"object" !== typeof originalValue || originalValue === value || originalValue instanceof Date || callWithDebugContextInDEV(request, task, function() {
						"Object" !== objectName(originalValue) ? "string" === typeof jsxChildrenParents.get(parent) ? console.error("%s objects cannot be rendered as text children. Try formatting it using toString().%s", objectName(originalValue), describeObjectForErrorMessage(parent, parentPropertyName)) : console.error("Only plain objects can be passed to Client Components from Server Components. %s objects are not supported.%s", objectName(originalValue), describeObjectForErrorMessage(parent, parentPropertyName)) : console.error("Only plain objects can be passed to Client Components from Server Components. Objects with toJSON methods are not supported. Convert it manually to a simple value before passing it to props.%s", describeObjectForErrorMessage(parent, parentPropertyName));
					});
					return renderModel(request, task, parent, parentPropertyName, value);
				},
				thenableState: null
			};
			task.environmentName = request.environmentName();
			task.debugOwner = debugOwner;
			task.debugStack = debugStack;
			task.debugTask = debugTask;
			abortSet.add(task);
			return task;
		}
		function serializeByValueID(id) {
			return "$" + id.toString(16);
		}
		function serializeNumber(number) {
			return Number.isFinite(number) ? 0 === number && -Infinity === 1 / number ? "$-0" : number : Infinity === number ? "$Infinity" : -Infinity === number ? "$-Infinity" : "$NaN";
		}
		function encodeReferenceChunk(request, id, reference) {
			request = stringify(reference);
			id = id.toString(16) + ":" + request + "\n";
			return stringToChunk(id);
		}
		function serializeClientReference(request, parent, parentPropertyName, clientReference) {
			var clientReferenceKey = clientReference.$$async ? clientReference.$$id + "#async" : clientReference.$$id, writtenClientReferences = request.writtenClientReferences, existingId = writtenClientReferences.get(clientReferenceKey);
			if (void 0 !== existingId) return parent[0] === REACT_ELEMENT_TYPE && "1" === parentPropertyName ? "$L" + existingId.toString(16) : serializeByValueID(existingId);
			try {
				var config = request.bundlerConfig, modulePath = clientReference.$$id;
				existingId = "";
				var resolvedModuleData = config[modulePath];
				if (resolvedModuleData) existingId = resolvedModuleData.name;
				else {
					var idx = modulePath.lastIndexOf("#");
					-1 !== idx && (existingId = modulePath.slice(idx + 1), resolvedModuleData = config[modulePath.slice(0, idx)]);
					if (!resolvedModuleData) throw Error("Could not find the module \"" + modulePath + "\" in the React Client Manifest. This is probably a bug in the React Server Components bundler.");
				}
				if (!0 === resolvedModuleData.async && !0 === clientReference.$$async) throw Error("The module \"" + modulePath + "\" is marked as an async ESM module but was loaded as a CJS proxy. This is probably a bug in the React Server Components bundler.");
				var clientReferenceMetadata = !0 === resolvedModuleData.async || !0 === clientReference.$$async ? [
					resolvedModuleData.id,
					resolvedModuleData.chunks,
					existingId,
					1
				] : [
					resolvedModuleData.id,
					resolvedModuleData.chunks,
					existingId
				];
				request.pendingChunks++;
				var importId = request.nextChunkId++, json = stringify(clientReferenceMetadata), row = importId.toString(16) + ":I" + json + "\n", processedChunk = stringToChunk(row);
				request.completedImportChunks.push(processedChunk);
				writtenClientReferences.set(clientReferenceKey, importId);
				return parent[0] === REACT_ELEMENT_TYPE && "1" === parentPropertyName ? "$L" + importId.toString(16) : serializeByValueID(importId);
			} catch (x) {
				return request.pendingChunks++, parent = request.nextChunkId++, parentPropertyName = logRecoverableError(request, x, null), emitErrorChunk(request, parent, parentPropertyName, x), serializeByValueID(parent);
			}
		}
		function outlineModel(request, value) {
			value = createTask(request, value, null, !1, request.abortableTasks, null, null, null);
			retryTask(request, value);
			return value.id;
		}
		function serializeServerReference(request, serverReference) {
			var writtenServerReferences = request.writtenServerReferences, existingId = writtenServerReferences.get(serverReference);
			if (void 0 !== existingId) return "$F" + existingId.toString(16);
			existingId = serverReference.$$bound;
			existingId = null === existingId ? null : Promise.resolve(existingId);
			var id = serverReference.$$id, location = null, error = serverReference.$$location;
			error && (error = parseStackTrace(error, 1), 0 < error.length && (location = error[0]));
			existingId = null !== location ? {
				id,
				bound: existingId,
				name: "function" === typeof serverReference ? serverReference.name : "",
				env: (0, request.environmentName)(),
				location
			} : {
				id,
				bound: existingId
			};
			request = outlineModel(request, existingId);
			writtenServerReferences.set(serverReference, request);
			return "$F" + request.toString(16);
		}
		function serializeLargeTextString(request, text) {
			request.pendingChunks++;
			var textId = request.nextChunkId++;
			emitTextChunk(request, textId, text);
			return serializeByValueID(textId);
		}
		function serializeMap(request, map) {
			map = Array.from(map);
			return "$Q" + outlineModel(request, map).toString(16);
		}
		function serializeFormData(request, formData) {
			formData = Array.from(formData.entries());
			return "$K" + outlineModel(request, formData).toString(16);
		}
		function serializeSet(request, set) {
			set = Array.from(set);
			return "$W" + outlineModel(request, set).toString(16);
		}
		function serializeTypedArray(request, tag, typedArray) {
			request.pendingChunks++;
			var bufferId = request.nextChunkId++;
			emitTypedArrayChunk(request, bufferId, tag, typedArray);
			return serializeByValueID(bufferId);
		}
		function serializeBlob(request, blob) {
			function progress(entry) {
				if (!aborted) if (entry.done) request.abortListeners.delete(abortBlob), aborted = !0, pingTask(request, newTask);
				else return model.push(entry.value), reader.read().then(progress).catch(error);
			}
			function error(reason) {
				aborted || (aborted = !0, request.abortListeners.delete(abortBlob), erroredTask(request, newTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
			}
			function abortBlob(reason) {
				aborted || (aborted = !0, request.abortListeners.delete(abortBlob), erroredTask(request, newTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
			}
			var model = [blob.type], newTask = createTask(request, model, null, !1, request.abortableTasks, null, null, null), reader = blob.stream().getReader(), aborted = !1;
			request.abortListeners.add(abortBlob);
			reader.read().then(progress).catch(error);
			return "$B" + newTask.id.toString(16);
		}
		function renderModel(request, task, parent, key, value) {
			var prevKeyPath = task.keyPath, prevImplicitSlot = task.implicitSlot;
			try {
				return renderModelDestructive(request, task, parent, key, value);
			} catch (thrownValue) {
				parent = task.model;
				parent = "object" === typeof parent && null !== parent && (parent.$$typeof === REACT_ELEMENT_TYPE || parent.$$typeof === REACT_LAZY_TYPE);
				if (request.status === ABORTING) return task.status = ABORTED, task = request.fatalError, parent ? "$L" + task.toString(16) : serializeByValueID(task);
				key = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
				if ("object" === typeof key && null !== key && "function" === typeof key.then) return request = createTask(request, task.model, task.keyPath, task.implicitSlot, request.abortableTasks, task.debugOwner, task.debugStack, task.debugTask), value = request.ping, key.then(value, value), request.thenableState = getThenableStateAfterSuspending(), task.keyPath = prevKeyPath, task.implicitSlot = prevImplicitSlot, parent ? "$L" + request.id.toString(16) : serializeByValueID(request.id);
				task.keyPath = prevKeyPath;
				task.implicitSlot = prevImplicitSlot;
				request.pendingChunks++;
				prevKeyPath = request.nextChunkId++;
				task = logRecoverableError(request, key, task);
				emitErrorChunk(request, prevKeyPath, task, key);
				return parent ? "$L" + prevKeyPath.toString(16) : serializeByValueID(prevKeyPath);
			}
		}
		function renderModelDestructive(request, task, parent, parentPropertyName, value) {
			task.model = value;
			if (value === REACT_ELEMENT_TYPE) return "$";
			if (null === value) return null;
			if ("object" === typeof value) {
				switch (value.$$typeof) {
					case REACT_ELEMENT_TYPE:
						var elementReference = null, _writtenObjects = request.writtenObjects;
						if (null === task.keyPath && !task.implicitSlot) {
							var _existingReference = _writtenObjects.get(value);
							if (void 0 !== _existingReference) if (modelRoot === value) modelRoot = null;
							else return _existingReference;
							else -1 === parentPropertyName.indexOf(":") && (_existingReference = _writtenObjects.get(parent), void 0 !== _existingReference && (elementReference = _existingReference + ":" + parentPropertyName, _writtenObjects.set(value, elementReference)));
						}
						if (_existingReference = value._debugInfo) {
							if (null === debugID) return outlineTask(request, task);
							forwardDebugInfo(request, debugID, _existingReference);
						}
						_existingReference = value.props;
						var refProp = _existingReference.ref;
						task.debugOwner = value._owner;
						task.debugStack = value._debugStack;
						task.debugTask = value._debugTask;
						request = renderElement(request, task, value.type, value.key, void 0 !== refProp ? refProp : null, _existingReference, value._store.validated);
						"object" === typeof request && null !== request && null !== elementReference && (_writtenObjects.has(request) || _writtenObjects.set(request, elementReference));
						return request;
					case REACT_LAZY_TYPE:
						task.thenableState = null;
						elementReference = callLazyInitInDEV(value);
						if (request.status === ABORTING) throw null;
						if (_writtenObjects = value._debugInfo) {
							if (null === debugID) return outlineTask(request, task);
							forwardDebugInfo(request, debugID, _writtenObjects);
						}
						return renderModelDestructive(request, task, emptyRoot, "", elementReference);
					case REACT_LEGACY_ELEMENT_TYPE: throw Error("A React Element from an older version of React was rendered. This is not supported. It can happen if:\n- Multiple copies of the \"react\" package is used.\n- A library pre-bundled an old copy of \"react\" or \"react/jsx-runtime\".\n- A compiler tries to \"inline\" JSX instead of using the runtime.");
				}
				if (isClientReference(value)) return serializeClientReference(request, parent, parentPropertyName, value);
				if (void 0 !== request.temporaryReferences && (elementReference = request.temporaryReferences.get(value), void 0 !== elementReference)) return "$T" + elementReference;
				elementReference = request.writtenObjects;
				_writtenObjects = elementReference.get(value);
				if ("function" === typeof value.then) {
					if (void 0 !== _writtenObjects) {
						if (null !== task.keyPath || task.implicitSlot) return "$@" + serializeThenable(request, task, value).toString(16);
						if (modelRoot === value) modelRoot = null;
						else return _writtenObjects;
					}
					request = "$@" + serializeThenable(request, task, value).toString(16);
					elementReference.set(value, request);
					return request;
				}
				if (void 0 !== _writtenObjects) if (modelRoot === value) modelRoot = null;
				else return _writtenObjects;
				else if (-1 === parentPropertyName.indexOf(":") && (_writtenObjects = elementReference.get(parent), void 0 !== _writtenObjects)) {
					_existingReference = parentPropertyName;
					if (isArrayImpl(parent) && parent[0] === REACT_ELEMENT_TYPE) switch (parentPropertyName) {
						case "1":
							_existingReference = "type";
							break;
						case "2":
							_existingReference = "key";
							break;
						case "3":
							_existingReference = "props";
							break;
						case "4": _existingReference = "_owner";
					}
					elementReference.set(value, _writtenObjects + ":" + _existingReference);
				}
				if (isArrayImpl(value)) return renderFragment(request, task, value);
				if (value instanceof Map) return serializeMap(request, value);
				if (value instanceof Set) return serializeSet(request, value);
				if ("function" === typeof FormData && value instanceof FormData) return serializeFormData(request, value);
				if (value instanceof Error) return serializeErrorValue(request, value);
				if (value instanceof ArrayBuffer) return serializeTypedArray(request, "A", new Uint8Array(value));
				if (value instanceof Int8Array) return serializeTypedArray(request, "O", value);
				if (value instanceof Uint8Array) return serializeTypedArray(request, "o", value);
				if (value instanceof Uint8ClampedArray) return serializeTypedArray(request, "U", value);
				if (value instanceof Int16Array) return serializeTypedArray(request, "S", value);
				if (value instanceof Uint16Array) return serializeTypedArray(request, "s", value);
				if (value instanceof Int32Array) return serializeTypedArray(request, "L", value);
				if (value instanceof Uint32Array) return serializeTypedArray(request, "l", value);
				if (value instanceof Float32Array) return serializeTypedArray(request, "G", value);
				if (value instanceof Float64Array) return serializeTypedArray(request, "g", value);
				if (value instanceof BigInt64Array) return serializeTypedArray(request, "M", value);
				if (value instanceof BigUint64Array) return serializeTypedArray(request, "m", value);
				if (value instanceof DataView) return serializeTypedArray(request, "V", value);
				if ("function" === typeof Blob && value instanceof Blob) return serializeBlob(request, value);
				if (elementReference = getIteratorFn(value)) return elementReference = elementReference.call(value), elementReference === value ? "$i" + outlineModel(request, Array.from(elementReference)).toString(16) : renderFragment(request, task, Array.from(elementReference));
				if ("function" === typeof ReadableStream && value instanceof ReadableStream) return serializeReadableStream(request, task, value);
				elementReference = value[ASYNC_ITERATOR];
				if ("function" === typeof elementReference) return renderAsyncFragment(request, task, value, elementReference);
				if (value instanceof Date) return "$D" + value.toJSON();
				elementReference = getPrototypeOf(value);
				if (elementReference !== ObjectPrototype && (null === elementReference || null !== getPrototypeOf(elementReference))) throw Error("Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported." + describeObjectForErrorMessage(parent, parentPropertyName));
				if ("Object" !== objectName(value)) callWithDebugContextInDEV(request, task, function() {
					console.error("Only plain objects can be passed to Client Components from Server Components. %s objects are not supported.%s", objectName(value), describeObjectForErrorMessage(parent, parentPropertyName));
				});
				else if (!isSimpleObject(value)) callWithDebugContextInDEV(request, task, function() {
					console.error("Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.%s", describeObjectForErrorMessage(parent, parentPropertyName));
				});
				else if (Object.getOwnPropertySymbols) {
					var symbols = Object.getOwnPropertySymbols(value);
					0 < symbols.length && callWithDebugContextInDEV(request, task, function() {
						console.error("Only plain objects can be passed to Client Components from Server Components. Objects with symbol properties like %s are not supported.%s", symbols[0].description, describeObjectForErrorMessage(parent, parentPropertyName));
					});
				}
				return value;
			}
			if ("string" === typeof value) return "Z" === value[value.length - 1] && parent[parentPropertyName] instanceof Date ? "$D" + value : 1024 <= value.length && null !== byteLengthOfChunk ? serializeLargeTextString(request, value) : "$" === value[0] ? "$" + value : value;
			if ("boolean" === typeof value) return value;
			if ("number" === typeof value) return serializeNumber(value);
			if ("undefined" === typeof value) return "$undefined";
			if ("function" === typeof value) {
				if (isClientReference(value)) return serializeClientReference(request, parent, parentPropertyName, value);
				if (value.$$typeof === SERVER_REFERENCE_TAG) return serializeServerReference(request, value);
				if (void 0 !== request.temporaryReferences && (request = request.temporaryReferences.get(value), void 0 !== request)) return "$T" + request;
				if (value.$$typeof === TEMPORARY_REFERENCE_TAG) throw Error("Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.");
				if (/^on[A-Z]/.test(parentPropertyName)) throw Error("Event handlers cannot be passed to Client Component props." + describeObjectForErrorMessage(parent, parentPropertyName) + "\nIf you need interactivity, consider converting part of this to a Client Component.");
				if (jsxChildrenParents.has(parent) || jsxPropsParents.has(parent) && "children" === parentPropertyName) throw request = value.displayName || value.name || "Component", Error("Functions are not valid as a child of Client Components. This may happen if you return " + request + " instead of <" + request + " /> from render. Or maybe you meant to call this function rather than return it." + describeObjectForErrorMessage(parent, parentPropertyName));
				throw Error("Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with \"use server\". Or maybe you meant to call this function rather than return it." + describeObjectForErrorMessage(parent, parentPropertyName));
			}
			if ("symbol" === typeof value) {
				task = request.writtenSymbols;
				elementReference = task.get(value);
				if (void 0 !== elementReference) return serializeByValueID(elementReference);
				elementReference = value.description;
				if (Symbol.for(elementReference) !== value) throw Error("Only global symbols received from Symbol.for(...) can be passed to Client Components. The symbol Symbol.for(" + (value.description + ") cannot be found among global symbols.") + describeObjectForErrorMessage(parent, parentPropertyName));
				request.pendingChunks++;
				_writtenObjects = request.nextChunkId++;
				emitSymbolChunk(request, _writtenObjects, elementReference);
				task.set(value, _writtenObjects);
				return serializeByValueID(_writtenObjects);
			}
			if ("bigint" === typeof value) return "$n" + value.toString(10);
			throw Error("Type " + typeof value + " is not supported in Client Component props." + describeObjectForErrorMessage(parent, parentPropertyName));
		}
		function logRecoverableError(request, error, task) {
			var prevRequest = currentRequest;
			currentRequest = null;
			try {
				var onError = request.onError;
				var errorDigest = null !== task ? supportsRequestStorage ? requestStorage.run(void 0, callWithDebugContextInDEV, request, task, onError, error) : callWithDebugContextInDEV(request, task, onError, error) : supportsRequestStorage ? requestStorage.run(void 0, onError, error) : onError(error);
			} finally {
				currentRequest = prevRequest;
			}
			if (null != errorDigest && "string" !== typeof errorDigest) throw Error("onError returned something with a type other than \"string\". onError should return a string and may return null or undefined but must not return anything else. It received something of type \"" + typeof errorDigest + "\" instead");
			return errorDigest || "";
		}
		function fatalError(request, error) {
			var onFatalError = request.onFatalError;
			onFatalError(error);
			null !== request.destination ? (request.status = CLOSED, closeWithError(request.destination, error)) : (request.status = CLOSING, request.fatalError = error);
		}
		function serializeErrorValue(request, error) {
			var name = "Error", env = (0, request.environmentName)();
			try {
				name = error.name;
				var message = String(error.message);
				var stack = filterStackTrace(request, error, 0);
				var errorEnv = error.environmentName;
				"string" === typeof errorEnv && (env = errorEnv);
			} catch (x) {
				message = "An error occurred but serializing the error message failed.", stack = [];
			}
			return "$Z" + outlineModel(request, {
				name,
				message,
				stack,
				env
			}).toString(16);
		}
		function emitErrorChunk(request, id, digest, error) {
			var name = "Error", env = (0, request.environmentName)();
			try {
				if (error instanceof Error) {
					name = error.name;
					var message = String(error.message);
					var stack = filterStackTrace(request, error, 0);
					var errorEnv = error.environmentName;
					"string" === typeof errorEnv && (env = errorEnv);
				} else message = "object" === typeof error && null !== error ? describeObjectForErrorMessage(error) : String(error), stack = [];
			} catch (x) {
				message = "An error occurred but serializing the error message failed.", stack = [];
			}
			digest = {
				digest,
				name,
				message,
				stack,
				env
			};
			id = id.toString(16) + ":E" + stringify(digest) + "\n";
			id = stringToChunk(id);
			request.completedErrorChunks.push(id);
		}
		function emitSymbolChunk(request, id, name) {
			id = encodeReferenceChunk(request, id, "$S" + name);
			request.completedImportChunks.push(id);
		}
		function emitModelChunk(request, id, json) {
			id = id.toString(16) + ":" + json + "\n";
			id = stringToChunk(id);
			request.completedRegularChunks.push(id);
		}
		function emitDebugChunk(request, id, debugInfo) {
			var counter = { objectLimit: 500 };
			debugInfo = stringify(debugInfo, function(parentPropertyName, value) {
				return renderConsoleValue(request, counter, this, parentPropertyName, value);
			});
			id = id.toString(16) + ":D" + debugInfo + "\n";
			id = stringToChunk(id);
			request.completedRegularChunks.push(id);
		}
		function outlineComponentInfo(request, componentInfo) {
			if (!request.writtenObjects.has(componentInfo)) {
				null != componentInfo.owner && outlineComponentInfo(request, componentInfo.owner);
				var objectLimit = 10;
				null != componentInfo.stack && (objectLimit += componentInfo.stack.length);
				objectLimit = { objectLimit };
				var componentDebugInfo = {
					name: componentInfo.name,
					env: componentInfo.env,
					key: componentInfo.key,
					owner: componentInfo.owner
				};
				componentDebugInfo.stack = componentInfo.stack;
				componentDebugInfo.props = componentInfo.props;
				objectLimit = outlineConsoleValue(request, objectLimit, componentDebugInfo);
				request.writtenObjects.set(componentInfo, serializeByValueID(objectLimit));
			}
		}
		function emitTypedArrayChunk(request, id, tag, typedArray) {
			request.pendingChunks++;
			var buffer = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
			typedArray = 2048 < typedArray.byteLength ? buffer.slice() : buffer;
			buffer = typedArray.byteLength;
			id = id.toString(16) + ":" + tag + buffer.toString(16) + ",";
			id = stringToChunk(id);
			request.completedRegularChunks.push(id, typedArray);
		}
		function emitTextChunk(request, id, text) {
			if (null === byteLengthOfChunk) throw Error("Existence of byteLengthOfChunk should have already been checked. This is a bug in React.");
			request.pendingChunks++;
			text = stringToChunk(text);
			var binaryLength = text.byteLength;
			id = id.toString(16) + ":T" + binaryLength.toString(16) + ",";
			id = stringToChunk(id);
			request.completedRegularChunks.push(id, text);
		}
		function renderConsoleValue(request, counter, parent, parentPropertyName, value) {
			if (null === value) return null;
			if (value === REACT_ELEMENT_TYPE) return "$";
			if ("object" === typeof value) {
				if (isClientReference(value)) return serializeClientReference(request, parent, parentPropertyName, value);
				if (void 0 !== request.temporaryReferences && (parent = request.temporaryReferences.get(value), void 0 !== parent)) return "$T" + parent;
				parent = request.writtenObjects.get(value);
				if (void 0 !== parent) return parent;
				if (0 >= counter.objectLimit && !doNotLimit.has(value)) return "$Y";
				counter.objectLimit--;
				switch (value.$$typeof) {
					case REACT_ELEMENT_TYPE:
						null != value._owner && outlineComponentInfo(request, value._owner);
						"object" === typeof value.type && null !== value.type && doNotLimit.add(value.type);
						"object" === typeof value.key && null !== value.key && doNotLimit.add(value.key);
						doNotLimit.add(value.props);
						null !== value._owner && doNotLimit.add(value._owner);
						counter = null;
						if (null != value._debugStack) for (counter = filterStackTrace(request, value._debugStack, 1), doNotLimit.add(counter), request = 0; request < counter.length; request++) doNotLimit.add(counter[request]);
						return [
							REACT_ELEMENT_TYPE,
							value.type,
							value.key,
							value.props,
							value._owner,
							counter,
							value._store.validated
						];
				}
				if ("function" === typeof value.then) {
					switch (value.status) {
						case "fulfilled": return "$@" + outlineConsoleValue(request, counter, value.value).toString(16);
						case "rejected": return counter = value.reason, request.pendingChunks++, value = request.nextChunkId++, emitErrorChunk(request, value, "", counter), "$@" + value.toString(16);
					}
					return "$@";
				}
				if (isArrayImpl(value)) return value;
				if (value instanceof Map) {
					value = Array.from(value);
					counter.objectLimit++;
					for (parent = 0; parent < value.length; parent++) {
						var entry = value[parent];
						doNotLimit.add(entry);
						parentPropertyName = entry[0];
						entry = entry[1];
						"object" === typeof parentPropertyName && null !== parentPropertyName && doNotLimit.add(parentPropertyName);
						"object" === typeof entry && null !== entry && doNotLimit.add(entry);
					}
					return "$Q" + outlineConsoleValue(request, counter, value).toString(16);
				}
				if (value instanceof Set) {
					value = Array.from(value);
					counter.objectLimit++;
					for (parent = 0; parent < value.length; parent++) parentPropertyName = value[parent], "object" === typeof parentPropertyName && null !== parentPropertyName && doNotLimit.add(parentPropertyName);
					return "$W" + outlineConsoleValue(request, counter, value).toString(16);
				}
				return "function" === typeof FormData && value instanceof FormData ? serializeFormData(request, value) : value instanceof Error ? serializeErrorValue(request, value) : value instanceof ArrayBuffer ? serializeTypedArray(request, "A", new Uint8Array(value)) : value instanceof Int8Array ? serializeTypedArray(request, "O", value) : value instanceof Uint8Array ? serializeTypedArray(request, "o", value) : value instanceof Uint8ClampedArray ? serializeTypedArray(request, "U", value) : value instanceof Int16Array ? serializeTypedArray(request, "S", value) : value instanceof Uint16Array ? serializeTypedArray(request, "s", value) : value instanceof Int32Array ? serializeTypedArray(request, "L", value) : value instanceof Uint32Array ? serializeTypedArray(request, "l", value) : value instanceof Float32Array ? serializeTypedArray(request, "G", value) : value instanceof Float64Array ? serializeTypedArray(request, "g", value) : value instanceof BigInt64Array ? serializeTypedArray(request, "M", value) : value instanceof BigUint64Array ? serializeTypedArray(request, "m", value) : value instanceof DataView ? serializeTypedArray(request, "V", value) : "function" === typeof Blob && value instanceof Blob ? serializeBlob(request, value) : getIteratorFn(value) ? Array.from(value) : value;
			}
			if ("string" === typeof value) return "Z" === value[value.length - 1] && parent[parentPropertyName] instanceof Date ? "$D" + value : 1024 <= value.length ? serializeLargeTextString(request, value) : "$" === value[0] ? "$" + value : value;
			if ("boolean" === typeof value) return value;
			if ("number" === typeof value) return serializeNumber(value);
			if ("undefined" === typeof value) return "$undefined";
			if ("function" === typeof value) return isClientReference(value) ? serializeClientReference(request, parent, parentPropertyName, value) : void 0 !== request.temporaryReferences && (request = request.temporaryReferences.get(value), void 0 !== request) ? "$T" + request : "$E(" + (Function.prototype.toString.call(value) + ")");
			if ("symbol" === typeof value) {
				counter = request.writtenSymbols.get(value);
				if (void 0 !== counter) return serializeByValueID(counter);
				counter = value.description;
				request.pendingChunks++;
				value = request.nextChunkId++;
				emitSymbolChunk(request, value, counter);
				return serializeByValueID(value);
			}
			return "bigint" === typeof value ? "$n" + value.toString(10) : value instanceof Date ? "$D" + value.toJSON() : "unknown type " + typeof value;
		}
		function outlineConsoleValue(request, counter, model) {
			function replacer(parentPropertyName, value) {
				try {
					return renderConsoleValue(request, counter, this, parentPropertyName, value);
				} catch (x) {
					return "Unknown Value: React could not send it from the server.\n" + x.message;
				}
			}
			"object" === typeof model && null !== model && doNotLimit.add(model);
			try {
				var json = stringify(model, replacer);
			} catch (x) {
				json = stringify("Unknown Value: React could not send it from the server.\n" + x.message);
			}
			request.pendingChunks++;
			model = request.nextChunkId++;
			json = model.toString(16) + ":" + json + "\n";
			json = stringToChunk(json);
			request.completedRegularChunks.push(json);
			return model;
		}
		function emitConsoleChunk(request, methodName, owner, stackTrace, args) {
			function replacer(parentPropertyName, value) {
				try {
					return renderConsoleValue(request, counter, this, parentPropertyName, value);
				} catch (x) {
					return "Unknown Value: React could not send it from the server.\n" + x.message;
				}
			}
			var counter = { objectLimit: 500 };
			null != owner && outlineComponentInfo(request, owner);
			var env = (0, request.environmentName)(), payload = [
				methodName,
				stackTrace,
				owner,
				env
			];
			payload.push.apply(payload, args);
			try {
				var json = stringify(payload, replacer);
			} catch (x) {
				json = stringify([
					methodName,
					stackTrace,
					owner,
					env,
					"Unknown Value: React could not send it from the server.",
					x
				], replacer);
			}
			methodName = stringToChunk(":W" + json + "\n");
			request.completedRegularChunks.push(methodName);
		}
		function forwardDebugInfo(request, id, debugInfo) {
			for (var i = 0; i < debugInfo.length; i++) "number" !== typeof debugInfo[i].time && (request.pendingChunks++, "string" === typeof debugInfo[i].name && outlineComponentInfo(request, debugInfo[i]), emitDebugChunk(request, id, debugInfo[i]));
		}
		function emitChunk(request, task, value) {
			var id = task.id;
			"string" === typeof value && null !== byteLengthOfChunk ? emitTextChunk(request, id, value) : value instanceof ArrayBuffer ? emitTypedArrayChunk(request, id, "A", new Uint8Array(value)) : value instanceof Int8Array ? emitTypedArrayChunk(request, id, "O", value) : value instanceof Uint8Array ? emitTypedArrayChunk(request, id, "o", value) : value instanceof Uint8ClampedArray ? emitTypedArrayChunk(request, id, "U", value) : value instanceof Int16Array ? emitTypedArrayChunk(request, id, "S", value) : value instanceof Uint16Array ? emitTypedArrayChunk(request, id, "s", value) : value instanceof Int32Array ? emitTypedArrayChunk(request, id, "L", value) : value instanceof Uint32Array ? emitTypedArrayChunk(request, id, "l", value) : value instanceof Float32Array ? emitTypedArrayChunk(request, id, "G", value) : value instanceof Float64Array ? emitTypedArrayChunk(request, id, "g", value) : value instanceof BigInt64Array ? emitTypedArrayChunk(request, id, "M", value) : value instanceof BigUint64Array ? emitTypedArrayChunk(request, id, "m", value) : value instanceof DataView ? emitTypedArrayChunk(request, id, "V", value) : (value = stringify(value, task.toJSON), emitModelChunk(request, task.id, value));
		}
		function erroredTask(request, task, error) {
			request.abortableTasks.delete(task);
			task.status = ERRORED$1;
			var digest = logRecoverableError(request, error, task);
			emitErrorChunk(request, task.id, digest, error);
		}
		function retryTask(request, task) {
			if (task.status === PENDING$1) {
				var prevDebugID = debugID;
				task.status = RENDERING;
				try {
					modelRoot = task.model;
					debugID = task.id;
					var resolvedModel = renderModelDestructive(request, task, emptyRoot, "", task.model);
					debugID = null;
					modelRoot = resolvedModel;
					task.keyPath = null;
					task.implicitSlot = !1;
					var currentEnv = (0, request.environmentName)();
					currentEnv !== task.environmentName && (request.pendingChunks++, emitDebugChunk(request, task.id, { env: currentEnv }));
					if ("object" === typeof resolvedModel && null !== resolvedModel) request.writtenObjects.set(resolvedModel, serializeByValueID(task.id)), emitChunk(request, task, resolvedModel);
					else {
						var json = stringify(resolvedModel);
						emitModelChunk(request, task.id, json);
					}
					request.abortableTasks.delete(task);
					task.status = COMPLETED;
				} catch (thrownValue) {
					if (request.status === ABORTING) {
						request.abortableTasks.delete(task);
						task.status = ABORTED;
						var model = stringify(serializeByValueID(request.fatalError));
						emitModelChunk(request, task.id, model);
					} else {
						var x = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
						if ("object" === typeof x && null !== x && "function" === typeof x.then) {
							task.status = PENDING$1;
							task.thenableState = getThenableStateAfterSuspending();
							var ping = task.ping;
							x.then(ping, ping);
						} else erroredTask(request, task, x);
					}
				} finally {
					debugID = prevDebugID;
				}
			}
		}
		function tryStreamTask(request, task) {
			var prevDebugID = debugID;
			debugID = null;
			try {
				emitChunk(request, task, task.model);
			} finally {
				debugID = prevDebugID;
			}
		}
		function performWork(request) {
			var prevDispatcher = ReactSharedInternalsServer.H;
			ReactSharedInternalsServer.H = HooksDispatcher;
			var prevRequest = currentRequest;
			currentRequest$1 = currentRequest = request;
			var hadAbortableTasks = 0 < request.abortableTasks.size;
			try {
				var pingedTasks = request.pingedTasks;
				request.pingedTasks = [];
				for (var i = 0; i < pingedTasks.length; i++) retryTask(request, pingedTasks[i]);
				null !== request.destination && flushCompletedChunks(request, request.destination);
				if (hadAbortableTasks && 0 === request.abortableTasks.size) {
					var onAllReady = request.onAllReady;
					onAllReady();
				}
			} catch (error) {
				logRecoverableError(request, error, null), fatalError(request, error);
			} finally {
				ReactSharedInternalsServer.H = prevDispatcher, currentRequest$1 = null, currentRequest = prevRequest;
			}
		}
		function flushCompletedChunks(request, destination) {
			currentView = new Uint8Array(2048);
			writtenBytes = 0;
			try {
				for (var importsChunks = request.completedImportChunks, i = 0; i < importsChunks.length; i++) if (request.pendingChunks--, !writeChunkAndReturn(destination, importsChunks[i])) {
					request.destination = null;
					i++;
					break;
				}
				importsChunks.splice(0, i);
				var hintChunks = request.completedHintChunks;
				for (i = 0; i < hintChunks.length; i++) if (!writeChunkAndReturn(destination, hintChunks[i])) {
					request.destination = null;
					i++;
					break;
				}
				hintChunks.splice(0, i);
				var regularChunks = request.completedRegularChunks;
				for (i = 0; i < regularChunks.length; i++) if (request.pendingChunks--, !writeChunkAndReturn(destination, regularChunks[i])) {
					request.destination = null;
					i++;
					break;
				}
				regularChunks.splice(0, i);
				var errorChunks = request.completedErrorChunks;
				for (i = 0; i < errorChunks.length; i++) if (request.pendingChunks--, !writeChunkAndReturn(destination, errorChunks[i])) {
					request.destination = null;
					i++;
					break;
				}
				errorChunks.splice(0, i);
			} finally {
				request.flushScheduled = !1, currentView && 0 < writtenBytes && (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)), currentView = null, writtenBytes = 0);
			}
			0 === request.pendingChunks && (request.status = CLOSED, destination.close(), request.destination = null);
		}
		function startWork(request) {
			request.flushScheduled = null !== request.destination;
			supportsRequestStorage ? scheduleMicrotask(function() {
				requestStorage.run(request, performWork, request);
			}) : scheduleMicrotask(function() {
				return performWork(request);
			});
			setTimeout(function() {
				request.status === OPENING && (request.status = 11);
			}, 0);
		}
		function enqueueFlush(request) {
			!1 === request.flushScheduled && 0 === request.pingedTasks.length && null !== request.destination && (request.flushScheduled = !0, setTimeout(function() {
				request.flushScheduled = !1;
				var destination = request.destination;
				destination && flushCompletedChunks(request, destination);
			}, 0));
		}
		function startFlowing(request, destination) {
			if (request.status === CLOSING) request.status = CLOSED, closeWithError(destination, request.fatalError);
			else if (request.status !== CLOSED && null === request.destination) {
				request.destination = destination;
				try {
					flushCompletedChunks(request, destination);
				} catch (error) {
					logRecoverableError(request, error, null), fatalError(request, error);
				}
			}
		}
		function abort(request, reason) {
			try {
				11 >= request.status && (request.status = ABORTING);
				var abortableTasks = request.abortableTasks;
				if (0 < abortableTasks.size) {
					var error = void 0 === reason ? Error("The render was aborted by the server without a reason.") : "object" === typeof reason && null !== reason && "function" === typeof reason.then ? Error("The render was aborted by the server with a promise.") : reason, digest = logRecoverableError(request, error, null), _errorId2 = request.nextChunkId++;
					request.fatalError = _errorId2;
					request.pendingChunks++;
					emitErrorChunk(request, _errorId2, digest, error);
					abortableTasks.forEach(function(task) {
						if (task.status !== RENDERING) {
							task.status = ABORTED;
							var ref = serializeByValueID(_errorId2);
							task = encodeReferenceChunk(request, task.id, ref);
							request.completedErrorChunks.push(task);
						}
					});
					abortableTasks.clear();
					var onAllReady = request.onAllReady;
					onAllReady();
				}
				var abortListeners = request.abortListeners;
				if (0 < abortListeners.size) {
					var _error = void 0 === reason ? Error("The render was aborted by the server without a reason.") : "object" === typeof reason && null !== reason && "function" === typeof reason.then ? Error("The render was aborted by the server with a promise.") : reason;
					abortListeners.forEach(function(callback) {
						return callback(_error);
					});
					abortListeners.clear();
				}
				null !== request.destination && flushCompletedChunks(request, request.destination);
			} catch (error$2) {
				logRecoverableError(request, error$2, null), fatalError(request, error$2);
			}
		}
		function resolveServerReference(bundlerConfig, id) {
			var name = "", resolvedModuleData = bundlerConfig[id];
			if (resolvedModuleData) name = resolvedModuleData.name;
			else {
				var idx = id.lastIndexOf("#");
				-1 !== idx && (name = id.slice(idx + 1), resolvedModuleData = bundlerConfig[id.slice(0, idx)]);
				if (!resolvedModuleData) throw Error("Could not find the module \"" + id + "\" in the React Server Manifest. This is probably a bug in the React Server Components bundler.");
			}
			return resolvedModuleData.async ? [
				resolvedModuleData.id,
				resolvedModuleData.chunks,
				name,
				1
			] : [
				resolvedModuleData.id,
				resolvedModuleData.chunks,
				name
			];
		}
		function requireAsyncModule(id) {
			var promise = __webpack_require__(id);
			if ("function" !== typeof promise.then || "fulfilled" === promise.status) return null;
			promise.then(function(value) {
				promise.status = "fulfilled";
				promise.value = value;
			}, function(reason) {
				promise.status = "rejected";
				promise.reason = reason;
			});
			return promise;
		}
		function ignoreReject() {}
		function preloadModule(metadata) {
			for (var chunks = metadata[1], promises = [], i = 0; i < chunks.length;) {
				var chunkId = chunks[i++];
				chunks[i++];
				var entry = chunkCache.get(chunkId);
				if (void 0 === entry) {
					entry = __webpack_chunk_load__(chunkId);
					promises.push(entry);
					var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
					entry.then(resolve, ignoreReject);
					chunkCache.set(chunkId, entry);
				} else null !== entry && promises.push(entry);
			}
			return 4 === metadata.length ? 0 === promises.length ? requireAsyncModule(metadata[0]) : Promise.all(promises).then(function() {
				return requireAsyncModule(metadata[0]);
			}) : 0 < promises.length ? Promise.all(promises) : null;
		}
		function requireModule(metadata) {
			var moduleExports = __webpack_require__(metadata[0]);
			if (4 === metadata.length && "function" === typeof moduleExports.then) if ("fulfilled" === moduleExports.status) moduleExports = moduleExports.value;
			else throw moduleExports.reason;
			return "*" === metadata[2] ? moduleExports : "" === metadata[2] ? moduleExports.__esModule ? moduleExports.default : moduleExports : moduleExports[metadata[2]];
		}
		function Chunk(status, value, reason, response) {
			this.status = status;
			this.value = value;
			this.reason = reason;
			this._response = response;
		}
		function createPendingChunk(response) {
			return new Chunk("pending", null, null, response);
		}
		function wakeChunk(listeners, value) {
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])(value);
		}
		function triggerErrorOnChunk(chunk, error) {
			if ("pending" !== chunk.status && "blocked" !== chunk.status) chunk.reason.error(error);
			else {
				var listeners = chunk.reason;
				chunk.status = "rejected";
				chunk.reason = error;
				null !== listeners && wakeChunk(listeners, error);
			}
		}
		function resolveModelChunk(chunk, value, id) {
			if ("pending" !== chunk.status) chunk = chunk.reason, "C" === value[0] ? chunk.close("C" === value ? "\"$undefined\"" : value.slice(1)) : chunk.enqueueModel(value);
			else {
				var resolveListeners = chunk.value, rejectListeners = chunk.reason;
				chunk.status = "resolved_model";
				chunk.value = value;
				chunk.reason = id;
				if (null !== resolveListeners) switch (initializeModelChunk(chunk), chunk.status) {
					case "fulfilled":
						wakeChunk(resolveListeners, chunk.value);
						break;
					case "pending":
					case "blocked":
					case "cyclic":
						if (chunk.value) for (value = 0; value < resolveListeners.length; value++) chunk.value.push(resolveListeners[value]);
						else chunk.value = resolveListeners;
						if (chunk.reason) {
							if (rejectListeners) for (value = 0; value < rejectListeners.length; value++) chunk.reason.push(rejectListeners[value]);
						} else chunk.reason = rejectListeners;
						break;
					case "rejected": rejectListeners && wakeChunk(rejectListeners, chunk.reason);
				}
			}
		}
		function createResolvedIteratorResultChunk(response, value, done) {
			return new Chunk("resolved_model", (done ? "{\"done\":true,\"value\":" : "{\"done\":false,\"value\":") + value + "}", -1, response);
		}
		function resolveIteratorResultChunk(chunk, value, done) {
			resolveModelChunk(chunk, (done ? "{\"done\":true,\"value\":" : "{\"done\":false,\"value\":") + value + "}", -1);
		}
		function loadServerReference$1(response, id, bound, parentChunk, parentObject, key) {
			var serverReference = resolveServerReference(response._bundlerConfig, id);
			id = preloadModule(serverReference);
			if (bound) bound = Promise.all([bound, id]).then(function(_ref) {
				_ref = _ref[0];
				var fn = requireModule(serverReference);
				return fn.bind.apply(fn, [null].concat(_ref));
			});
			else if (id) bound = Promise.resolve(id).then(function() {
				return requireModule(serverReference);
			});
			else return requireModule(serverReference);
			bound.then(createModelResolver(parentChunk, parentObject, key, !1, response, createModel, []), createModelReject(parentChunk));
			return null;
		}
		function reviveModel(response, parentObj, parentKey, value, reference) {
			if ("string" === typeof value) return parseModelString(response, parentObj, parentKey, value, reference);
			if ("object" === typeof value && null !== value) if (void 0 !== reference && void 0 !== response._temporaryReferences && response._temporaryReferences.set(value, reference), Array.isArray(value)) for (var i = 0; i < value.length; i++) value[i] = reviveModel(response, value, "" + i, value[i], void 0 !== reference ? reference + ":" + i : void 0);
			else for (i in value) hasOwnProperty.call(value, i) && (parentObj = void 0 !== reference && -1 === i.indexOf(":") ? reference + ":" + i : void 0, parentObj = reviveModel(response, value, i, value[i], parentObj), void 0 !== parentObj ? value[i] = parentObj : delete value[i]);
			return value;
		}
		function initializeModelChunk(chunk) {
			var prevChunk = initializingChunk, prevBlocked = initializingChunkBlockedModel;
			initializingChunk = chunk;
			initializingChunkBlockedModel = null;
			var rootReference = -1 === chunk.reason ? void 0 : chunk.reason.toString(16), resolvedModel = chunk.value;
			chunk.status = "cyclic";
			chunk.value = null;
			chunk.reason = null;
			try {
				var rawModel = JSON.parse(resolvedModel), value = reviveModel(chunk._response, { "": rawModel }, "", rawModel, rootReference);
				if (null !== initializingChunkBlockedModel && 0 < initializingChunkBlockedModel.deps) initializingChunkBlockedModel.value = value, chunk.status = "blocked";
				else {
					var resolveListeners = chunk.value;
					chunk.status = "fulfilled";
					chunk.value = value;
					null !== resolveListeners && wakeChunk(resolveListeners, value);
				}
			} catch (error) {
				chunk.status = "rejected", chunk.reason = error;
			} finally {
				initializingChunk = prevChunk, initializingChunkBlockedModel = prevBlocked;
			}
		}
		function reportGlobalError(response, error) {
			response._closed = !0;
			response._closedReason = error;
			response._chunks.forEach(function(chunk) {
				"pending" === chunk.status && triggerErrorOnChunk(chunk, error);
			});
		}
		function getChunk(response, id) {
			var chunks = response._chunks, chunk = chunks.get(id);
			chunk || (chunk = response._formData.get(response._prefix + id), chunk = null != chunk ? new Chunk("resolved_model", chunk, id, response) : response._closed ? new Chunk("rejected", null, response._closedReason, response) : createPendingChunk(response), chunks.set(id, chunk));
			return chunk;
		}
		function createModelResolver(chunk, parentObject, key, cyclic, response, map, path) {
			if (initializingChunkBlockedModel) {
				var blocked = initializingChunkBlockedModel;
				cyclic || blocked.deps++;
			} else blocked = initializingChunkBlockedModel = {
				deps: cyclic ? 0 : 1,
				value: null
			};
			return function(value) {
				for (var i = 1; i < path.length; i++) value = value[path[i]];
				parentObject[key] = map(response, value);
				"" === key && null === blocked.value && (blocked.value = parentObject[key]);
				blocked.deps--;
				0 === blocked.deps && "blocked" === chunk.status && (value = chunk.value, chunk.status = "fulfilled", chunk.value = blocked.value, null !== value && wakeChunk(value, blocked.value));
			};
		}
		function createModelReject(chunk) {
			return function(error) {
				return triggerErrorOnChunk(chunk, error);
			};
		}
		function getOutlinedModel(response, reference, parentObject, key, map) {
			reference = reference.split(":");
			var id = parseInt(reference[0], 16);
			id = getChunk(response, id);
			switch (id.status) {
				case "resolved_model": initializeModelChunk(id);
			}
			switch (id.status) {
				case "fulfilled":
					parentObject = id.value;
					for (key = 1; key < reference.length; key++) parentObject = parentObject[reference[key]];
					return map(response, parentObject);
				case "pending":
				case "blocked":
				case "cyclic":
					var parentChunk = initializingChunk;
					id.then(createModelResolver(parentChunk, parentObject, key, "cyclic" === id.status, response, map, reference), createModelReject(parentChunk));
					return null;
				default: throw id.reason;
			}
		}
		function createMap(response, model) {
			return new Map(model);
		}
		function createSet(response, model) {
			return new Set(model);
		}
		function extractIterator(response, model) {
			return model[Symbol.iterator]();
		}
		function createModel(response, model) {
			return model;
		}
		function parseTypedArray(response, reference, constructor, bytesPerElement, parentObject, parentKey) {
			reference = parseInt(reference.slice(2), 16);
			reference = response._formData.get(response._prefix + reference);
			reference = constructor === ArrayBuffer ? reference.arrayBuffer() : reference.arrayBuffer().then(function(buffer) {
				return new constructor(buffer);
			});
			bytesPerElement = initializingChunk;
			reference.then(createModelResolver(bytesPerElement, parentObject, parentKey, !1, response, createModel, []), createModelReject(bytesPerElement));
			return null;
		}
		function resolveStream(response, id, stream, controller) {
			var chunks = response._chunks;
			stream = new Chunk("fulfilled", stream, controller, response);
			chunks.set(id, stream);
			response = response._formData.getAll(response._prefix + id);
			for (id = 0; id < response.length; id++) chunks = response[id], "C" === chunks[0] ? controller.close("C" === chunks ? "\"$undefined\"" : chunks.slice(1)) : controller.enqueueModel(chunks);
		}
		function parseReadableStream(response, reference, type) {
			reference = parseInt(reference.slice(2), 16);
			var controller = null;
			type = new ReadableStream({
				type,
				start: function(c) {
					controller = c;
				}
			});
			var previousBlockedChunk = null;
			resolveStream(response, reference, type, {
				enqueueModel: function(json) {
					if (null === previousBlockedChunk) {
						var chunk = new Chunk("resolved_model", json, -1, response);
						initializeModelChunk(chunk);
						"fulfilled" === chunk.status ? controller.enqueue(chunk.value) : (chunk.then(function(v) {
							return controller.enqueue(v);
						}, function(e) {
							return controller.error(e);
						}), previousBlockedChunk = chunk);
					} else {
						chunk = previousBlockedChunk;
						var _chunk = createPendingChunk(response);
						_chunk.then(function(v) {
							return controller.enqueue(v);
						}, function(e) {
							return controller.error(e);
						});
						previousBlockedChunk = _chunk;
						chunk.then(function() {
							previousBlockedChunk === _chunk && (previousBlockedChunk = null);
							resolveModelChunk(_chunk, json, -1);
						});
					}
				},
				close: function() {
					if (null === previousBlockedChunk) controller.close();
					else {
						var blockedChunk = previousBlockedChunk;
						previousBlockedChunk = null;
						blockedChunk.then(function() {
							return controller.close();
						});
					}
				},
				error: function(error) {
					if (null === previousBlockedChunk) controller.error(error);
					else {
						var blockedChunk = previousBlockedChunk;
						previousBlockedChunk = null;
						blockedChunk.then(function() {
							return controller.error(error);
						});
					}
				}
			});
			return type;
		}
		function asyncIterator() {
			return this;
		}
		function createIterator(next) {
			next = { next };
			next[ASYNC_ITERATOR] = asyncIterator;
			return next;
		}
		function parseAsyncIterable(response, reference, iterator) {
			reference = parseInt(reference.slice(2), 16);
			var buffer = [], closed = !1, nextWriteIndex = 0, iterable = _defineProperty({}, ASYNC_ITERATOR, function() {
				var nextReadIndex = 0;
				return createIterator(function(arg) {
					if (void 0 !== arg) throw Error("Values cannot be passed to next() of AsyncIterables passed to Client Components.");
					if (nextReadIndex === buffer.length) {
						if (closed) return new Chunk("fulfilled", {
							done: !0,
							value: void 0
						}, null, response);
						buffer[nextReadIndex] = createPendingChunk(response);
					}
					return buffer[nextReadIndex++];
				});
			});
			iterator = iterator ? iterable[ASYNC_ITERATOR]() : iterable;
			resolveStream(response, reference, iterator, {
				enqueueModel: function(value) {
					nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, !1) : resolveIteratorResultChunk(buffer[nextWriteIndex], value, !1);
					nextWriteIndex++;
				},
				close: function(value) {
					closed = !0;
					nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, !0) : resolveIteratorResultChunk(buffer[nextWriteIndex], value, !0);
					for (nextWriteIndex++; nextWriteIndex < buffer.length;) resolveIteratorResultChunk(buffer[nextWriteIndex++], "\"$undefined\"", !0);
				},
				error: function(error) {
					closed = !0;
					for (nextWriteIndex === buffer.length && (buffer[nextWriteIndex] = createPendingChunk(response)); nextWriteIndex < buffer.length;) triggerErrorOnChunk(buffer[nextWriteIndex++], error);
				}
			});
			return iterator;
		}
		function parseModelString(response, obj, key, value, reference) {
			if ("$" === value[0]) {
				switch (value[1]) {
					case "$": return value.slice(1);
					case "@": return obj = parseInt(value.slice(2), 16), getChunk(response, obj);
					case "F": return value = value.slice(2), value = getOutlinedModel(response, value, obj, key, createModel), loadServerReference$1(response, value.id, value.bound, initializingChunk, obj, key);
					case "T":
						if (void 0 === reference || void 0 === response._temporaryReferences) throw Error("Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.");
						return createTemporaryReference(response._temporaryReferences, reference);
					case "Q": return value = value.slice(2), getOutlinedModel(response, value, obj, key, createMap);
					case "W": return value = value.slice(2), getOutlinedModel(response, value, obj, key, createSet);
					case "K":
						obj = value.slice(2);
						var formPrefix = response._prefix + obj + "_", data = new FormData();
						response._formData.forEach(function(entry, entryKey) {
							entryKey.startsWith(formPrefix) && data.append(entryKey.slice(formPrefix.length), entry);
						});
						return data;
					case "i": return value = value.slice(2), getOutlinedModel(response, value, obj, key, extractIterator);
					case "I": return Infinity;
					case "-": return "$-0" === value ? -0 : -Infinity;
					case "N": return NaN;
					case "u": return;
					case "D": return new Date(Date.parse(value.slice(2)));
					case "n": return BigInt(value.slice(2));
				}
				switch (value[1]) {
					case "A": return parseTypedArray(response, value, ArrayBuffer, 1, obj, key);
					case "O": return parseTypedArray(response, value, Int8Array, 1, obj, key);
					case "o": return parseTypedArray(response, value, Uint8Array, 1, obj, key);
					case "U": return parseTypedArray(response, value, Uint8ClampedArray, 1, obj, key);
					case "S": return parseTypedArray(response, value, Int16Array, 2, obj, key);
					case "s": return parseTypedArray(response, value, Uint16Array, 2, obj, key);
					case "L": return parseTypedArray(response, value, Int32Array, 4, obj, key);
					case "l": return parseTypedArray(response, value, Uint32Array, 4, obj, key);
					case "G": return parseTypedArray(response, value, Float32Array, 4, obj, key);
					case "g": return parseTypedArray(response, value, Float64Array, 8, obj, key);
					case "M": return parseTypedArray(response, value, BigInt64Array, 8, obj, key);
					case "m": return parseTypedArray(response, value, BigUint64Array, 8, obj, key);
					case "V": return parseTypedArray(response, value, DataView, 1, obj, key);
					case "B": return obj = parseInt(value.slice(2), 16), response._formData.get(response._prefix + obj);
				}
				switch (value[1]) {
					case "R": return parseReadableStream(response, value, void 0);
					case "r": return parseReadableStream(response, value, "bytes");
					case "X": return parseAsyncIterable(response, value, !1);
					case "x": return parseAsyncIterable(response, value, !0);
				}
				value = value.slice(1);
				return getOutlinedModel(response, value, obj, key, createModel);
			}
			return value;
		}
		function createResponse(bundlerConfig, formFieldPrefix, temporaryReferences) {
			var backingFormData = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : new FormData(), chunks = new Map();
			return {
				_bundlerConfig: bundlerConfig,
				_prefix: formFieldPrefix,
				_formData: backingFormData,
				_chunks: chunks,
				_closed: !1,
				_closedReason: null,
				_temporaryReferences: temporaryReferences
			};
		}
		function close(response) {
			reportGlobalError(response, Error("Connection closed."));
		}
		function loadServerReference(bundlerConfig, id, bound) {
			var serverReference = resolveServerReference(bundlerConfig, id);
			bundlerConfig = preloadModule(serverReference);
			return bound ? Promise.all([bound, bundlerConfig]).then(function(_ref) {
				_ref = _ref[0];
				var fn = requireModule(serverReference);
				return fn.bind.apply(fn, [null].concat(_ref));
			}) : bundlerConfig ? Promise.resolve(bundlerConfig).then(function() {
				return requireModule(serverReference);
			}) : Promise.resolve(requireModule(serverReference));
		}
		function decodeBoundActionMetaData(body, serverManifest, formFieldPrefix) {
			body = createResponse(serverManifest, formFieldPrefix, void 0, body);
			close(body);
			body = getChunk(body, 0);
			body.then(function() {});
			if ("fulfilled" !== body.status) throw body.reason;
			return body.value;
		}
		var ReactDOM = require_react_dom(), React = require_react(), REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
		Symbol.for("react.postpone");
		var MAYBE_ITERATOR_SYMBOL = Symbol.iterator, ASYNC_ITERATOR = Symbol.asyncIterator, LocalPromise = Promise, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : function(callback) {
			LocalPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
		}, currentView = null, writtenBytes = 0, textEncoder = new TextEncoder(), CLIENT_REFERENCE_TAG$1 = Symbol.for("react.client.reference"), SERVER_REFERENCE_TAG = Symbol.for("react.server.reference"), FunctionBind = Function.prototype.bind, ArraySlice = Array.prototype.slice, PROMISE_PROTOTYPE = Promise.prototype, deepProxyHandlers = {
			get: function(target, name) {
				switch (name) {
					case "$$typeof": return target.$$typeof;
					case "$$id": return target.$$id;
					case "$$async": return target.$$async;
					case "name": return target.name;
					case "displayName": return;
					case "defaultProps": return;
					case "toJSON": return;
					case Symbol.toPrimitive: return Object.prototype[Symbol.toPrimitive];
					case Symbol.toStringTag: return Object.prototype[Symbol.toStringTag];
					case "Provider": throw Error("Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.");
					case "then": throw Error("Cannot await or return from a thenable. You cannot await a client module from a server component.");
				}
				throw Error("Cannot access " + (String(target.name) + "." + String(name)) + " on the server. You cannot dot into a client module from a server component. You can only pass the imported name through.");
			},
			set: function() {
				throw Error("Cannot assign to a client module from a server module.");
			}
		}, proxyHandlers$1 = {
			get: function(target, name) {
				return getReference(target, name);
			},
			getOwnPropertyDescriptor: function(target, name) {
				var descriptor = Object.getOwnPropertyDescriptor(target, name);
				descriptor || (descriptor = {
					value: getReference(target, name),
					writable: !1,
					configurable: !1,
					enumerable: !1
				}, Object.defineProperty(target, name, descriptor));
				return descriptor;
			},
			getPrototypeOf: function() {
				return PROMISE_PROTOTYPE;
			},
			set: function() {
				throw Error("Cannot assign to a client module from a server module.");
			}
		}, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, previousDispatcher = ReactDOMSharedInternals.d;
		ReactDOMSharedInternals.d = {
			f: previousDispatcher.f,
			r: previousDispatcher.r,
			D: function(href) {
				if ("string" === typeof href && href) {
					var request = resolveRequest();
					if (request) {
						var hints = request.hints, key = "D|" + href;
						hints.has(key) || (hints.add(key), emitHint(request, "D", href));
					} else previousDispatcher.D(href);
				}
			},
			C: function(href, crossOrigin) {
				if ("string" === typeof href) {
					var request = resolveRequest();
					if (request) {
						var hints = request.hints, key = "C|" + (null == crossOrigin ? "null" : crossOrigin) + "|" + href;
						hints.has(key) || (hints.add(key), "string" === typeof crossOrigin ? emitHint(request, "C", [href, crossOrigin]) : emitHint(request, "C", href));
					} else previousDispatcher.C(href, crossOrigin);
				}
			},
			L: function(href, as, options) {
				if ("string" === typeof href) {
					var request = resolveRequest();
					if (request) {
						var hints = request.hints, key = "L";
						if ("image" === as && options) {
							var imageSrcSet = options.imageSrcSet, imageSizes = options.imageSizes, uniquePart = "";
							"string" === typeof imageSrcSet && "" !== imageSrcSet ? (uniquePart += "[" + imageSrcSet + "]", "string" === typeof imageSizes && (uniquePart += "[" + imageSizes + "]")) : uniquePart += "[][]" + href;
							key += "[image]" + uniquePart;
						} else key += "[" + as + "]" + href;
						hints.has(key) || (hints.add(key), (options = trimOptions(options)) ? emitHint(request, "L", [
							href,
							as,
							options
						]) : emitHint(request, "L", [href, as]));
					} else previousDispatcher.L(href, as, options);
				}
			},
			m: function(href, options) {
				if ("string" === typeof href) {
					var request = resolveRequest();
					if (request) {
						var hints = request.hints, key = "m|" + href;
						if (hints.has(key)) return;
						hints.add(key);
						return (options = trimOptions(options)) ? emitHint(request, "m", [href, options]) : emitHint(request, "m", href);
					}
					previousDispatcher.m(href, options);
				}
			},
			X: function(src, options) {
				if ("string" === typeof src) {
					var request = resolveRequest();
					if (request) {
						var hints = request.hints, key = "X|" + src;
						if (hints.has(key)) return;
						hints.add(key);
						return (options = trimOptions(options)) ? emitHint(request, "X", [src, options]) : emitHint(request, "X", src);
					}
					previousDispatcher.X(src, options);
				}
			},
			S: function(href, precedence, options) {
				if ("string" === typeof href) {
					var request = resolveRequest();
					if (request) {
						var hints = request.hints, key = "S|" + href;
						if (hints.has(key)) return;
						hints.add(key);
						return (options = trimOptions(options)) ? emitHint(request, "S", [
							href,
							"string" === typeof precedence ? precedence : 0,
							options
						]) : "string" === typeof precedence ? emitHint(request, "S", [href, precedence]) : emitHint(request, "S", href);
					}
					previousDispatcher.S(href, precedence, options);
				}
			},
			M: function(src, options) {
				if ("string" === typeof src) {
					var request = resolveRequest();
					if (request) {
						var hints = request.hints, key = "M|" + src;
						if (hints.has(key)) return;
						hints.add(key);
						return (options = trimOptions(options)) ? emitHint(request, "M", [src, options]) : emitHint(request, "M", src);
					}
					previousDispatcher.M(src, options);
				}
			}
		};
		var frameRegExp = /^ {3} at (?:(.+) \((?:(.+):(\d+):(\d+)|<anonymous>)\)|(?:async )?(.+):(\d+):(\d+)|<anonymous>)$/, supportsRequestStorage = "function" === typeof AsyncLocalStorage, requestStorage = supportsRequestStorage ? new AsyncLocalStorage() : null, supportsComponentStorage = supportsRequestStorage, componentStorage = supportsComponentStorage ? new AsyncLocalStorage() : null;
		"object" === typeof async_hooks && async_hooks.createHook;
		"object" === typeof async_hooks && async_hooks.executionAsyncId;
		var TEMPORARY_REFERENCE_TAG = Symbol.for("react.temporary.reference"), proxyHandlers = {
			get: function(target, name) {
				switch (name) {
					case "$$typeof": return target.$$typeof;
					case "name": return;
					case "displayName": return;
					case "defaultProps": return;
					case "toJSON": return;
					case Symbol.toPrimitive: return Object.prototype[Symbol.toPrimitive];
					case Symbol.toStringTag: return Object.prototype[Symbol.toStringTag];
					case "Provider": throw Error("Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.");
				}
				throw Error("Cannot access " + String(name) + " on the server. You cannot dot into a temporary client reference from a server component. You can only pass the value through to the client.");
			},
			set: function() {
				throw Error("Cannot assign to a temporary client reference from a server module.");
			}
		}, SuspenseException = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`."), suspendedThenable = null, currentRequest$1 = null, thenableIndexCounter = 0, thenableState = null, currentComponentDebugInfo = null, HooksDispatcher = {
			readContext: unsupportedContext,
			use: function(usable) {
				if (null !== usable && "object" === typeof usable || "function" === typeof usable) {
					if ("function" === typeof usable.then) {
						var index = thenableIndexCounter;
						thenableIndexCounter += 1;
						null === thenableState && (thenableState = []);
						return trackUsedThenable(thenableState, usable, index);
					}
					usable.$$typeof === REACT_CONTEXT_TYPE && unsupportedContext();
				}
				if (isClientReference(usable)) {
					if (null != usable.value && usable.value.$$typeof === REACT_CONTEXT_TYPE) throw Error("Cannot read a Client Context from a Server Component.");
					throw Error("Cannot use() an already resolved Client Reference.");
				}
				throw Error("An unsupported type was passed to use(): " + String(usable));
			},
			useCallback: function(callback) {
				return callback;
			},
			useContext: unsupportedContext,
			useEffect: unsupportedHook,
			useImperativeHandle: unsupportedHook,
			useLayoutEffect: unsupportedHook,
			useInsertionEffect: unsupportedHook,
			useMemo: function(nextCreate) {
				return nextCreate();
			},
			useReducer: unsupportedHook,
			useRef: unsupportedHook,
			useState: unsupportedHook,
			useDebugValue: function() {},
			useDeferredValue: unsupportedHook,
			useTransition: unsupportedHook,
			useSyncExternalStore: unsupportedHook,
			useId: function() {
				if (null === currentRequest$1) throw Error("useId can only be used while React is rendering");
				var id = currentRequest$1.identifierCount++;
				return ":" + currentRequest$1.identifierPrefix + "S" + id.toString(32) + ":";
			},
			useHostTransitionStatus: unsupportedHook,
			useFormState: unsupportedHook,
			useActionState: unsupportedHook,
			useOptimistic: unsupportedHook,
			useMemoCache: function(size) {
				for (var data = Array(size), i = 0; i < size; i++) data[i] = REACT_MEMO_CACHE_SENTINEL;
				return data;
			},
			useCacheRefresh: function() {
				return unsupportedRefresh;
			}
		}, currentOwner = null, DefaultAsyncDispatcher = { getCacheForType: function(resourceType) {
			var cache = (cache = resolveRequest()) ? cache.cache : new Map();
			var entry = cache.get(resourceType);
			void 0 === entry && (entry = resourceType(), cache.set(resourceType, entry));
			return entry;
		} };
		DefaultAsyncDispatcher.getOwner = resolveOwner;
		var ReactSharedInternalsServer = React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
		if (!ReactSharedInternalsServer) throw Error("The \"react\" package in this environment is not configured correctly. The \"react-server\" condition must be enabled in any environment that runs React Server Components.");
		var prefix, suffix;
		new ("function" === typeof WeakMap ? WeakMap : Map)();
		var lastResetTime = 0;
		if ("object" === typeof performance && "function" === typeof performance.now) {
			var localPerformance = performance;
			var getCurrentTime = function() {
				return localPerformance.now();
			};
		} else {
			var localDate = Date;
			getCurrentTime = function() {
				return localDate.now();
			};
		}
		var callComponent = { "react-stack-bottom-frame": function(Component, props, componentDebugInfo) {
			currentOwner = componentDebugInfo;
			try {
				return Component(props, void 0);
			} finally {
				currentOwner = null;
			}
		} }, callComponentInDEV = callComponent["react-stack-bottom-frame"].bind(callComponent), callLazyInit = { "react-stack-bottom-frame": function(lazy) {
			var init = lazy._init;
			return init(lazy._payload);
		} }, callLazyInitInDEV = callLazyInit["react-stack-bottom-frame"].bind(callLazyInit), callIterator = { "react-stack-bottom-frame": function(iterator, progress, error) {
			iterator.next().then(progress, error);
		} }, callIteratorInDEV = callIterator["react-stack-bottom-frame"].bind(callIterator), isArrayImpl = Array.isArray, getPrototypeOf = Object.getPrototypeOf, jsxPropsParents = new WeakMap(), jsxChildrenParents = new WeakMap(), CLIENT_REFERENCE_TAG = Symbol.for("react.client.reference"), doNotLimit = new WeakSet();
		"object" === typeof console && null !== console && (patchConsole(console, "assert"), patchConsole(console, "debug"), patchConsole(console, "dir"), patchConsole(console, "dirxml"), patchConsole(console, "error"), patchConsole(console, "group"), patchConsole(console, "groupCollapsed"), patchConsole(console, "groupEnd"), patchConsole(console, "info"), patchConsole(console, "log"), patchConsole(console, "table"), patchConsole(console, "trace"), patchConsole(console, "warn"));
		var ObjectPrototype = Object.prototype, stringify = JSON.stringify, PENDING$1 = 0, COMPLETED = 1, ABORTED = 3, ERRORED$1 = 4, RENDERING = 5, OPENING = 10, ABORTING = 12, CLOSING = 13, CLOSED = 14, PRERENDER = 21, currentRequest = null, debugID = null, modelRoot = !1, emptyRoot = {}, chunkCache = new Map(), hasOwnProperty = Object.prototype.hasOwnProperty;
		Chunk.prototype = Object.create(Promise.prototype);
		Chunk.prototype.then = function(resolve, reject) {
			switch (this.status) {
				case "resolved_model": initializeModelChunk(this);
			}
			switch (this.status) {
				case "fulfilled":
					resolve(this.value);
					break;
				case "pending":
				case "blocked":
				case "cyclic":
					resolve && (null === this.value && (this.value = []), this.value.push(resolve));
					reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
					break;
				default: reject(this.reason);
			}
		};
		var initializingChunk = null, initializingChunkBlockedModel = null;
		exports.createClientModuleProxy = function(moduleId) {
			moduleId = registerClientReferenceImpl({}, moduleId, !1);
			return new Proxy(moduleId, proxyHandlers$1);
		};
		exports.createTemporaryReferenceSet = function() {
			return new WeakMap();
		};
		exports.decodeAction = function(body, serverManifest) {
			var formData = new FormData(), action = null;
			body.forEach(function(value, key) {
				key.startsWith("$ACTION_") ? key.startsWith("$ACTION_REF_") ? (value = "$ACTION_" + key.slice(12) + ":", value = decodeBoundActionMetaData(body, serverManifest, value), action = loadServerReference(serverManifest, value.id, value.bound)) : key.startsWith("$ACTION_ID_") && (value = key.slice(11), action = loadServerReference(serverManifest, value, null)) : formData.append(key, value);
			});
			return null === action ? null : action.then(function(fn) {
				return fn.bind(null, formData);
			});
		};
		exports.decodeFormState = function(actionResult, body, serverManifest) {
			var keyPath = body.get("$ACTION_KEY");
			if ("string" !== typeof keyPath) return Promise.resolve(null);
			var metaData = null;
			body.forEach(function(value, key) {
				key.startsWith("$ACTION_REF_") && (value = "$ACTION_" + key.slice(12) + ":", metaData = decodeBoundActionMetaData(body, serverManifest, value));
			});
			if (null === metaData) return Promise.resolve(null);
			var referenceId = metaData.id;
			return Promise.resolve(metaData.bound).then(function(bound) {
				return null === bound ? null : [
					actionResult,
					keyPath,
					referenceId,
					bound.length - 1
				];
			});
		};
		exports.decodeReply = function(body, webpackMap, options) {
			if ("string" === typeof body) {
				var form = new FormData();
				form.append("0", body);
				body = form;
			}
			body = createResponse(webpackMap, "", options ? options.temporaryReferences : void 0, body);
			webpackMap = getChunk(body, 0);
			close(body);
			return webpackMap;
		};
		exports.decodeReplyFromAsyncIterable = function(iterable, webpackMap, options) {
			function progress(entry) {
				if (entry.done) close(response$jscomp$0);
				else {
					entry = entry.value;
					var name = entry[0];
					entry = entry[1];
					if ("string" === typeof entry) {
						var response = response$jscomp$0;
						response._formData.append(name, entry);
						var prefix$1 = response._prefix;
						name.startsWith(prefix$1) && (response = response._chunks, name = +name.slice(prefix$1.length), (prefix$1 = response.get(name)) && resolveModelChunk(prefix$1, entry, name));
					} else response$jscomp$0._formData.append(name, entry);
					iterator.next().then(progress, error);
				}
			}
			function error(reason) {
				reportGlobalError(response$jscomp$0, reason);
				"function" === typeof iterator.throw && iterator.throw(reason).then(error, error);
			}
			var iterator = iterable[ASYNC_ITERATOR](), response$jscomp$0 = createResponse(webpackMap, "", options ? options.temporaryReferences : void 0);
			iterator.next().then(progress, error);
			return getChunk(response$jscomp$0, 0);
		};
		exports.registerClientReference = function(proxyImplementation, id, exportName) {
			return registerClientReferenceImpl(proxyImplementation, id + "#" + exportName, !1);
		};
		exports.registerServerReference = function(reference, id, exportName) {
			return Object.defineProperties(reference, {
				$$typeof: { value: SERVER_REFERENCE_TAG },
				$$id: {
					value: null === exportName ? id : id + "#" + exportName,
					configurable: !0
				},
				$$bound: {
					value: null,
					configurable: !0
				},
				$$location: {
					value: Error("react-stack-top-frame"),
					configurable: !0
				},
				bind: {
					value: bind,
					configurable: !0
				}
			});
		};
		exports.renderToReadableStream = function(model, webpackMap, options) {
			var request = createRequest(model, webpackMap, options ? options.onError : void 0, options ? options.identifierPrefix : void 0, options ? options.onPostpone : void 0, options ? options.temporaryReferences : void 0, options ? options.environmentName : void 0, options ? options.filterStackFrame : void 0);
			if (options && options.signal) {
				var signal = options.signal;
				if (signal.aborted) abort(request, signal.reason);
				else {
					var listener = function() {
						abort(request, signal.reason);
						signal.removeEventListener("abort", listener);
					};
					signal.addEventListener("abort", listener);
				}
			}
			return new ReadableStream({
				type: "bytes",
				start: function() {
					startWork(request);
				},
				pull: function(controller) {
					startFlowing(request, controller);
				},
				cancel: function(reason) {
					request.destination = null;
					abort(request, reason);
				}
			}, { highWaterMark: 0 });
		};
		exports.unstable_prerender = function(model, webpackMap, options) {
			return new Promise(function(resolve, reject) {
				var request = createPrerenderRequest(model, webpackMap, function() {
					var stream = new ReadableStream({
						type: "bytes",
						start: function() {
							startWork(request);
						},
						pull: function(controller) {
							startFlowing(request, controller);
						},
						cancel: function(reason) {
							request.destination = null;
							abort(request, reason);
						}
					}, { highWaterMark: 0 });
					resolve({ prelude: stream });
				}, reject, options ? options.onError : void 0, options ? options.identifierPrefix : void 0, options ? options.onPostpone : void 0, options ? options.temporaryReferences : void 0, options ? options.environmentName : void 0, options ? options.filterStackFrame : void 0);
				if (options && options.signal) {
					var signal = options.signal;
					if (signal.aborted) abort(request, signal.reason);
					else {
						var listener = function() {
							abort(request, signal.reason);
							signal.removeEventListener("abort", listener);
						};
						signal.addEventListener("abort", listener);
					}
				}
				startWork(request);
			});
		};
	})();
} });

//#endregion
//#region ../../../node_modules/.pnpm/react-server-dom-webpack@19.1.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_webpack@5.98.0/node_modules/react-server-dom-webpack/server.edge.js
var require_server_edge = __commonJS({ "../../../node_modules/.pnpm/react-server-dom-webpack@19.1.0_react-dom@19.1.0_react@19.1.0__react@19.1.0_webpack@5.98.0/node_modules/react-server-dom-webpack/server.edge.js"(exports) {
	var s;
	s = require_react_server_dom_webpack_server_edge_development();
	exports.renderToReadableStream = s.renderToReadableStream;
	exports.decodeReply = s.decodeReply;
	exports.decodeReplyFromAsyncIterable = s.decodeReplyFromAsyncIterable;
	exports.decodeAction = s.decodeAction;
	exports.decodeFormState = s.decodeFormState;
	exports.registerServerReference = s.registerServerReference;
	exports.registerClientReference = s.registerClientReference;
	exports.createClientModuleProxy = s.createClientModuleProxy;
	exports.createTemporaryReferenceSet = s.createTemporaryReferenceSet;
} });
var import_server_edge = __toESM(require_server_edge(), 1);

//#endregion
var registerClientReference = import_server_edge.registerClientReference;
var renderToPipeableStream = import_server_edge.renderToPipeableStream;
export { registerClientReference, renderToPipeableStream };