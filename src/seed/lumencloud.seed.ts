export interface SeedDocument {
  id: string;
  title: string;
  content: string;
  metadata: Record<string, string>;
}

export const LUMENCLOUD_SEED: SeedDocument[] = [
  {
    id: 'compute',
    title: 'Compute instances and sizing',
    content:
      'LumenCloud virtual machines are called instances. The nano size has 1 vCPU and 1 GB RAM and is meant for staging. The standard size has 2 vCPU and 4 GB RAM. The performance size has 8 vCPU and 16 GB RAM and is required for production databases.\n\n' +
      'New instances boot from a snapshot in under 40 seconds in us-east-1. Stopped instances still occupy a public IPv4 address unless you release it. You can resize from nano to standard without downtime. Moving to performance requires a reboot.\n\n' +
      'Spot instances cost 60 percent less than on-demand but can be reclaimed with a two-minute warning. Do not run stateful databases on spot. Autoscaling groups can mix on-demand and spot as long as the minimum on-demand count is at least one.',
    metadata: { topic: 'compute', audience: 'engineer' },
  },
  {
    id: 'storage',
    title: 'Object storage buckets and lifecycle',
    content:
      'LumenCloud object storage is called Blobs. A bucket name must be globally unique and lowercase. Default encryption is AES-256. Versioning is off until you enable it. Objects larger than 5 GB must use multipart upload with parts between 8 MB and 100 MB.\n\n' +
      'Lifecycle rules can move objects to Cold storage after 30 days and to Archive after 90 days. Cold reads take up to 15 minutes. Archive restores take up to 12 hours. Deletes are free. Early deletion from Archive before 90 days bills the remaining days.\n\n' +
      'Public buckets need an explicit allow-public ACL plus a bucket policy. New workspaces block public ACLs by default. Signed URLs expire after 15 minutes unless you set a custom TTL up to 7 days.',
    metadata: { topic: 'storage', audience: 'engineer' },
  },
  {
    id: 'network',
    title: 'VPC, subnets, and security groups',
    content:
      'Every LumenCloud project starts with one VPC in us-east-1. Private subnets have no internet gateway. Public subnets route 0.0.0.0/0 to the managed gateway. You can add eu-west-1 later; peering between regions is encrypted and billed per GB.\n\n' +
      'Security groups are stateful. An inbound allow on port 443 automatically allows the return traffic. Deny rules are not supported; omit a port to block it. The default group allows SSH from the workspace owner IP only.\n\n' +
      'PrivateLink exposes a Blobs endpoint inside the VPC so traffic never hits the public internet. Enable it per region. DNS for *.blob.lumencloud.example resolves to private IPs once PrivateLink is attached.',
    metadata: { topic: 'network', audience: 'engineer' },
  },
  {
    id: 'iam',
    title: 'IAM roles, API keys, and SSO',
    content:
      'LumenCloud IAM has three built-in roles: Viewer, Operator, and Owner. Viewers can read metrics and logs. Operators can create instances and buckets. Owners can change billing and IAM. Custom roles are available on Enterprise.\n\n' +
      'Personal API keys inherit the creator role and expire after 90 days. Rotate a key by creating a new one before deleting the old one. Service accounts are not tied to a person and do not expire. Store service tokens in the secrets manager, not in git.\n\n' +
      'Enterprise workspaces can enforce SAML 2.0 with Okta, Azure AD, or Google Workspace. After SSO is required, password login is disabled. SCIM syncs groups every 15 minutes. Lost MFA devices are reset by an Owner in the console.',
    metadata: { topic: 'security', audience: 'admin' },
  },
  {
    id: 'billing',
    title: 'Billing, credits, and invoices',
    content:
      'LumenCloud bills monthly on the UTC date the workspace was created. Usage is metered per hour for compute and per GB-month for Blobs. Egress is $0.09 per GB after the first 100 GB. Invoices email to billing admins as PDF on the first of each month.\n\n' +
      'New workspaces receive $200 in credits that expire after 60 days. Credits apply to compute and storage first, then egress. They do not apply to Marketplace images. Failed cards retry for seven days, then the workspace pauses. Data is kept for 30 days while paused.\n\n' +
      'Annual commit discounts are 18 percent if you prepay. Enterprise contracts can add a spend cap that stops new instances when the cap is hit. Tax IDs are added in Billing settings and appear on the next invoice.',
    metadata: { topic: 'finance', audience: 'admin' },
  },
  {
    id: 'support',
    title: 'Support plans and incident response',
    content:
      'Hobby and Team plans get email support Monday to Friday, 09:00-18:00 UTC, with a one-business-day target. Enterprise gets a shared Slack channel and a 15-minute first response on severity-1 incidents, 24/7.\n\n' +
      'Severity-1 means a complete region outage or data-loss event. Severity-2 is a degraded API with a workaround. Open a ticket in the console or email incidents@lumencloud.example. Do not post production secrets in Slack.\n\n' +
      'The status page is status.lumencloud.example. Subscribe to SMS for us-east-1 and eu-west-1 separately. Post-incident reports are published within five business days for severity-1 only.',
    metadata: { topic: 'support', audience: 'customer' },
  },
  {
    id: 'regions',
    title: 'Regions and data residency',
    content:
      'LumenCloud currently ships us-east-1 (Virginia), us-west-2 (Oregon), and eu-west-1 (Ireland). ap-southeast-1 (Singapore) is in private preview. Resources do not replicate across regions unless you enable it.\n\n' +
      'EU customers who need GDPR residency must create the workspace in eu-west-1. Support logs for EU workspaces stay in Ireland. Backups cannot be copied to the US. US workspaces may not move to the EU later; create a new workspace and migrate.\n\n' +
      'Object replication between us-east-1 and us-west-2 is asynchronous with a typical lag under two minutes. Cross-region replication to eu-west-1 is Enterprise only and billed as egress.',
    metadata: { topic: 'compliance', audience: 'admin' },
  },
  {
    id: 'cli',
    title: 'CLI install and first deploy',
    content:
      'Install the Lumen CLI with npm i -g @lumencloud/cli or brew install lumencloud. Run lumen login to store a token in ~/.lumen/credentials. The token is the same as a personal API key and expires in 90 days.\n\n' +
      'lumen init scaffolds a lumen.yaml with a nano instance, one Blobs bucket, and a health check on port 8080. lumen up creates the stack. lumen logs -f tails stdout. lumen down deletes compute but keeps the bucket unless you pass --purge-storage.\n\n' +
      'CI should use a service account, not a personal key. Set LUMEN_TOKEN in the pipeline. The CLI never prints the token after login. Use lumen whoami to confirm the role before deploying to production.',
    metadata: { topic: 'developers', audience: 'engineer' },
  },
  {
    id: 'limits',
    title: 'Rate limits and account quotas',
    content:
      'The LumenCloud API allows 600 requests per minute on Team and 2,000 on Enterprise. Burst is 2x for one second. 429 responses include Retry-After. Idempotency keys are required for POST /instances and are remembered for 24 hours.\n\n' +
      'Default quotas are 20 running instances, 50 buckets, and 5 VPCs per region. Raise them in the console; most increases are automatic under 100 instances. GPU instances require a support ticket and a billing history of 30 days.\n\n' +
      'Webhooks retry three times with exponential backoff. Failed deliveries older than 48 hours are dropped. Rotate webhook secrets from the console. Logs retain 14 days on Team and 90 days on Enterprise.',
    metadata: { topic: 'platform', audience: 'engineer' },
  },
  {
    id: 'security',
    title: 'Encryption, backups, and retention',
    content:
      'Data at rest is encrypted with AES-256. In transit, TLS 1.3 is required. Customer-managed keys (CMK) are Enterprise only and live in the region of the resource. Rotating a CMK re-encrypts new writes immediately; existing objects re-encrypt in the background for up to 24 hours.\n\n' +
      'Automated backups run daily at 03:00 UTC and are kept for 7 days on Team and 35 days on Enterprise. Point-in-time restore for databases has a one-second granularity inside the retention window. Restores create a new instance; they never overwrite the source.\n\n' +
      'Deleted instances stay in the recycle bin for 30 days. Owners can purge immediately. Audit logs are immutable and retained for 365 days on Enterprise. Workspace export is a zip of JSON plus Blobs inventory, not object bytes.',
    metadata: { topic: 'security', audience: 'admin' },
  },
];
