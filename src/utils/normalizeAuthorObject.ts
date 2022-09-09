import { FileSystem } from '../models/FileSystem'
import { _getConfig } from '../commands/getConfig'
import { Author } from '../models/_common'

/**
 *
 * @returns {Promise<void | {name: string, email: string, date: Date, timestamp: number, timezoneOffset: number }>}
 */
export async function normalizeAuthorObject(
  { fs, gitdir, author = {} as any }:
  { fs: FileSystem, gitdir: string, author?: Author }): Promise<Author | undefined> {
  let { name, email, timestamp, timezoneOffset } = author
  name = name || (await _getConfig({ fs, gitdir, path: 'user.name' }) as string)
  email = email || (await _getConfig({ fs, gitdir, path: 'user.email' }) as string) || ''

  if (name === undefined) {
    return undefined
  }

  timestamp = timestamp != null ? timestamp : Math.floor(Date.now() / 1000)
  timezoneOffset =
    timezoneOffset != null
      ? timezoneOffset
      : new Date(timestamp * 1000).getTimezoneOffset()

  return { name, email, timestamp, timezoneOffset }
}
