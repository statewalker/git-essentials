import { Errors, merge, resolveRef, log } from '../src'
import { makeFsFixture, FsFixtureData } from './helpers/makeFsFixture'
import { expectToFailWithTypeAsync } from './helpers/assertionHelper'

import mergeFsFixtureData from './fixtures/fs/merge.json'


const author = {
  name: 'Mr. Test',
  email: 'mrtest@example.com',
  timestamp: 1262356920,
  timezoneOffset: -0
}

describe('merge', () => {
  it('merge main into main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const desiredOid = await resolveRef({ fs, dir, ref: 'main' })

    // act
    const m = await merge({ fs, dir, ours: 'main', theirs: 'main', fastForwardOnly: true })

    // assert
    expect(m.oid).toBe(desiredOid)
    expect(m.alreadyMerged).toBe(true)
    expect(m.fastForward).toBeFalsy()
    const oid = await resolveRef({ fs, dir, ref: 'main' })
    expect(oid).toBe(desiredOid)
  })

  it('merge medium into main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const desiredOid = await resolveRef({ fs, dir, ref: 'medium' })

    // act
    const m = await merge({ fs, dir, ours: 'main', theirs: 'medium', fastForwardOnly: true })

    // assert
    expect(m.oid).toBe(desiredOid)
    expect(m.alreadyMerged).toBe(true)
    expect(m.fastForward).toBeFalsy()
    const oid = await resolveRef({ fs, dir, ref: 'main' })
    expect(oid).toBe(desiredOid)
  })

  it('merge oldest into main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const desiredOid = await resolveRef({ fs, dir, ref: 'main' })

    // act
    const m = await merge({ fs, dir, ours: 'main', theirs: 'oldest', fastForwardOnly: true })

    // assert
    expect(m.oid).toBe(desiredOid)
    expect(m.alreadyMerged).toBe(true)
    expect(m.fastForward).toBeFalsy()
    const oid = await resolveRef({ fs, dir, ref: 'main' })
    expect(oid).toBe(desiredOid)
  })

  it('merge newest into main', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const desiredOid = await resolveRef({ fs, dir, ref: 'newest' })

    // act
    const m = await merge({ fs, dir, ours: 'main', theirs: 'newest', fastForwardOnly: true })

    // assert
    expect(m.oid).toBe(desiredOid)
    expect(m.alreadyMerged).toBeFalsy()
    expect(m.fastForward).toBe(true)
    const oid = await resolveRef({ fs, dir, ref: 'main' })
    expect(oid).toBe(desiredOid)
  })

  it('merge newest into main --dryRun (no author needed since fastForward)', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const originalOid = await resolveRef({ fs, dir, ref: 'main' })
    const desiredOid = await resolveRef({ fs, dir, ref: 'newest' })

    // act
    const m = await merge({ fs, dir, ours: 'main', theirs: 'newest', fastForwardOnly: true, dryRun: true })

    // assert
    expect(m.oid).toBe(desiredOid)
    expect(m.alreadyMerged).toBeFalsy()
    expect(m.fastForward).toBe(true)
    const oid = await resolveRef({ fs, dir, ref: 'main' })
    expect(oid).toBe(originalOid)
  })

  it('merge newest into main --noUpdateBranch', async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const originalOid = await resolveRef({ fs, dir, ref: 'main' })
    const desiredOid = await resolveRef({ fs, dir, ref: 'newest' })

    // act
    const m = await merge({ fs, dir, ours: 'main', theirs: 'newest', fastForwardOnly: true, dryRun: true })

    // assert
    expect(m.oid).toBe(desiredOid)
    expect(m.alreadyMerged).toBeFalsy()
    expect(m.fastForward).toBe(true)
    const oid = await resolveRef({ fs, dir, ref: 'main' })
    expect(oid).toBe(originalOid)
  })

  it("merge 'add-files' and 'remove-files'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const commit = (await log({ fs, dir, depth: 1, ref: 'add-files-merge-remove-files', }))[0].commit

    // act
    const report = await merge({ fs, dir, ours: 'add-files', theirs: 'remove-files', author })

    // assert
    const mergeCommit = (await log({fs, dir, ref: 'add-files', depth: 1, }))[0].commit
    expect(report.tree).toBe(commit.tree)
    expect(mergeCommit.tree).toBe(commit.tree)
    expect(mergeCommit.message).toBe(commit.message)
    expect(mergeCommit.parent).toEqual(commit.parent)
  })

  it("merge 'remove-files' and 'add-files'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const commit = (await log({ fs, dir, depth: 1, ref: 'remove-files-merge-add-files', }))[0].commit

    // act
    const report = await merge({ fs, dir, ours: 'remove-files', theirs: 'add-files', author })

    // assert
    const mergeCommit = (await log({ fs, dir, ref: 'remove-files', depth: 1, }))[0].commit
    expect(report.tree).toBe(commit.tree)
    expect(mergeCommit.tree).toBe(commit.tree)
    expect(mergeCommit.message).toBe(commit.message)
    expect(mergeCommit.parent).toEqual(commit.parent)
  })

  it("merge 'delete-first-half' and 'delete-second-half' (dryRun, missing author)", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)

    // act
    const action = async () => {
      await merge({ fs, dir, ours: 'delete-first-half', theirs: 'delete-second-half', dryRun: true })
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.MissingNameError)
  })

  it("merge 'delete-first-half' and 'delete-second-half' (dryRun)", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const commit = (await log({ fs, dir, depth: 1, ref: 'delete-first-half-merge-delete-second-half', }))[0]
    const originalCommit = (await log({ fs, dir, ref: 'delete-first-half', depth: 1 }))[0]

    // act
    const report = await merge({ fs, dir, ours: 'delete-first-half', theirs: 'delete-second-half', author, dryRun: true })

    // assert
    expect(report.tree).toBe(commit.commit.tree)
    // make sure branch hasn't been moved
    const notMergeCommit = (await log({ fs, dir, ref: 'delete-first-half', depth: 1 }))[0]
    expect(notMergeCommit.oid).toBe(originalCommit.oid)
    if (!report.oid) throw new Error('type error')
    // make sure no commit object was created
    expect(await fs.exists(`${dir}/.git/objects/${report.oid.slice(0, 2)}/${report.oid.slice(2)}`)).toBe(false)
  })

  it("merge 'delete-first-half' and 'delete-second-half' (noUpdateBranch)", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const commit = (await log({ fs, dir, depth: 1, ref: 'delete-first-half-merge-delete-second-half' }))[0]
    const originalCommit = (await log({ fs, dir, ref: 'delete-first-half', depth: 1 }))[0]

    // act
    const report = await merge({
      fs,
      dir,
      ours: 'delete-first-half',
      theirs: 'delete-second-half',
      author,
      noUpdateBranch: true
    })

    // assert
    expect(report.tree).toBe(commit.commit.tree)
    // make sure branch hasn't been moved
    const notMergeCommit = (await log({ fs, dir, ref: 'delete-first-half', depth: 1 }))[0]
    expect(notMergeCommit.oid).toBe(originalCommit.oid)
    if (!report.oid) throw new Error('type error')
    // but make sure the commit object exists
    expect(await fs.exists(`${dir}/.git/objects/${report.oid.slice(0, 2)}/${report.oid.slice(2)}`)).toBe(true)
  })

  it("merge 'delete-first-half' and 'delete-second-half'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const commit = (await log({ fs, dir, depth: 1, ref: 'delete-first-half-merge-delete-second-half' }))[0].commit

    // act
    const report = await merge({ fs, dir, ours: 'delete-first-half', theirs: 'delete-second-half', author })

    // assert
    const mergeCommit = (await log({ fs, dir, ref: 'delete-first-half', depth: 1 }))[0].commit
    expect(report.tree).toBe(commit.tree)
    expect(mergeCommit.tree).toBe(commit.tree)
    expect(mergeCommit.message).toBe(commit.message)
    expect(mergeCommit.parent).toEqual(commit.parent)
  })

  it("merge 'a-file' and 'a-folder'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)

    // act
    const action = async () => {
      await merge({ fs, dir, ours: 'a-file', theirs: 'a-folder', author })
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.MergeNotSupportedError)
  })

  it("merge two branches that modified the same file (no conflict)'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const commit = (await log({ fs, dir, depth: 1, ref: 'a-merge-b' }))[0].commit

    // act
    const report = await merge({ fs, dir, ours: 'a', theirs: 'b', author })

    // assert
    const mergeCommit = (await log({ fs, dir, ref: 'a', depth: 1 }))[0].commit
    expect(report.tree).toBe(commit.tree)
    expect(mergeCommit.tree).toBe(commit.tree)
    expect(mergeCommit.message).toBe(commit.message)
    expect(mergeCommit.parent).toEqual(commit.parent)
  })

  it("merge two branches where one modified file and the other modified file mode'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)
    const commit = (await log({ fs, dir, depth: 1, ref: 'a-merge-d' }))[0].commit

    // act
    const report = await merge({ fs, dir, ours: 'a', theirs: 'd', author })

    // assert
    const mergeCommit = (await log({ fs, dir, ref: 'a', depth: 1, }))[0].commit
    expect(report.tree).toBe(commit.tree)
    expect(mergeCommit.tree).toBe(commit.tree)
    expect(mergeCommit.message).toBe(commit.message)
    expect(mergeCommit.parent).toEqual(commit.parent)
  })

  it("merge two branches that modified the same file (should conflict)'", async () => {
    // arrange
    const { fs, dir } = await makeFsFixture(mergeFsFixtureData as FsFixtureData)

    // act
    const action = async () => {
      await merge({ fs, dir, ours: 'a', theirs: 'c', author })
    }

    // assert
    await expectToFailWithTypeAsync(action, Errors.MergeNotSupportedError)
  })
})
