# LionsFlow Control Plane - Claude Code Context

## Project Overview
**LionsFlow Control Plane** is a centralized, secure, production-ready management system for multi-project GCP environments. It uses a conversational AI interface (Flowise) to enable administrators and DevOps teams to query and manage multiple Google Cloud projects from a single control point.

## Current Environment
- **User**: admin@lionsofzion-official.org
- **Hub Project**: lionspace (existing project, folder: 172983073065)
- **Spoke Project**: lionspace-spoke-prod (to be created under same folder)
- **Region**: us-central1

## Architecture: Hub & Spoke Model

### Hub (lionspace)
- Runs Flowise on Cloud Run
- Single secure entry point for all management
- Private network connectivity to all spokes
- Service Account: flowise-agent@lionspace.iam.gserviceaccount.com

### Spokes (e.g., lionspace-spoke-prod)
- Individual organizational projects
- Connected via Network Connectivity Center (NCC)
- Run Cloud Functions (2nd Gen) for specific operations
- Private communication only - no public exposure

### Network
- Google VPC with private subnets
- Network Connectivity Center (NCC) for Hub-Spoke backbone
- VPC Access Connector for Cloud Run → VPC communication
- All traffic stays internal

## Technology Stack

| Component | Technology |
|-----------|-----------|
| IaC | Terraform |
| Hub Compute | Cloud Run (serverless) |
| Spoke Compute | Cloud Functions Gen2 |
| Networking | VPC + NCC |
| AI/UI | Flowise |
| Container Registry | Artifact Registry |
| CI/CD | Cloud Build |
| Security | IAM + IAP |
| Secrets | Secret Manager |

## Security Principles (CRITICAL)

1. **Input Validation**: Always validate inputs to Cloud Functions (use Zod)
2. **IAP**: All UI access gated by Identity-Aware Proxy
3. **Least Privilege IAM**: Service accounts have minimal required permissions
4. **Input/Output Sanitization**: Prevent injection and XSS
5. **Secret Manager**: Never hardcode credentials
6. **VPC Service Controls**: Production perimeter protection
7. **Monitoring**: Alerts for unusual activity and budget overruns

## Project Structure
```
lionsflow/
├── terraform/
│   ├── hub/              # Hub infrastructure (VPC, Hub, Service Account)
│   │   ├── main.tf
│   │   └── variables.tf
│   └── spoke/            # Spoke infrastructure (Function, Spoke connection)
│       ├── main.tf
│       └── variables.tf
├── functions/
│   └── list-vms/         # Example Cloud Function
│       ├── index.js
│       └── package.json
├── plan/                 # Deployment plan & progress tracking
│   ├── plan.md           # Full deployment guide (Hebrew)
│   └── progress-tracker.json
├── MISSION.md            # Automated deployment mission for agents
├── CLAUDE.md             # This file - context for Claude Code
├── Dockerfile            # Flowise container
└── cloudbuild.yaml       # CI/CD configuration
```

## Common Operations

### Terraform Workflow
```bash
cd terraform/hub
terraform init
terraform plan -var="hub_project_id=lionspace"
terraform apply -var="hub_project_id=lionspace"
```

### Verification Commands
```bash
# Check NCC Hub status
gcloud network-connectivity hubs describe main-control-hub --global --project=lionspace

# Check Spoke status (should be ACTIVE)
gcloud network-connectivity spokes describe lionspace-spoke-prod-spoke --global --project=lionspace-spoke-prod

# Cloud Run logs
gcloud run logs tail flowise-control-plane --project=lionspace --region=us-central1

# Cloud Function logs
gcloud functions logs read list-vms-function --project=lionspace-spoke-prod --region=us-central1 --gen2

# Verify IAM permissions
gcloud projects get-iam-policy lionspace-spoke-prod \
  --flatten="bindings[].members" \
  --filter="bindings.members:flowise-agent@lionspace.iam.gserviceaccount.com"
```

### Cloud Build
```bash
gcloud builds submit . --config=cloudbuild.yaml --project=lionspace
```

## Deployment Phases

### Phase 0: Prerequisites
- Verify GCP account access (admin@lionsofzion-official.org)
- Install: gcloud, terraform, git, docker, node 18+
- Authenticate and configure gcloud
- Verify project lionspace exists in folder 172983073065

### Phase 1: Project Structure
- Create terraform/, functions/, orchestration/ directories
- Populate all Terraform configs, Cloud Function code, Dockerfile, cloudbuild.yaml

### Phase 2: GCP Foundations
- Create lionspace-spoke-prod project in folder 172983073065
- Link billing accounts
- Enable required APIs (compute, iam, networking, functions, run, etc.)

### Phase 3: Hub Infrastructure
- Deploy Hub VPC, subnet, NCC Hub
- Create flowise-agent service account
- Validate resources

### Phase 4: Spoke Infrastructure
- Package and deploy Cloud Function
- Deploy Spoke VPC connection to Hub
- Validate Spoke status (PENDING → ACTIVE after acceptance)

### Phase 5: Network & IAM
- Accept Spoke connection from Hub
- Grant IAM permissions (cloudfunctions.invoker, compute.viewer)
- Validate connectivity and permissions

### Phase 6: Flowise Deployment
- Clone Flowise repository
- Create VPC Access Connector
- Build and push Docker image
- Deploy to Cloud Run with service account and VPC egress

### Phase 7: Security (IAP)
- Configure OAuth Consent Screen
- Create OAuth Client ID
- Enable IAP on Cloud Run
- Grant IAP access to admin@lionsofzion-official.org

### Phase 8: Testing
- Configure Custom Tools in Flowise
- End-to-end test: Query VMs across projects
- Validate full workflow

### Phase 9: Production Hardening
- Set up monitoring and alerts
- Configure VPC Service Controls
- Audit and minimize IAM permissions

## Performance Optimization

### Cloud Run
- **Dev/Staging**: Scale to zero (cost saving)
- **Production**: min-instances=1 (eliminate cold starts)
- Set reasonable max-instances for cost control

### Cloud Functions
- Set min-instances=1 for frequently used functions
- Allocate sufficient memory (more CPU = faster execution)
- Initialize clients in global scope (reuse across invocations)

### Network
- Keep all resources in same region (us-central1)
- NCC provides high-bandwidth, low-latency backbone

## Debugging Checklist

1. **Cloud Run not responding**: Check logs with `gcloud run logs tail`
2. **Function errors**: Check function logs and IAM permissions
3. **IAM issues**: Verify service account has required roles in spoke
4. **Network issues**: Verify NCC Hub/Spoke are ACTIVE, check firewall rules
5. **IAP access denied**: Verify user has IAP-secured Web App User role

## Resources
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Network Connectivity Center](https://cloud.google.com/network-connectivity/docs/network-connectivity-center)
- [Terraform on GCP](https://cloud.google.com/docs/terraform)
- [Identity-Aware Proxy](https://cloud.google.com/iap/docs)
- [Flowise](https://flowiseai.com/)

## Agent Guidelines

When working on this project:

1. **Always use gcp-infrastructure-admin agent** for GCP infrastructure tasks
2. **Execute MISSION.md automatically** - follow all steps in sequence
3. **Validate each step** before proceeding to next
4. **Track progress** using progress-tracker.json
5. **Security first**: Never compromise on IAM, secrets, or network security
6. **Stop on errors**: If something fails, report to user immediately
7. **Manual steps**: For OAuth/IAP setup (step 7), stop and inform user

## Key Files to Reference
- **`MISSION.md`** - Complete automated deployment mission (START HERE)
- **`plan/plan.md`** - Detailed Hebrew deployment guide
- **`plan/progress-tracker.json`** - Progress tracking
- **`CLAUDE.md`** - This file (architecture & context)

## How to Start Deployment

User should open a new chat and type:
```
@gcp-infrastructure-admin @MISSION.md תתחיל לבצע את המשימה הזו שלב אחרי שלב
```