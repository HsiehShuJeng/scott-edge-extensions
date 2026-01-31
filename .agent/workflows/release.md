---
description: Release flow (npm release + manifest sync + amend + tag + push)
---

1. Run the release script (bumps version in package.json, changelog, and creates git commit/tag)
   - `npm run release`

2. Sync manifest.json with the new package.json version
   - `node scripts/sync-version.js`

3. Stage the updated manifest.json
   - `git add asking-expert/manifest.json`

4. Amend the release commit to include the manifest update
   - `git commit --amend --no-edit`

5. Update the git tag to point to the amended commit
   - `git tag -f v$(node -p "require('./package.json').version")`

6. Push the commit and the tag
   - `git push --follow-tags origin $(git branch --show-current)`
