# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LionsFlow Control Plane** - מערכת ניהול מרכזית ל-GCP מבוססת Hub & Spoke עם Flowise AI. מאפשרת ניהול ותשאול של פרויקטים מרובים מנקודת כניסה אחת מאובטחת.

### Environment
- **User**: admin@lionsofzion-official.org
- **Hub Project**: lionspace (folder: 172983073065)
- **Spoke Project**: lionspace-spoke-prod
- **Region**: us-central1

### Architecture Components
- **Hub**: Cloud Run (Flowise) + NCC Hub + VPC
- **Spoke**: Cloud Functions Gen2 + NCC Spoke
- **Networking**: VPC + Network Connectivity Center (private only)
- **Security**: IAM + IAP + Secret Manager

## Project Structure

```
lionsflow/
├── terraform/
│   ├── hub/              # Hub: VPC, NCC Hub, Service Account
│   │   ├── main.tf
│   │   └── variables.tf
│   └── spoke/            # Spoke: Cloud Function, NCC Spoke
│       ├── main.tf
│       └── variables.tf
├── functions/
│   └── list-vms/         # Node.js Cloud Function example
│       ├── index.js
│       └── package.json
├── plan/
│   ├── plan.md           # תכנית פריסה מפורטת (עברית)
│   └── progress-tracker.json
├── diagrams/             # HTML diagrams (מעקב התקדמות)
├── Dockerfile            # Multi-stage build for Flowise
└── cloudbuild.yaml       # CI/CD for Cloud Run deployment
```

## Common Commands

### Terraform

```bash
# Hub infrastructure
cd terraform/hub
terraform init
terraform plan -var="hub_project_id=lionspace"
terraform apply -var="hub_project_id=lionspace"

# Spoke infrastructure (requires zipped function source)
cd terraform/spoke
terraform init
terraform plan -var="hub_project_id=lionspace" \
  -var="spoke_project_id=lionspace-spoke-prod" \
  -var="function_source_path=../../functions/list-vms/source.zip"
terraform apply -var="hub_project_id=lionspace" \
  -var="spoke_project_id=lionspace-spoke-prod" \
  -var="function_source_path=../../functions/list-vms/source.zip"
```

### Cloud Function Preparation

```bash
cd functions/list-vms
npm install
zip -r source.zip .
```

### Cloud Build & Deployment

```bash
# Build and deploy Flowise to Cloud Run
gcloud builds submit . --config=cloudbuild.yaml --project=lionspace
```

### Verification & Debugging

```bash
# NCC Hub status
gcloud network-connectivity hubs describe main-control-hub \
  --global --project=lionspace

# NCC Spoke status (should be ACTIVE after acceptance)
gcloud network-connectivity spokes describe lionspace-spoke-prod-spoke \
  --global --project=lionspace-spoke-prod

# Cloud Run logs
gcloud run logs tail flowise-control-plane \
  --project=lionspace --region=us-central1

# Cloud Function logs
gcloud functions logs read list-vms-function \
  --project=lionspace-spoke-prod --region=us-central1 --gen2

# Verify IAM permissions
gcloud projects get-iam-policy lionspace-spoke-prod \
  --flatten="bindings[].members" \
  --filter="bindings.members:flowise-agent@lionspace.iam.gserviceaccount.com"

# Enable required APIs
gcloud services enable cloudresourcemanager.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com \
  run.googleapis.com vpcaccess.googleapis.com \
  networkconnectivity.googleapis.com compute.googleapis.com \
  iam.googleapis.com --project=lionspace
```

## Key Workflows

### Accept Spoke Connection (Hub-Spoke Handshake)

```bash
# Run from Hub project after Spoke is created
gcloud network-connectivity spokes accept lionspace-spoke-prod-spoke \
  --global --project=lionspace
```

### Grant Hub Service Account Access to Spoke

```bash
# Function invoker permission
gcloud functions add-iam-policy-binding list-vms-function \
  --project=lionspace-spoke-prod --region=us-central1 \
  --member="serviceAccount:flowise-agent@lionspace.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.invoker"

# Compute viewer permission
gcloud projects add-iam-policy-binding lionspace-spoke-prod \
  --member="serviceAccount:flowise-agent@lionspace.iam.gserviceaccount.com" \
  --role="roles/compute.viewer"
```

### Create VPC Access Connector (for Cloud Run)

```bash
gcloud compute networks vpc-access connectors create hub-connector \
  --project=lionspace --region=us-central1 \
  --network=hub-vpc --range=10.8.0.0/28
```

## Architecture Notes

### Hub & Spoke Model
- **Hub** מנהל את כל התקשורת המרכזית דרך NCC
- **Spokes** מחוברים לHub ומבצעים פעולות ספציפיות דרך Cloud Functions
- **All traffic is private** - אין חשיפה לאינטרנט הציבורי

### Service Account Flow
1. Cloud Run (Flowise) runs as `flowise-agent@lionspace.iam.gserviceaccount.com`
2. Service Account must have `cloudfunctions.invoker` on each Spoke function
3. Service Account must have minimal viewer permissions in each Spoke project

### Networking Flow
1. Cloud Run → VPC Access Connector → Hub VPC
2. Hub VPC → NCC Hub → NCC Spoke → Spoke VPC
3. Spoke VPC → Cloud Function (internal ingress only)

## Security Requirements

1. **Input Validation**: Always use Zod or similar for Cloud Function inputs
2. **IAM Least Privilege**: Service accounts get minimal required roles only
3. **IAP Protection**: Cloud Run must be protected by Identity-Aware Proxy
4. **Secret Manager**: Never hardcode credentials - use Secret Manager
5. **Internal-Only Functions**: Cloud Functions must use `ALLOW_INTERNAL_ONLY` ingress

## Known Issues & Blockers

### Organization Policy Constraint
- **Issue**: Cloud Build service account blocked by Org Policy
- **Workaround**: Deploy functions manually or request Org Policy exception
- **Error**: `constraints/iam.allowedPolicyMemberDomains`

### NCC Spoke State
- Spokes are created in `PENDING` state
- Must be explicitly accepted from Hub project → `ACTIVE`

## Critical Files

- **terraform/hub/main.tf**: Hub infrastructure (lines 18-21 = NCC Hub, 23-26 = Service Account)
- **terraform/spoke/main.tf**: Spoke infrastructure (lines 40-48 = NCC Spoke, 19-38 = Cloud Function)
- **functions/list-vms/index.js**: Example Cloud Function (lines 4-23 = HTTP handler with ADC auth)
- **cloudbuild.yaml**: CI/CD pipeline (lines 10-23 = Cloud Run deployment with VPC egress)
- **plan/plan.md**: Detailed Hebrew deployment guide with checklist

## Quick Reference

**Service Account**: `flowise-agent@lionspace.iam.gserviceaccount.com`
**NCC Hub**: `main-control-hub`
**Cloud Run Service**: `flowise-control-plane`
**VPC**: `hub-vpc` (10.0.1.0/24)
**VPC Connector**: `hub-connector` (10.8.0.0/28)
