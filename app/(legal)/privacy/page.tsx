import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function Privacy() {
  return (
    <div className="container">
      <div className="doc-card">
        <header className="doc-card-header">
          <span className="doc-card-title">Privacy Policy</span>
          <span className="doc-card-meta">Last updated: 2026-03-30</span>
        </header>

        <div className="doc-card-body doc-prose">
          <p>
            Any information we collect is not used in any malicious manner. If
            anything shown seems misleading, please contact us @{' '}
            <a href="mailto:legal@azron.net">legal@azron.net</a>
          </p>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '0.9rem 1.1rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3>Information We Collect</h3>
            <ul>
              <li>Guild IDs</li>
              <li>Guild Names</li>
              <li>Channel IDs</li>
              <li>Role IDs</li>
              <li>User IDs</li>
              <li>Message Timestamps</li>
              <li>Message IDs</li>
              <li>Past Avatars</li>
              <li>Nicknames and Usernames</li>
              <li>
                Message content when a command is ran (stored for a max of 14 days) or when
                arguments are passed for commands
              </li>
              <li>Last deleted message content (stored for a max of 2 hours or less)</li>
              <li>Last message edit history (stored for a max of 2 hours or less)</li>
              <li>Last Emoji Reaction History (stored for a max of 2 hours or less)</li>
            </ul>
          </div>

          <h3>Why do we need the data and how is it used?</h3>
          <p>
            When a command is invoked, we store the message content for a maximum of 14 days
            for debugging purposes. We also store a maximum of 18 entries for edited messages
            and sniping messages that will expire in two hours or less in volatile memory.
          </p>
          <p>
            Guild IDs, Channel IDs, Role IDs, User IDs and Message IDs are all stored for our
            system to aggregate values to find data.
          </p>
          <p>
            Nickname, Username and Avatar changes are logged in order for the &quot;namehistory&quot;
            and &quot;avatarhistory&quot; commands to function. Users can clear this data themselves at
            any time.
          </p>
          <p>
            Guild name changes are logged in order for the &quot;gnames&quot; command to function.
            Server administrators can clear this data themselves at any time.
          </p>

          <h3>Who is your collected information shared with?</h3>
          <p>
            We do not sell or expose your information to others, and, or third parties.
          </p>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '0.9rem 1.1rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3>Data Removal</h3>
            <p style={{ marginBottom: 0 }}>
              Email <a href="mailto:legal@azron.net">legal@azron.net</a> for all of your data
              that we are currently storing. Response times may vary and could take up to 7
              days.
            </p>
          </div>

          <h3>Data Storage and Backups</h3>
          <p>
            Our primary data storage is located in Ashburn, Virginia. For redundancy and
            disaster recovery, we maintain replicated backups across data centers in
            Secaucus, New Jersey.
          </p>

          <h3>Changes to the Privacy Policy</h3>
          <p style={{ marginBottom: 0 }}>
            We can update these terms at any time without notice. Continuing to use our
            services after any changes will mean that you agree with these terms and
            violation of our terms of service could result in a permanent ban across all of
            our services.
          </p>
        </div>
      </div>
    </div>
  )
}
