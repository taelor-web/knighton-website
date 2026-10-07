# Domain switch checklist: knightonarchitecture.com → GitHub Pages

**Not done yet.** The live site is still on Squarespace. Work through this list
only when you're ready to cut over.

## What the domain looks like today (checked 2026-10-07)

| Record | Current value | Action at cutover |
|---|---|---|
| Nameservers | `ns-cloud-d1..d4.googledomains.com` (Google Domains, now run by Squarespace Domains) | Keep. Edit records there. |
| `@` A | `198.185.159.144`, `198.185.159.145`, `198.49.23.144` (Squarespace) | **Replace** with GitHub's (below) |
| `www` CNAME | `ext-sq.squarespace.com` | **Replace** with `taelor-web.github.io` |
| MX | `aspmx.l.google.com` + alts (Google Workspace email) | **Do not touch** |
| TXT | `v=spf1 include:_spf.google.com ~all`, `MS=ms12011913` | **Do not touch** |

Email runs on Google Workspace and is independent of the website. Only change
the `@` A/AAAA records and the `www` CNAME.

## 0. Before you start

- [ ] Finish the "Must do before cutover" items in `TODO.md` (videos).
- [ ] Check the preview at https://taelor-web.github.io/knighton-website/ one
      last time.
- [ ] Screenshot or export the full DNS record list in Squarespace Domains, so
      you can roll back.
- [ ] Optional: lower the TTL on the `@` and `www` records to 300 seconds a day
      ahead, so the switch (and any rollback) propagates fast.

## 1. Verify the domain with GitHub (prevents domain takeover)

- [ ] GitHub → Settings (your account) → Pages → **Add a domain** →
      `knightonarchitecture.com`.
- [ ] GitHub shows a TXT record (`_github-pages-challenge-taelor-web` = some
      code). Add it in Squarespace Domains DNS, then click **Verify**.

## 2. Add the CNAME file

- [ ] Create a file named `CNAME` at the repo root containing exactly one line:

      knightonarchitecture.com

- [ ] Commit and push ("Add CNAME for knightonarchitecture.com"). Or set it in
      repo Settings → Pages → Custom domain, which commits the file for you.

Note: once the custom domain is set, the `taelor-web.github.io/knighton-website/`
preview URL redirects to the real domain.

## 3. Change DNS (Squarespace Domains → knightonarchitecture.com → DNS)

Delete the Squarespace website records (the "Squarespace Defaults" preset) and
add:

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `taelor-web.github.io` |

Do not use wildcard (`*`) records.

Check propagation:

```bash
nslookup knightonarchitecture.com
```

```bash
nslookup www.knightonarchitecture.com
```

## 4. Turn on HTTPS

- [ ] Repo → Settings → Pages. Wait for the DNS check to go green (minutes to
      a few hours). GitHub then issues a Let's Encrypt certificate.
- [ ] Tick **Enforce HTTPS** (greyed out until the certificate exists — wait
      and retry, up to ~24 h).
- [ ] Test `http://`, `https://`, `www.` and bare domain all land on
      `https://knightonarchitecture.com/`.

## 5. Squarespace

- [ ] **Do not cancel the domain.** The domain registration lives in Squarespace
      Domains (separate from the website plan). Keep it, or transfer it to
      another registrar later. Keep auto-renew on.
- [ ] Spot-check pages, project links and Google search result links on the new
      site for a few days.
- [ ] Only after the videos are re-hosted and the new site has run cleanly for a
      week or two: cancel the Squarespace **website** subscription.
- [ ] Before cancelling, export anything you still want (blog posts, form
      submissions, original images).

## Rollback

Put the Squarespace records back (A: `198.185.159.144`, `198.185.159.145`,
`198.49.23.144`; `www` CNAME: `ext-sq.squarespace.com`) and remove the custom
domain in repo Settings → Pages.
