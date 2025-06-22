/**
 * @madfam/logger
 * 
 * Pretty formatting for console output
 */

import chalk from 'chalk';
import type { LogEntry, LogLevel } from '../types';
import { getTimestamp } from './time';

const LEVEL_COLORS: Record<LogLevel, typeof chalk> = {
  trace: chalk.gray,
  debug: chalk.cyan,
  info: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  fatal: chalk.bgRed.white,
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  trace: 'TRACE',
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
  fatal: 'FATAL',
};

export interface FormatPrettyOptions {
  colors?: boolean;
  timestamp?: boolean | string;
}

export function formatPretty(
  entry: LogEntry,
  options: FormatPrettyOptions = {}
): string {
  const { colors = true, timestamp = true } = options;
  const parts: string[] = [];

  // Timestamp
  if (timestamp !== false) {
    const ts = getTimestamp(timestamp);
    parts.push(colors ? chalk.gray(`[${ts}]`) : `[${ts}]`);
  }

  // Level
  const levelLabel = LEVEL_LABELS[entry.level];
  if (colors) {
    parts.push(LEVEL_COLORS[entry.level](levelLabel));
  } else {
    parts.push(levelLabel);
  }

  // Service
  parts.push(colors ? chalk.blue(`(${entry.service})`) : `(${entry.service})`);

  // Message
  parts.push(colors ? chalk.white(entry.message) : entry.message);

  let output = parts.join(' ');

  // Add context and data
  const combinedData = {
    ...entry.context,
    ...entry.data,
  };

  if (Object.keys(combinedData).length > 0) {
    output += '\n' + formatData(combinedData, colors, '  ');
  }

  // Add error stack if present
  if (entry.error) {
    output += '\n' + formatError(entry.error, colors, '  ');
  }

  return output;
}

function formatData(data: any, colors: boolean, indent: string): string {
  if (data === null || data === undefined) {
    return '';
  }

  const lines: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    const formattedKey = colors ? chalk.gray(key + ':') : key + ':';
    const formattedValue = formatValue(value, colors, indent + '  ');
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      lines.push(`${indent}${formattedKey}`);
      lines.push(formattedValue);
    } else {
      lines.push(`${indent}${formattedKey} ${formattedValue}`);
    }
  }

  return lines.join('\n');
}

function formatValue(value: any, colors: boolean, indent: string): string {
  if (value === null) {
    return colors ? chalk.gray('null') : 'null';
  }

  if (value === undefined) {
    return colors ? chalk.gray('undefined') : 'undefined';
  }

  if (typeof value === 'string') {
    return colors ? chalk.green(`"${value}"`) : `"${value}"`;
  }

  if (typeof value === 'number') {
    return colors ? chalk.yellow(value.toString()) : value.toString();
  }

  if (typeof value === 'boolean') {
    return colors ? chalk.blue(value.toString()) : value.toString();
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    const items = value.map(item => 
      indent + '- ' + formatValue(item, colors, indent + '  ')
    );
    return '\n' + items.join('\n');
  }

  if (typeof value === 'object') {
    return formatData(value, colors, indent);
  }

  return String(value);
}

function formatError(error: Error, colors: boolean, indent: string): string {
  const lines: string[] = [];
  
  // Error message
  const errorLabel = colors ? chalk.red('Error:') : 'Error:';
  lines.push(`${indent}${errorLabel} ${error.message}`);
  
  // Stack trace
  if (error.stack) {
    const stackLines = error.stack.split('\n').slice(1); // Skip first line (already shown)
    const stackLabel = colors ? chalk.gray('Stack:') : 'Stack:';
    lines.push(`${indent}${stackLabel}`);
    
    stackLines.forEach(line => {
      lines.push(colors ? chalk.gray(`${indent}  ${line.trim()}`) : `${indent}  ${line.trim()}`);
    });
  }
  
  return lines.join('\n');
}