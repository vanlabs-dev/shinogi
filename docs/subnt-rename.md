# subnt rename audit

Audited 2026-09-22. Source rename reviewed and validated in both repositories.
The GitHub repository is now `vanlabs-dev/subnt`, and the workstation directory
is `/home/van/src/github/vanlabs-dev/subnt`. Its `origin` now uses
`git@github.com:vanlabs-dev/subnt.git`; remote access was verified.

The operator reports running step 1 on the device. The service result still
needs confirmation before release. No device migration, push, DNS change,
or Cloudflare change was performed in this continuation.

## Source changes completed

| Surface | Change |
|---|---|
| Public HTML | `index.html` title, wordmark and footer; `404.html` title and root-link label |
| Page contract | Both wordmark assertions use `SUBNT`; safety and data rules unchanged |
| Project docs | `AGENTS.md`, OpenSpec config, living spec, archived spec and session notes |
| Atlas renderer | `shinogi/atlas_shinogi.py` becomes `subnt/atlas_subnt.py`; branding, CLI name, error class (`SubntError`), messages and comments updated |
| Atlas tests | `subnt/tests/test_subnt.py`, module import, error assertions, fixture state filename and remote URL |
| Atlas config | `checkout_dir=/home/pi/subnt`; `state_db=var/subnt/subnt.db` |
| Atlas scheduling | `subnt/systemd/atlas-subnt.service` and `.timer`; ExecStart uses the new module path |
| Atlas specs | `subnt-publish` living spec and `2026-09-11-subnt-renderer` archive, including directory names and references |
| Atlas docs | Root and module READMEs, decisions, cross-references in the network-drift archive |

Archived documents use the new terminology and paths; their original dates
and completion records remain historical. Git history was not rewritten.
The generated page received only the three branding substitutions, alongside
the matching renderer changes. Its figures and as-of time were preserved.
Atlas remains the sole producer of future editions.

## External and local dependencies still pending

- GitHub rename and workstation directory/remote changes are complete.
  The new repository resolves and its default branch is `main`. Its homepage
  field is empty; set it to `https://subnt.dev` after the domain cutover.
- Workstation: update any external bookmarks or workspace entries that still
  use the old directory path.
- Pi: deployed files were not inspected or changed. Verify the documented
  old paths below before running the migration. Change checkout, state,
  installed units, credential filename and SSH `IdentityFile` together.
- GitHub deploy key: verified existing key ID `162921037` has
  `read_only=false`. Its label remains `pi-shinogi-deploy`. A cosmetic label
  change is pending; preserve the existing key and write scope.
- Cloudflare and the live URL are operator-owned: check the Pages repository
  connection, project label, custom domain, apex/www choice and any old-domain
  redirects. Source text uses `subnt.dev`; this audit does not certify it live.
- No tracked CI workflow, build configuration, package name, browser data
  endpoint, canonical URL, sitemap or manifest needed a separate rename.
  The page's root-relative 404 link stays `/`.

## Cutover sequence

Review and commit both repositories first. Atlas instructions require an
explicit request before pushing. Stop the old publisher before releasing the
rename, so it cannot overwrite the new wordmark or run from deleted paths.

1. On the Pi, stop scheduling and allow any running publish to finish:

   ```bash
   sudo systemctl disable --now atlas-shinogi.timer
   systemctl is-active atlas-shinogi.service
   ```

   Proceed only when the service is inactive. If it is active, wait for it to
   finish. Inspect failures before moving its state or checkout.

2. Rename the existing GitHub repository, then update the workstation remote:

   ```bash
   git remote set-url origin git@github.com:vanlabs-dev/subnt.git
   git ls-remote origin refs/heads/main
   ```

   Push the reviewed public-page and Atlas commits only when authorized.
   Keep the old timer disabled throughout both pushes and the device migration.

3. On the Pi, check both working trees are clean, then fast-forward Atlas:

   ```bash
   git -C /home/pi/atlas status --short
   git -C /home/pi/shinogi status --short
   git -C /home/pi/atlas pull --ff-only
   test ! -e /home/pi/subnt
   mv /home/pi/shinogi /home/pi/subnt
   git -C /home/pi/subnt remote set-url origin git@github.com:vanlabs-dev/subnt.git
   ```

   Stop if either checkout is dirty, a command fails, or a target exists.
   Do not merge or reset a diverged checkout as part of this rename.

4. Preserve the publish-state database using SQLite backup, not a fresh
   empty store. With the old service inactive, run on the Pi:

   ```bash
   python3 - <<'PY'
   from pathlib import Path
   import sqlite3

   old = Path('/home/pi/atlas/var/shinogi/shinogi.db')
   new = Path('/home/pi/atlas/var/subnt/subnt.db')
   assert old.is_file(), f'Missing publish state: {old}'
   assert not new.exists(), f'Target already exists: {new}'
   new.parent.mkdir(parents=True, exist_ok=True)
   source = sqlite3.connect(old.as_uri() + '?mode=ro', uri=True)
   target = sqlite3.connect(new)
   try:
       source.backup(target)
       assert target.execute('PRAGMA integrity_check').fetchone() == ('ok',)
       assert source.execute('SELECT key, value FROM meta ORDER BY key').fetchall() == \
           target.execute('SELECT key, value FROM meta ORDER BY key').fetchall()
   finally:
       target.close()
       source.close()
   PY
   ```

   Keep the old database as a rollback copy. The new store must retain
   `figures`, `published_at` and `content_sha256`. SQLite backup includes
   committed WAL data and avoids losing the previous edition's deltas.

5. Rename the existing SSH key files to `~/.ssh/id_ed25519_subnt` and
   `~/.ssh/id_ed25519_subnt.pub`, checking first that neither target exists.
   Update the matching `IdentityFile` in `~/.ssh/config`. Preserve permissions,
   key contents and `IdentitiesOnly yes`. Verify repository access, then pull:

   ```bash
   git -C /home/pi/subnt ls-remote origin refs/heads/main
   git -C /home/pi/subnt pull --ff-only
   ```

   Confirm on GitHub that the existing deploy key still has write access.
   A successful read alone does not prove write access.

6. Validate before enabling publishing:

   ```bash
   cd /home/pi/atlas
   python3 subnt/atlas_subnt.py compose --out /tmp/subnt-preview.html
   python3 -m unittest discover -s subnt/tests -t subnt/tests
   cd /home/pi/subnt
   pytest -q
   ```

   Inspect the preview for `SUBNT`, `subnt.dev`, a clean exclusion scan,
   preserved previous-edition comparisons and the expected recorded figures.
   If pytest is unavailable on the Pi, run the page contract on the same
   revision on the workstation. Do not install dependencies blindly.

7. Install the new service and timer, perform one publish, then schedule it:

   ```bash
   sudo cp /home/pi/atlas/subnt/systemd/atlas-subnt.service /etc/systemd/system/
   sudo cp /home/pi/atlas/subnt/systemd/atlas-subnt.timer /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl start atlas-subnt.service
   sudo journalctl -u atlas-subnt.service -n 40 --no-pager
   sudo systemctl enable --now atlas-subnt.timer
   systemctl list-timers atlas-subnt.timer
   systemctl is-enabled atlas-shinogi.timer
   ```

   Enable the timer only after the manual service succeeds. The old timer
   must remain disabled. Remove obsolete installed units after verification.
   The cadence remains every six hours at :55 local time, plus up to three
   minutes of jitter. The changed branding participates in the publish hash;
   no hash reset is needed.

## Validation and rollback

Local checks rerun 2026-09-22: 8 page contract tests passed; 75 Atlas
renderer tests passed. Both repositories pass `git diff --check`.
No live publish or device integration test was run. Remaining old-name
references in current source belong only to this migration guide. Git
metadata, ignored caches, the current workspace path and undeployed device
files can still use the old name.

If cutover fails, leave both timers disabled and inspect the service log.
Restore the prior Atlas revision, checkout path, SSH configuration and saved
state together before re-enabling the old publisher. Preserve any new state
and local publish commit for diagnosis. Do not reset a failed push or delete
state to force publication.
