To clarify on the Cloudflare setup:

We are utilizing the **Free tier** of Cloudflare right now. It provides exactly what we need at this stage: enterprise-grade DNS routing, edge caching for our static assets, and core DDoS mitigation. There is absolutely no reason to burn budget on the Pro plan until we hit massive, complex traffic scaling issues. The Free tier is more than capable for our current launch.

Since you'll likely ask about the overlap between Cloudflare and Google reCAPTCHA—they do two entirely different things for our security stack. 

Here is the difference:
1. **Cloudflare** acts at the network level. It is the security guard at the front gate. It blocks known malicious bots, scrapers, and DDoS attacks *before* they even touch our Hostinger server. It saves us massive amounts of server bandwidth and CPU.
2. **reCAPTCHA** acts at the application level. It is the lock on a specific door inside the building. It ensures that a real human is actually filling out and submitting our lead forms or login pages, stopping form-submission spam. 

We need both. Cloudflare protects the server infrastructure, and reCAPTCHA protects the application forms. Let's get them both connected properly during the deployment sequence.
