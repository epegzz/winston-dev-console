import { Callee } from './types'

// We use this object to store the position of the last log statement.
// This is really hacky and relies on my guess that log function calls
// are always handled sequentially 🙈🤞 #notProud
const calleeStore: { value?: Callee } = {}

export default calleeStore
