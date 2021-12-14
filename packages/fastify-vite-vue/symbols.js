const kRoutes = Symbol.for('kRoutes')
const kData = Symbol.for('kData')
const kPayload = Symbol.for('kPayload')
const kStaticPayload = Symbol.for('kStaticPayload')
const kGlobal = Symbol.for('kGlobal')
const kAPI = Symbol.for('kAPI')

const kIsomorphic = Symbol('kIsomorphic')
const kFirstRender = Symbol('kFirstRender')

const kFuncValue = Symbol('kFuncValue')
const kFuncExecuted = Symbol('kFuncExecuted')

module.exports = {
  kRoutes,
  kData,
  kPayload,
  kStaticPayload,
  kGlobal,
  kAPI,
  kIsomorphic,
  kFirstRender,
  kFuncValue,
  kFuncExecuted,
}
