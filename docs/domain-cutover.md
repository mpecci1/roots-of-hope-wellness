# Moving rootsofhopeandwellness.com to the new site

Checked live on 2026-09-29. Registrar is GoDaddy. DNS is currently run by
Squarespace. The site currently served is the old Squarespace one.

## Read this first: her email is on this domain

`RHW@rootsofhopeandwellness.com` is Microsoft 365, resold through GoDaddy and
filtered by Proofpoint. Changing nameservers moves **all** DNS, mail included.
If these three records are not recreated exactly, her email stops working.

| Type | Name | Value | Priority |
| --- | --- | --- | --- |
| MX | @ | mx1-usg1.ppe-hosted.com | 0 |
| MX | @ | mx2-usg1.ppe-hosted.com | 0 |
| MX | @ | mx3-usg1.ppe-hosted.com | 0 |
| TXT | @ | `v=spf1 include:_spf-usg1.ppe-hosted.com include:secureserver.net ~all` | |
| TXT | @ | `NETORG18313638.onmicrosoft.com` | |

Good news: that is the whole list. There is no autodiscover CNAME, no DKIM
selector records, no SRV records and no DMARC record today, so nothing else
about mail needs preserving.

## Why nobody can give you the nameservers yet

Cloudflare assigns a nameserver pair when the domain is added to an account.
They do not exist before that. So the order has to be: add the domain, read the
pair off the screen, then change them at GoDaddy.

## Step 1. Add the domain to Cloudflare (nothing goes live)

Adding the domain changes nothing publicly. The old site keeps serving and
email keeps working until the nameservers change in step 2.

1. dash.cloudflare.com, "Add a domain", enter `rootsofhopeandwellness.com`,
   choose the Free plan.
2. Cloudflare scans the existing DNS. **Check the imported list against the
   table above** and add anything missing by hand. This is the step that
   protects the email.
3. Cloudflare shows two nameservers, like `alice.ns.cloudflare.com` and
   `bob.ns.cloudflare.com`. Those two are what GoDaddy needs.

## Step 2. Change the nameservers at GoDaddy

Currently eight, from Squarespace and NS1:

```
ns01.squarespacedns.com   dns1.p06.nsone.net
ns02.squarespacedns.com   dns2.p06.nsone.net
ns03.squarespacedns.com   dns3.p06.nsone.net
ns04.squarespacedns.com   dns4.p06.nsone.net
```

In GoDaddy: My Products, the domain, Manage DNS, Nameservers, Change, "I'll use
my own nameservers". Remove all eight, add the two from Cloudflare, save.

Propagation is usually under an hour, occasionally up to 48. The zone in
Cloudflare flips to "Active" when it has taken.

## Step 3. Point the domain at the new site

Only after the zone is Active. In Cloudflare: Workers & Pages,
`roots-of-hope-wellness`, Settings, Domains & Routes, Add, Custom Domain.
Add `rootsofhopeandwellness.com`, then repeat for `www.rootsofhopeandwellness.com`.
Cloudflare creates the DNS records and issues the certificate itself.

## Step 4. Verify before calling it done

- `https://rootsofhopeandwellness.com` and the www version both load the new site
- The padlock is valid on both
- **Send an email to her address from an outside account and have her reply.**
  Do this the same day, not a week later.
- The old workers.dev address still works, which is fine.


## Decided: www is the canonical hostname, not the bare domain

Checked live. Everything Google has indexed is on `www`, the bare domain
already 301s to `www`, and the old site's own canonical tag says `www`. So
keep `www` and point the bare domain at it. That means one extra step after
the custom domains are added:

Cloudflare, Rules, Redirect Rules, Create rule:
hostname equals `rootsofhopeandwellness.com`, then "Dynamic redirect" to
`concat("https://www.rootsofhopeandwellness.com", http.request.uri.path)`,
status 301, preserve query string. Without this both hostnames serve the same
pages and Google treats them as duplicates.

## Already done in the code

- **Old URLs are redirected.** Five of the seven URLs in the old Squarespace
  sitemap would have 404'd: `/home`, `/appointments` and all three blog posts,
  two of them with opaque Squarespace slugs. A `_redirects` file 301s each to
  its new page. Tested live on the workers.dev hostname, all five pass.
- **The canonical swap is staged** at `tools/go-live.sh`. Run it the day the
  domain goes live: `bash tools/go-live.sh --apply`, then commit and push. It
  rewrites all 78 workers.dev references across the pages, the sitemap and
  robots.txt, and verifies the structured data still parses.

## Step 5. Afterwards

- Run `bash tools/go-live.sh --apply`, commit, push.
- Resubmit the sitemap in Google Search Console, and add the new domain as a
  property there if it is not already.
- Leave Squarespace paid up for a couple of weeks as a fallback, then cancel.

## Copy-paste: the root-to-www redirect rule

Cloudflare, Rules, Redirect Rules, Create rule. Name it "root to www".

**When incoming requests match**, use the expression editor and paste:

```
(http.host eq "rootsofhopeandwellness.com")
```

**Then**, choose Dynamic redirect, and paste as the expression:

```
concat("https://www.rootsofhopeandwellness.com", http.request.uri.path)
```

Status code 301. Turn ON "Preserve query string". Deploy.

Without this, both hostnames serve the same pages and Google treats it as two
copies of the site.
