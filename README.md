# LionsFlow Control Plane

מערכת ניהול מרכזית ומאובטחת ל-GCP מבוססת Hub & Spoke עם Flowise AI.

## מבנה הפרויקט

```
lionsflow/
├── terraform/          # תשתית IaC
│   ├── hub/           # Hub: VPC, NCC Hub, Service Account
│   └── spoke/         # Spoke: Cloud Functions, NCC Spoke
├── functions/         # Cloud Functions (Node.js)
│   └── list-vms/     # דוגמה: שאילתת VMs
├── Flowise/          # אפליקציית Flowise (submodule)
│   ├── Dockerfile
│   ├── cloudbuild.yaml
│   └── custom-tools/ # כלים מותאמים ל-GCP
├── plan/             # תכנון ומעקב
│   └── plan.md       # תכנית פריסה מפורטת
└── diagrams/         # דיאגרמות

```

## הוראות הפעלה

ראה `plan/plan.md` להוראות מפורטות.

## ארכיטקטורה

- **Hub Project**: lionspace (Control Plane)
- **Spoke Project**: lionspace-spoke-prod
- **Region**: us-central1
- **Networking**: Private only (VPC + NCC)
- **Security**: IAM + IAP + Secret Manager

## סטטוס

בתהליך פריסה - ראה `plan/plan.md` למעקב מעודכן.
