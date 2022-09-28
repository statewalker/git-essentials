import { GitRefManager } from '../managers/GitRefManager'
import { FsClient } from '../models'
import { FileSystem } from '../models/FileSystem'
import { assertParameter } from '../utils/assertParameter'
import { join } from '../utils/join'


type ListBranchesParams = {
  /** A file system client. */
  fs: FsClient

  /** The working tree directory path. */
  dir: string

  /** The git directory path (default: `join(dir, '.git')`). */
  gitdir?: string

  /** Instead of the branches in `refs/heads`, list the branches in `refs/remotes/${remote}`. */
  remote?: string
}

/**
 * List branches.
 *
 * By default it lists local branches. If a 'remote' is specified, it lists the remote's branches. When listing remote branches, the HEAD branch is not filtered out, so it may be included in the list of results.
 *
 * Note that specifying a remote does not actually contact the server and update the list of branches.
 * If you want an up-to-date list, first do a `fetch` to that remote.
 * (Which branch you fetch doesn't matter - the list of branches available on the remote is updated during the fetch handshake.)
 *
 * @param {ListBranchesParams} args
 *
 * @returns {Promise<Array<string>>} Resolves successfully with an array of branch names
 *
 * @example
 * let branches = await git.listBranches({ fs, dir: '/tutorial' })
 * console.log(branches)
 * let remoteBranches = await git.listBranches({ fs, dir: '/tutorial', remote: 'origin' })
 * console.log(remoteBranches)
 *
 */
export async function listBranches({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  remote,
}: ListBranchesParams): Promise<string[]> {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)

    return GitRefManager.listBranches({
      fs: new FileSystem(fs),
      gitdir,
      remote,
    })
  } catch (err: any) {
    err.caller = 'git.listBranches'
    throw err
  }
}