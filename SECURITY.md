# Security Policy

## Supported Versions

This project is a continuously deployed web application. Only the currently
deployed version is supported — there are no maintained release branches.

| Version                     | Supported          |
| --------------------------- | ------------------ |
| Current deployment (`main`) | :white_check_mark: |
| Older commits / branches    | :x:                |

## Scope

In scope:

- `https://dynastiestleague.com`
- `https://dynastiest-league.pages.dev`
- This repository's source code

Out of scope:

- Third-party services this project depends on (Cloudflare, GitHub, Sleeper API,
  and similar). Report those to the respective vendor.
- Findings that require physical access, a compromised device, or a
  man-in-the-middle position on the victim's network.
- Missing security headers or best-practice recommendations with no demonstrated
  impact.
- Automated scanner output submitted without a working proof of concept.
- Denial of service, volumetric, or brute-force testing.
- Social engineering of maintainers or users.

## Reporting a Vulnerability

Please do **not** open a public issue for security reports.

Preferred: open a private report through
[GitHub Security Advisories](https://github.com/jason-shprintz/dynastiest-league/security/advisories/new).

Alternatively, email **<jshprintz@gmail.com>**.

Include as much of the following as you can:

- A description of the issue and its impact
- Steps to reproduce, or a proof of concept
- The affected URL, endpoint, or file
- Any relevant logs, requests, or screenshots

## What to Expect

This is a hobby project maintained by one person in their spare time, so
timelines are best-effort rather than guaranteed:

- **Acknowledgement:** within 5 business days
- **Initial assessment:** within 14 days
- **Fix or mitigation:** depends on severity; critical issues are prioritized

You'll be kept updated as the report progresses, and credited in the advisory
once a fix ships — unless you'd prefer to stay anonymous.

## Safe Harbor

Research conducted in good faith under this policy is welcome. If you follow it,
no legal action will be pursued. Please:

- Only test against accounts and data you own
- Avoid accessing, modifying, or exfiltrating other users' data
- Avoid degrading service availability for others
- Give a reasonable window to remediate before public disclosure

If you're unsure whether something is in bounds, ask first at the contact above.
