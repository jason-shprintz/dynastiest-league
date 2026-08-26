import {
  PrivacySection,
  SectionDescription,
  UpdatedDate,
  PrivacyContent,
  PrivacyItem,
} from './Privacy.styles';

const UPDATED = 'August 26, 2026';

/**
 * Privacy policy for dynastiestleague.com.
 *
 * Reached from the footer rather than the header navigation, but routable and
 * deep-linkable at `#privacy` like any other section.
 *
 * @returns A React component containing the site's privacy policy
 */
const Privacy = () => {
  return (
    <PrivacySection>
      <h2>Privacy</h2>
      <SectionDescription>
        What this site collects, who receives it, and how to avoid it
      </SectionDescription>
      <UpdatedDate>Last updated {UPDATED}</UpdatedDate>
      <PrivacyContent>
        <PrivacyItem>
          <h3>The short version</h3>
          <p>
            There are no accounts, no sign-ups, no forms and no ads. Nothing is
            sold here, and no data is sold either. The site counts how many
            people visit and which sections they open. That is the extent of
            it.
          </p>
        </PrivacyItem>

        <PrivacyItem>
          <h3>Analytics</h3>
          <p>
            The site uses Google Analytics 4, loaded through Cloudflare Zaraz.
            Zaraz injects the tag at Cloudflare&apos;s edge rather than from a
            script in the page, so the requests are first-party, but the data
            still goes to Google.
          </p>
          <p>What that records on a visit:</p>
          <ul>
            <li>which sections you opened, when, and how long you stayed</li>
            <li>the page or search that referred you</li>
            <li>
              an approximate location — usually country and region — derived
              from your IP address
            </li>
            <li>your browser, operating system and rough screen size</li>
          </ul>
          <p>
            Google Analytics 4 does not store your full IP address. It sets a
            first-party cookie so that a second visit from the same browser is
            counted as a returning visitor rather than a new one.
          </p>
          <p>
            None of this identifies you. It is counts and patterns, not people.
          </p>
        </PrivacyItem>

        <PrivacyItem>
          <h3>How long it is kept</h3>
          <p>
            The detailed record of a visit — the individual events and their
            parameters — is deleted by Google after <strong>two months</strong>.
            The user-level record, the thing that lets two visits from the same
            browser be recognised as one returning visitor, is deleted after{' '}
            <strong>fourteen months</strong>.
          </p>
          <p>
            One honest caveat: those windows govern the detailed and user-level
            data. Aggregate totals — how many people opened a section in a given
            month — sit in Google&apos;s standard reports and are not deleted on
            that schedule.
          </p>
        </PrivacyItem>

        <PrivacyItem>
          <h3>Hosting</h3>
          <p>
            The site is served by Cloudflare Pages. Cloudflare processes every
            request to deliver the page and to protect the site from abuse,
            which involves handling your IP address and may involve setting its
            own cookies for bot detection. That happens at the network level,
            before anything this site controls, and is governed by
            Cloudflare&apos;s own privacy terms.
          </p>
        </PrivacyItem>

        <PrivacyItem>
          <h3>Things loaded from elsewhere</h3>
          <p>
            League data is fetched by your browser rather than by a server, so
            these services see your IP address as a consequence of answering the
            request:
          </p>
          <ul>
            <li>
              <strong>Sleeper</strong> — rosters, matchups, trades, drafts and
              player data all come from the Sleeper fantasy football API
            </li>
            <li>
              <strong>This league&apos;s own Cloudflare Worker</strong> — serves
              the cached AI trade and draft analyses shown on the Trades and
              Draft pages
            </li>
          </ul>
          <p>
            Fonts are served from this site itself, so no font provider is
            involved.
          </p>
        </PrivacyItem>

        <PrivacyItem>
          <h3>Avoiding the analytics</h3>
          <p>
            Any content blocker or privacy-focused browser will stop the
            analytics from loading, as will Google&apos;s official opt-out
            browser add-on. The site works normally without it.
          </p>
          <p>
            Worth being straight about the limits of asking instead: the
            analytics data is not linked to a name or an email, so there is no
            reliable way to find your records and delete them on request.
            Blocking it is the remedy that actually works.
          </p>
        </PrivacyItem>

        <PrivacyItem>
          <h3>Changes</h3>
          <p>
            If what the site collects changes, this page changes with it and the
            date above moves. There is no mailing list to notify.
          </p>
        </PrivacyItem>

        <PrivacyItem>
          <h3>Contact</h3>
          <p>
            Questions about any of this go to{' '}
            <a href="mailto:support@toastbyte.studio">
              support@toastbyte.studio
            </a>
            .
          </p>
        </PrivacyItem>
      </PrivacyContent>
    </PrivacySection>
  );
};

export default Privacy;
