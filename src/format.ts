/* eslint-disable no-control-regex */
import { inspect, InspectOptions } from 'util'
import path from 'path'

import colors from 'colors/safe'
import { Format, TransformableInfo } from 'logform'
import { MESSAGE, SPLAT } from 'triple-beam'
import * as winston from 'winston'

import { Callee } from './types'

export interface DevConsoleFormatOptions {
  inspectOptions?: InspectOptions,
  basePath?: string,
}

export class DevConsoleFormat {
  private static readonly reSpaces = /^\s+/
  private static readonly reSpacesOrEmpty = /^(\s*)/
  private static readonly reColor = /\x1B\[\d+m/

  private static readonly chars = {
    singleLine: '▪',
    startLine: '┏',
    line: '┃',
    endLine: '┗',
  }

  public constructor(private opts: DevConsoleFormatOptions = {}) {
    if (typeof this.opts.inspectOptions === 'undefined') {
      this.opts.inspectOptions = {
        depth: Infinity,
        colors: true,
        maxArrayLength: Infinity,
        breakLength: 120,
        compact: Infinity,
      }
    }
  }

  private inspector(value: any, metaLines: string[]): void {
    const inspector = inspect(value, this.opts.inspectOptions || {})

    inspector.split('\n').forEach((line) => {
      metaLines.push(line)
    })
  }

  private getMessage(
    info: TransformableInfo,
    chr: string,
    color: string
  ): string {
    let message = info.message

    const hasMessage = message.replace(DevConsoleFormat.reSpacesOrEmpty, '')
      .length
    if (!hasMessage)
      message += `${color}${colors.dim(
        colors.italic('(no message)')
      )}${colors.reset(' ')}`

    message = message.replace(
      DevConsoleFormat.reSpacesOrEmpty,
      `$1${color}${colors.dim(chr)}${colors.reset(' ')}`
    )

    return `${info.level}:${message}`
  }

  private getPadding(message?: string): string {
    let padding = ''
    const matches = message && message.match(DevConsoleFormat.reSpaces)
    if (matches && matches.length > 0) {
      padding = matches[0]
    }

    return padding
  }

  private getMs(info: TransformableInfo): string {
    let ms = ''
    if (info.ms) {
      ms = colors.italic(colors.dim(` ${info.ms}`))
    }

    return ms
  }

  private getStackLines(info: TransformableInfo): string[] {
    const stackLines: string[] = []

    if (info.stack) {
      const error = new Error()
      error.stack = info.stack
      this.inspector(error, stackLines)
    }

    return stackLines
  }

  private getMetaLines(info: TransformableInfo): string[] {
    const metaLines: string[] = []
    const splat = { ...info[(SPLAT as unknown) as string][0] }

    delete splat._callee

    if (Object.keys(splat).length > 0) {
      this.inspector(splat, metaLines)
    }
    return metaLines
  }

  private getCallee(info: TransformableInfo): Callee {
    const callee = info?._callee as Callee ?? {}

    if (callee.filePath) {
      if (!this.opts.basePath) {
        // By default remove anything before and including `src/`
        callee.filePath = callee.filePath.replace(/^.*\/src\//, '')
      } else {
        callee.filePath = callee.filePath.replace(`${path.resolve(this.opts.basePath)}/`, '')
      }
      
    }

    return callee
  }

  private getColor(info: TransformableInfo): string {
    let color = ''
    const colorMatch = info.level.match(DevConsoleFormat.reColor)

    if (colorMatch) {
      color = colorMatch[0]
    }

    return color
  }

  private write(
    info: TransformableInfo,
    metaLines: string[],
    color: string,
    callee: Callee
  ): void {
    const pad = this.getPadding(info.message)
    const infoIndex = (MESSAGE as unknown) as string

    if (callee.filePath) {
      const filePath = ` at ${callee?.filePath}:${callee?.lineNumber}`
      const functionName = callee.functionName
        ? ` [${callee.functionName}]`
        : ''

      info[infoIndex] += `\n${colors.dim(
        info.level
      )}:${pad}${color}${colors.dim(
        metaLines.length
          ? DevConsoleFormat.chars.line
          : DevConsoleFormat.chars.endLine
      )}${colors.dim(
        colors.italic(`${filePath}${functionName}`)
      )}${colors.reset(' ')}`
    }

    metaLines.forEach((line, lineNumberIndex, arr) => {
      const lineNumber = colors.dim(
        `[${(lineNumberIndex + 1)
          .toString()
          .padStart(arr.length.toString().length, ' ')}]`
      )
      let chr = DevConsoleFormat.chars.line

      if (lineNumberIndex === arr.length - 1) {
        chr = DevConsoleFormat.chars.endLine
      }

      info[infoIndex] += `\n${colors.dim(
        info.level
      )}:${pad}${color}${colors.dim(chr)}${colors.reset(' ')}`
      info[infoIndex] += `${lineNumber} ${line}`
    })
    info[infoIndex] += '\n'
  }

  public transform(info: TransformableInfo): TransformableInfo {
    const index = (MESSAGE as unknown) as string

    const callee = this.getCallee(info)

    const metaLines: string[] = [
      ...this.getStackLines(info),
      ...this.getMetaLines(info),
    ]

    const color = this.getColor(info)

    info[index] = this.getMessage(
      info,
      DevConsoleFormat.chars[
        metaLines.length > 0 || callee?.filePath
          ? 'startLine'
          : 'singleLine'
      ],
      color
    )
    info[index] += this.getMs(info)

    this.write(info, metaLines, color, callee)
    return info
  }
}

export const format = (opts?: DevConsoleFormatOptions): Format => {
  return winston.format.combine(
    winston.format.splat(),
    winston.format.colorize({ all: true }),
    winston.format.padLevels(),
    new DevConsoleFormat(opts)
  )
}
