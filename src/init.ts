import { LeveledLogMethod, Logger, LogCallback } from 'winston'

import { getCallee } from './getCallee'

type LogLevel =
  | 'error'
  | 'warn'
  | 'help'
  | 'data'
  | 'info'
  | 'debug'
  | 'prompt'
  | 'http'
  | 'verbose'
  | 'input'
  | 'silly'

function createPatchedLogger(
  logger: Logger,
  level: LogLevel
): LeveledLogMethod {
  function logMethod(message: string, callback: LogCallback): Logger
  function logMethod(message: string, meta: any, callback: LogCallback): Logger
  function logMethod(message: string, ...meta: any[]): Logger
  function logMethod(message: any): Logger
  function logMethod(infoObject: Record<string, unknown>): Logger

  function logMethod(...args: any[]): Logger {
    let message = ''
    let meta: Record<string, unknown> = {}

    if (typeof args[0] === 'string') {
      message = args[0]
      if (typeof args[1] === 'object') {
        meta = args[1]
      }
    } else if (typeof args[0] === 'object') {
      meta = args[0]
    }

    meta._callee = getCallee()
    return logger[level](message, meta)
  }

  return logMethod
}

export function init(logger: Logger): Logger {
  const patchedLogger: Logger = { ...logger } as Logger
  patchedLogger.error = createPatchedLogger(logger, 'error')
  patchedLogger.warn = createPatchedLogger(logger, 'warn')
  patchedLogger.help = createPatchedLogger(logger, 'help')
  patchedLogger.data = createPatchedLogger(logger, 'data')
  patchedLogger.info = createPatchedLogger(logger, 'info')
  patchedLogger.debug = createPatchedLogger(logger, 'debug')
  patchedLogger.prompt = createPatchedLogger(logger, 'prompt')
  patchedLogger.http = createPatchedLogger(logger, 'http')
  patchedLogger.verbose = createPatchedLogger(logger, 'verbose')
  patchedLogger.input = createPatchedLogger(logger, 'input')
  patchedLogger.silly = createPatchedLogger(logger, 'silly')
  return patchedLogger
}
