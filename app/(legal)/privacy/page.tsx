import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function Privacy() {
  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', color: '#dbdee1' }}>
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>
              Privacy Policy
            </span>
            <span style={{ fontSize: '0.75rem', color: '#949ba4' }}>
              Last updated: 2026-03-30
            </span>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Any information we collect is not used in any malicious manner. If
              anything shown seems misleading, please contact us @{" "}
              <a href="mailto:legal@azron.net" style={{ color: '#fff', textDecoration: 'underline' }}>
                legal@azron.net
              </a>
            </p>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                Information We Collect
              </h2>
              <ul style={{ paddingLeft: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                <li>Guild IDs</li>
                <li>Guild Names</li>
                <li>Channel IDs</li>
                <li>Role IDs</li>
                <li>User IDs</li>
                <li>Message Timestamps</li>
                <li>Message IDs</li>
                <li>Past Avatars</li>
                <li>Nicknames and Usernames</li>
                <li>Message content when a command is ran (stored for a max of 14 days) or when arguments are passed for commands</li>
                <li>Last deleted message content (stored for a max of 2 hours or less)</li>
                <li>Last message edit history (stored for a max of 2 hours or less)</li>
                <li>Last Emoji Reaction History (stored for a max of 2 hours or less)</li>
              </ul>
            </div>

            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              Why do we need the data and how is it used?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              When a command is invoked, we store the message content for a maximum
              of 14 days for debugging purposes. We also store a maximum of 18
              entries for edited messages and sniping messages that will expire in
              two hours or less in volatile memory.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Guild IDs, Channel IDs, Role IDs, User IDs and Message IDs are all
              stored for our system to aggregate values to find data.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Nickname, Username and Avatar changes are logged in order for the
              &quot;namehistory&quot; and &quot;avatarhistory&quot; commands to function. Users can
              clear this data themselves at any time.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Guild name changes are logged in order for the &quot;gnames&quot; command to
              function. Server administrators can clear this data themselves at any
              time.
            </p>

            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              Who is your collected information shared with?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              We do not sell or expose your information to others, and, or third
              parties.
            </p>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                Data Removal
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Email{" "}
                <a href="mailto:legal@azron.net" style={{ color: '#fff', textDecoration: 'underline' }}>
                  legal@azron.net
                </a>{" "}
                for all of your data that we are currently storing. Response times
                may vary and could take up to 7 days.
              </p>
            </div>

            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              Data Storage and Backups
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Our primary data storage is located in Ashburn, Virginia. For redundancy
              and disaster recovery, we maintain replicated backups across data
              centers in Secaucus, New Jersey.
            </p>

            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              Changes to the Privacy Policy
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              We can update these terms at any time without notice. Continuing to
              use our services after any changes will mean that you agree with these
              terms and violation of our terms of service could result in a
              permanent ban across all of our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}