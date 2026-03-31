"use client";

export default function Terms() {
  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-evict-primary bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-white/60 text-lg">
          Last updated and effective since: 2025-11-11
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-white/80 mb-6">
          By visiting ("Evict") or inviting ("Evict Bot") to your Discord 
          or logging into our website ("evict.bot"), you agree and consent to the terms displayed on this page, 
          including our policies (Privacy Policy). 
          When we state "Evict", "we", "us", and "our" in these terms, we mean Evict, 
          operated by Azron, LLC. "Services" refers to the services provided by Evict to users.
        </p>

        <p className="text-white/80 mb-6">
          If any information stated here seems misleading, please contact us @{" "}
          <a
            href="mailto:legal@azron.net"
            className="text-evict-primary hover:text-evict-primary/80 transition-colors"
          >
            legal@azron.net
          </a>
        </p>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-medium text-white mb-4">Disclaimer</h2>
          <p className="text-white/80">
            You may not use Evict to violate any applicable laws or regulations
            as well as Discord's Terms of Service and Community Guidelines. If
            you encounter individuals or communities doing so, please send an
            email to{" "}
            <a
              href="mailto:legal@azron.net"
              className="text-evict-primary hover:text-evict-primary/80 transition-colors"
            >
              legal@azron.net
            </a>
            . If you are refunded under any circumstances, your Discord account
            may be subject to blacklist and a ban from all of our services.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
          Evict Website Usage
        </h2>
        <p className="text-white/80 mb-4">
          You are required to be compliant with the terms shown on this page.
          You are not to do any of the following:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-white/80 mb-6">
          <li>Malicious attempts of exploiting the website.</li>
          <li>Malicious use of the website.</li>
          <li>Scraping content on this website for malicious use.</li>
          <li>Framing a portion or all of the website.</li>
          <li>Copy Evict's website and claiming it as your own work.</li>
          <li>
            Commands labeled as 18+ shall only be used by users 18+, anybody
            under 18 using these commands are subject to blacklist.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
          Evict Bot Usage
        </h2>
        <p className="text-white/80 mb-4">
          You are not to do any of the following:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-white/80 mb-6">
          <li>Violate the Discord Terms of Service.</li>
          <li>Copy Evict's services or features.</li>
          <li>Assist anyone in copying evict's services or features.</li>
          <li>Abuse or exploit Evict or any of our services.</li>
          <li>Run a Discord Server that has been terminated repeatedly.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
          Termination
        </h2>
        <p className="text-white/80 mb-6">
          We reserve the right to terminate your access to our services
          immediately (under our sole discretion) without prior notice or
          liability for any reason (including, but not limited to, a breach of
          the terms).
        </p>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-medium text-white mb-4">Indemnity</h2>
          <p className="text-white/80">
            You shall indemnify us against all liabilities, costs, expenses,
            damages and losses (including any direct, indirect or consequential
            losses, loss of profit, loss of reputation and all interest,
            penalties and legal and other reasonable professional costs and
            expenses) suffered or incurred by you arising out of or in
            connection with your use of the service, or a breach of the terms.
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
          Changes to the Terms of Service
        </h2>
        <p className="text-white/80 mb-6">
          We can update these terms at any time without notice. Continuing to
          use our services after any changes will mean that you agree with these
          terms and violation of our terms of service could result in a
          permanent ban across all of our services.
        </p>
      </div>
    </div>
  );
}