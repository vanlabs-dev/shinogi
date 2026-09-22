# subnt rename audit

## Cutover status (2026-09-22)

Repository, publisher and domain cutover complete. `https://subnt.dev` is live.

- GitHub repository and workstation directory are `subnt`; both workstation
  and device remotes use `git@github.com:vanlabs-dev/subnt.git`.
- Source commits pushed: public page `b37d0f5`, Atlas `1c75b88`.
  Atlas follow-up `023d202` makes the test bare remote explicitly use `main`;
  two tests had depended on the workstation's default branch setting.
- Device checkout is `/home/pi/subnt`. SQLite backup preserved every metadata
  row, including `figures`, `published_at` and `content_sha256`, and passed
  `PRAGMA integrity_check`. The original database remains for rollback.
- Existing deploy key moved to `~/.ssh/id_ed25519_subnt`; fingerprint and
  write access are unchanged. SSH configuration backup: `~/.ssh/config.before-subnt`.
- Preview exclusion scan passed; `first_edition=false` and previous-edition
  comparisons were preserved. All 75 renderer tests passed on the device.
  Pytest is absent there; all 8 page tests passed on the workstation against
  the exact device-published revision.
- `atlas-subnt.service` published `022df7d` successfully at 05:00 UTC
  (`Result=success`, `ExecMainStatus=0`). `atlas-subnt.timer` is enabled;
  first scheduled run was listed as 18:56 NZST, then every six hours at :55
  plus up to three minutes of jitter.
- Old units are inactive and no longer installed. They are retained in
  `/etc/systemd/subnt-rename-backup/` for rollback.
- The operator reconnected `vanlabs-dev/subnt` in Cloudflare with a blank
  build command and deploy command `npx wrangler deploy`. The build for
  `d28bb54` succeeded, confirming the reconnected trigger.
- `https://subnt.dev` serves the exact published `index.html` over valid
  HTTPS with HTTP 200; an unknown path returns HTTP 404. Public DNS resolves
  to Cloudflare. The operator confirmed the page loads after an earlier
  negative DNS cache expired. `www.subnt.dev` is not configured.

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

## Remaining metadata and optional cleanup

- GitHub rename and workstation directory/remote changes are complete.
  The default branch is `main`; the GitHub homepage is `https://subnt.dev`.
- Workstation: update any external bookmarks or workspace entries that still
  use the old directory path.
- Device migration is complete; the sequence below is retained as the
  migration and rollback record, not an instruction to repeat completed steps.
- GitHub deploy key: existing key ID `162921037` retains `read_only=false`.
  Its cosmetic label remains `pi-shinogi-deploy`; keep the key and write scope.
- Cloudflare build check still uses the cosmetic name `Workers Builds: shinogi`.
  An optional label rename is not required for the live `subnt.dev` domain.
  The old domain has no A record in the verified public DNS response;
  an old-domain redirect is not configured by this migration.
- No tracked CI workflow, build configuration, package name, browser data
  endpoint, canonical URL, sitemap or manifest needed a separate rename.
  The page's root-relative 404 link stays `/`.

## Completed cutover sequence

Historical procedure only. Do not rerun it on the migrated device.

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

Validation: 8 page tests on the workstation and 75 renderer tests on the
workstation and device passed. Both repositories passed `git diff --check`.
The service published successfully and Cloudflare served the exact edition
on `https://subnt.dev`, with valid HTTPS and the expected 404 response.

If cutover fails, leave both timers disabled and inspect the service log.
Restore the prior Atlas revision, checkout path, SSH configuration and saved
state together before re-enabling the old publisher. Preserve any new state
and local publish commit for diagnosis. Do not reset a failed push or delete
state to force publication.
