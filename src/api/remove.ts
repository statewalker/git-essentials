import { Cache } from '../models/Cache'
import { GitIndexManager } from '../managers/GitIndexManager'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'
import { IBackend } from '../models/IBackend'

type RemoveParams = {
  fs: IBackend
  dir: string
  gitdir?: string
  filepath: string
  cache?: Cache
}

/**
 * Remove a file from the git index (aka staging area)
 *
 * Note that this does NOT delete the file in the working directory.
 *
 * @param {object} args
 * @param {FsClient} args.fs - a file system client
 * @param {string} [args.dir] - The [working tree](dir-vs-gitdir.md) directory path
 * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
 * @param {string} args.filepath - The path to the file to remove from the index
 * @param {object} [args.cache] - a [cache](cache.md) object
 *
 * @returns {Promise<void>} Resolves successfully once the git index has been updated
 *
 * @example
 * await git.remove({ fs, dir: '/tutorial', filepath: 'README.md' })
 * console.log('done')
 *
 */
export async function remove({
  fs: _fs,
  dir,
  gitdir = join(dir, '.git'),
  filepath,
  cache = {},
}: RemoveParams): Promise<void> {
  try {
    assertParameter('fs', _fs)
    assertParameter('gitdir', gitdir)
    assertParameter('filepath', filepath)

    await GitIndexManager.acquire(
      { fs: new FileSystem(_fs), gitdir, cache },
      async function(index) {
        index.delete({ filepath })
      }
    )
  } catch (err: any) {
    err.caller = 'git.remove'
    throw err
  }
}
