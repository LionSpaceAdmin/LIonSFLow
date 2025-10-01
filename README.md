# LionsFlow - Flowise Control Plane for GCP

**Fork מותאם של Flowise עבור Google Cloud Platform** עם ארכיטקטורת Hub & Spoke לניהול פרויקטים מרובים.

## 📦 מה זה?

זוהי גרסה מותאמת של [Flowise](https://github.com/FlowiseAI/Flowise) שמוסיפה:
- ✅ כלים מותאמים ל-GCP (Custom Tools)
- ✅ אינטגרציה עם Cloud Functions
- ✅ ארכיטקטורת Hub & Spoke עם Network Connectivity Center
- ✅ פריסה ל-Cloud Run עם Terraform
- ✅ ביטול אימות מובנה (לשימוש פנימי)

## 🏗️ ארכיטקטורה

```
LionsFlow/
├── packages/          # Flowise original (ui, server, components)
├── terraform/         # 🔧 תשתית GCP (Hub & Spoke)
├── functions/         # 🔧 Cloud Functions (Node.js)
├── custom-tools/      # 🔧 כלים מותאמים ל-GCP
├── plan/             # 🔧 תכנון ופריסה
└── Dockerfile        # 🔧 מותאם ל-Cloud Run (2GB RAM, no auth)
```

### Hub & Spoke

- **Hub Project**: `lionspace` - Control Plane (Cloud Run + Flowise)
- **Spoke Projects**: פרויקטים מרובים עם Cloud Functions
- **Networking**: VPC + NCC (Private only)
- **Region**: `us-central1`

## 🚀 Quick Start - Development

ראה את הREADME המקורי של Flowise למטה להתקנה ופיתוח מקומי.

## ☁️ פריסה ל-GCP

```bash
# 1. הפעל terraform
cd terraform/hub
terraform apply -var="hub_project_id=lionspace"

cd ../spoke
terraform apply -var="hub_project_id=lionspace" \
  -var="spoke_project_id=YOUR_SPOKE_PROJECT"

# 2. פרוס ל-Cloud Run
cd ../..
gcloud builds submit . --config=cloudbuild.yaml --project=lionspace
```

## 📋 תיעוד נוסף

- **תכנית פריסה מלאה**: `plan/plan.md`
- **הוראות ל-Claude Code**: `CLAUDE.md`
- **Flowise המקורי**: README למטה

---

# Flowise - Original README

