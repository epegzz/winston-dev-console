import { Callee } from './types'

export function getCallee(): Callee {
  try {
    throw new Error()
  } catch (e) {
    const line = e.stack.split('\n')[3] || ''
    const functionNameMatch = line.match(/\w+@|at (([^(]+)) \(.*/)
    const functionName = (functionNameMatch && functionNameMatch[1]) || ''

    const result = line.match(/(\/[^:]+):([0-9]+):[0-9]+/)
    const filePath = result[1] || ''
    const lineNumber = result[2] || ''

    return {
      functionName,
      lineNumber,
      filePath,
    }
  }
}
