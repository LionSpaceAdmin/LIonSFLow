# מדריך הקמה (מקצה לקצה): Flowise Control Plane לסביבת Production

**מטרה:** הקמת מערכת ניהול מרכזית, מאובטחת ומוכנה לייצור על גבי Google Cloud, המאפשרת תשאול וניהול של פרויקטים מרובים באמצעות ממשק שיחה של Flowise.

---

## שלב 0: הכנות מקדימות (Prerequisites)

שלב זה מבטיח שכל התנאים המקדימים מתקיימים לפני תחילת העבודה.

- [ ] **1. ודא קיום חשבון Google Cloud עם הרשאות וחיוב:**
  - [ ] ודא שיש לך גישה לחשבון Google Cloud עם הרשאה ליצור פרויקטים ולקשר אותם לחיוב (`Project Creator`, `Billing Account User/Admin`).

- [ ] **2. התקן את כל הכלים הנדרשים בסביבה המקומית:**
  - [ ] **Google Cloud SDK:** התקן את `gcloud` לפי [ההוראות הרשמיות](https://cloud.google.com/sdk/docs/install).
  - [ ] **Terraform:** התקן גרסה 1.0 ומעלה לפי [ההוראות הרשמיות](https://learn.hashicorp.com/tutorials/terraform/install-cli).
  - [ ] **Git:** התקן את Git.
  - [ ] **Docker Desktop:** התקן את Docker.
  - [ ] **Node.js ו-npm:** התקן גרסה 18 ומעלה.

- [ ] **3. בצע אימות וקונפיגורציה ראשונית:**
  - [ ] **התחבר לחשבון Google שלך:**
    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```
  - [ ] **הגדר את Docker לעבוד מול Google Cloud:**
    ```bash
    gcloud auth configure-docker us-central1-docker.pkg.dev
    ```

---

## שלב 1: מבנה הפרויקט ומקור הריפו המלא

- [ ] **1. צור את מבנה התיקיות והקבצים הבא בפרויקט המקומי שלך:**
    ```text
    flowise-control-plane/
    ├── terraform/
    │   ├── hub/
    │   │   ├── main.tf
    │   │   └── variables.tf
    │   └── spoke/
    │       ├── main.tf
    │       └── variables.tf
    ├── functions/
    │   └── list-vms/
    │       ├── index.js
    │       └── package.json
    ├── cloudbuild.yaml
    └── Dockerfile
    ```

- [ ] **2. מלא את כל הקבצים בתוכן המלא (העתק-הדבק):**

    <details>
    <summary>📄 terraform/hub/main.tf</summary>

    ```terraform
    provider "google" {
      project = var.hub_project_id
      region  = var.region
    }

    resource "google_compute_network" "hub_vpc" {
      name                    = "hub-vpc"
      auto_create_subnetworks = false
    }

    resource "google_compute_subnetwork" "hub_subnet" {
      name          = "hub-subnet"
      ip_cidr_range = "10.0.1.0/24"
      network       = google_compute_network.hub_vpc.id
      region        = var.region
    }

    resource "google_network_connectivity_hub" "main_hub" {
      name        = "main-control-hub"
      description = "Central Hub for the Flowise Control Plane"
    }

    resource "google_iam_service_account" "flowise_agent" {
      account_id   = "flowise-agent"
      display_name = "Flowise Control Plane Agent"
    }
    ```
    </details>

    <details>
    <summary>📄 terraform/hub/variables.tf</summary>

    ```terraform
    variable "hub_project_id" { type = string }
    variable "region" { type = string; default = "us-central1" }
    ```
    </details>

    <details>
    <summary>📄 terraform/spoke/main.tf</summary>

    ```terraform
    provider "google" {
      project = var.spoke_project_id
      region  = var.region
    }

    resource "google_storage_bucket" "function_source_bucket" {
      name          = "${var.spoke_project_id}-function-source"
      location      = var.region
      force_destroy = true
    }

    resource "google_storage_bucket_object" "archive" {
      name   = "source.zip"
      bucket = google_storage_bucket.function_source_bucket.name
      source = var.function_source_path
    }

    resource "google_cloudfunctions2_function" "list_vms_function" {
      name     = "list-vms-function"
      location = var.region
      
      build_config {
        runtime     = "nodejs18"
        entry_point = "listVMs"
        source { storage_source { bucket = google_storage_bucket.function_source_bucket.name; object = google_storage_bucket_object.archive.name } }
      }

      service_config {
        max_instance_count = 1
        ingress_settings   = "ALLOW_INTERNAL_ONLY"
      }
    }

    resource "google_network_connectivity_spoke" "spoke_connection" {
      name     = "${var.spoke_project_id}-spoke"
      location = "global"
      hub      = "projects/${var.hub_project_id}/locations/global/hubs/main-control-hub"
      
      linked_vpc_network {
        uri = "projects/${var.spoke_project_id}/global/networks/default"
      }
    }
    ```
    </details>

    <details>
    <summary>📄 terraform/spoke/variables.tf</summary>

    ```terraform
    variable "spoke_project_id" { type = string }
    variable "hub_project_id" { type = string }
    variable "region" { type = string; default = "us-central1" }
    variable "function_source_path" { type = string }
    ```
    </details>

    <details>
    <summary>📄 functions/list-vms/index.js</summary>

    ```javascript
    const {InstancesClient} = require('@google-cloud/compute').v1;
    const functions = require('@google-cloud/functions-framework');

    functions.http('listVMs', async (req, res) => {
      try {
        const computeClient = new InstancesClient();
        const projectId = await computeClient.getProjectId();
        
        const vms = [];
        const iterable = computeClient.aggregatedListAsync({ project: projectId });

        for await (const [zone, instancesObject] of iterable) {
          if (instancesObject.instances) {
            vms.push(...instancesObject.instances.map(i => ({ name: i.name, zone: zone.split('/').pop(), status: i.status })));
          }
        }
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).send(vms);
      } catch (err) {
        console.error('ERROR:', err);
        res.status(500).send({ error: 'Failed to list VMs', details: err.message });
      }
    });
    ```
    </details>
    
    <details>
    <summary>📄 functions/list-vms/package.json</summary>

    ```json
    {
      "name": "list-vms-function",
      "version": "1.0.0",
      "main": "index.js",
      "dependencies": {
        "@google-cloud/compute": "^4.0.0",
        "@google-cloud/functions-framework": "^3.0.0"
      }
    }
    ```
    </details>

    <details>
    <summary>📄 Dockerfile</summary>

    ```Dockerfile
    # שלב 1: בניית התלויות
    FROM node:18-alpine AS deps
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install --frozen-lockfile

    # שלב 2: בניית קוד המקור
    FROM node:18-alpine AS builder
    WORKDIR /usr/src/app
    COPY --from=deps /usr/src/app/node_modules ./node_modules
    COPY . .
    RUN npm run build

    # שלב 3: הפעלה בסביבת Production
    FROM node:18-alpine AS runner
    WORKDIR /usr/src/app
    ENV NODE_ENV=production
    COPY --from=builder /usr/src/app/node_modules ./node_modules
    COPY --from=builder /usr/src/app/packages ./packages
    COPY --from=builder /usr/src/app/components ./components
    
    EXPOSE 3000
    CMD ["node", "packages/server/dist/index.js"]
    ```
    </details>

    <details>
    <summary>📄 cloudbuild.yaml</summary>

    ```yaml
    steps:
    - name: 'gcr.io/cloud-builders/docker'
      id: 'Build'
      args: ['build', '-t', '${_REGION}-docker.pkg.dev/${PROJECT_ID}/flowise-repo/flowise-app:latest', '.']
    
    - name: 'gcr.io/cloud-builders/docker'
      id: 'Push'
      args: ['push', '${_REGION}-docker.pkg.dev/${PROJECT_ID}/flowise-repo/flowise-app:latest']

    - name: 'gcr.io/[google.com/cloudsdktool/cloud-sdk](https://google.com/cloudsdktool/cloud-sdk)'
      id: 'Deploy'
      entrypoint: 'gcloud'
      args:
        - 'run'
        - 'deploy'
        - 'flowise-control-plane'
        - '--image=${_REGION}-docker.pkg.dev/${PROJECT_ID}/flowise-repo/flowise-app:latest'
        - '--region=${_REGION}'
        - '--project=${PROJECT_ID}'
        - '--service-account=flowise-agent@${PROJECT_ID}.iam.gserviceaccount.com'
        - '--vpc-connector=hub-connector'
        - '--vpc-egress=all-traffic'
        - '--ingress=internal-and-cloud-load-balancing'
    
    substitutions:
      _REGION: 'us-central1'
    ```
    </details>

---

## שלב 2: הקמת יסודות ב-GCP

- [ ] **1. צור את הפרויקטים ב-GCP:**
    ```bash
    # שים לב: פרויקט lionspace כבר קיים ומשויך לתיקייה 172983073065
    # צור פרויקט Spoke נוסף תחת אותה תיקייה
    gcloud projects create lionspace-spoke-prod --name="Lionspace Spoke Project" --folder=172983073065
    ```

- [ ] **2. קשר את הפרויקטים לחשבון החיוב:**
    ```bash
    # מצא את ה-Billing Account ID שלך
    gcloud beta billing accounts list

    # ודא שפרויקט lionspace מקושר לחיוב (אמור להיות כבר מקושר)
    gcloud beta billing projects describe lionspace

    # קשר את פרויקט ה-Spoke החדש
    gcloud beta billing projects link lionspace-spoke-prod --billing-account [YOUR_BILLING_ACCOUNT_ID]
    ```

- [ ] **3. הפעל את כל ה-APIs הנדרשים:**
    ```bash
    # הפעלה עבור פרויקט ה-Hub (lionspace)
    gcloud services enable cloudresourcemanager.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com vpcaccess.googleapis.com networkconnectivity.googleapis.com compute.googleapis.com iam.googleapis.com iap.googleapis.com --project=lionspace

    # הפעלה עבור פרויקט ה-Spoke
    gcloud services enable cloudresourcemanager.googleapis.com cloudbuild.googleapis.com cloudfunctions.googleapis.com networkconnectivity.googleapis.com compute.googleapis.com iam.googleapis.com --project=lionspace-spoke-prod
    ```

---

## שלב 3: פריסת תשתית ה-Hub

- [ ] **1. הגדר והרץ את Terraform:**
    ```bash
    cd terraform/hub
    terraform init
    terraform apply -auto-approve -var="hub_project_id=lionspace"
    ```
- [ ] **2. ✅ אימות וולידציה:**
    ```bash
    # ודא שה-Hub נוצר
    gcloud network-connectivity hubs describe main-control-hub --global --project=lionspace

    # ודא שה-Service Account נוצר
    gcloud iam service-accounts describe flowise-agent@lionspace.iam.gserviceaccount.com --project=lionspace
    ```

---

## שלב 4: פריסת תשתית ה-Spoke

- [ ] **1. הכן את קוד ה-Cloud Function לאריזה:**
    ```bash
    cd ../../functions/list-vms
    npm install
    zip -r source.zip .
    ```

- [ ] **2. הגדר והרץ את Terraform:**
    ```bash
    cd ../../terraform/spoke
    terraform init
    terraform apply -auto-approve -var="hub_project_id=lionspace" -var="spoke_project_id=lionspace-spoke-prod" -var="function_source_path=../../functions/list-vms/source.zip"
    ```
- [ ] **3. ✅ אימות וולידציה:**
    ```bash
    # ודא שה-Spoke נוצר וממתין לאישור
    gcloud network-connectivity spokes describe lionspace-spoke-prod-spoke --global --project=lionspace-spoke-prod
    # חפש בשדה הפלט "state: PENDING"

    # ודא שהפונקציה נוצרה עם גישה פנימית
    gcloud functions describe list-vms-function --region=us-central1 --project=lionspace-spoke-prod --gen2
    # חפש בשדה הפלט "ingressSettings: ALLOW_INTERNAL_ONLY"
    ```

---

## שלב 5: חיבור רשת והרשאות (ה-"Handshake")

- [ ] **1. אשר את חיבור ה-Spoke (מפרויקט ה-Hub):**
    ```bash
    gcloud network-connectivity spokes accept lionspace-spoke-prod-spoke --global --project=lionspace
    ```

- [ ] **2. הענק הרשאות ל-Service Account של ה-Hub לפעול ב-Spoke:**
    ```bash
    # הרשאה להפעיל את ה-Cloud Function
    gcloud functions add-iam-policy-binding list-vms-function --project=lionspace-spoke-prod --region=us-central1 --member="serviceAccount:flowise-agent@lionspace.iam.gserviceaccount.com" --role="roles/cloudfunctions.invoker"

    # הרשאה לצפות במשאבי Compute
    gcloud projects add-iam-policy-binding lionspace-spoke-prod --member="serviceAccount:flowise-agent@lionspace.iam.gserviceaccount.com" --role="roles/compute.viewer"
    ```
- [ ] **3. ✅ אימות וולידציה:**
    ```bash
    # ודא שה-Spoke עבר למצב ACTIVE
    gcloud network-connectivity spokes describe lionspace-spoke-prod-spoke --global --project=lionspace-spoke-prod
    # חפש בשדה הפלט "state: ACTIVE"

    # ודא שההרשאות ניתנו כהלכה
    gcloud projects get-iam-policy lionspace-spoke-prod --format="json" | grep "flowise-agent@lionspace.iam.gserviceaccount.com"
    ```

---

## שלב 6: פריסת אפליקציית Flowise

- [ ] **1. שכפל את מאגר המקור של Flowise:**
    ```bash
    # חזור לתיקיית הבסיס של הפרויקט שלך
    cd ../..
    git clone [https://github.com/FlowiseAI/Flowise.git](https://github.com/FlowiseAI/Flowise.git)
    ```

- [ ] **2. העתק את ה-Dockerfile ו-cloudbuild.yaml לתוך תיקיית Flowise:**
    ```bash
    cp Dockerfile Flowise/
    cp cloudbuild.yaml Flowise/
    ```

- [ ] **3. צור VPC Access Connector:**
    ```bash
    gcloud compute networks vpc-access connectors create hub-connector --project=lionspace --region=us-central1 --network=hub-vpc --range=10.8.0.0/28
    ```

- [ ] **4. הפעל את תהליך ה-CI/CD ב-Cloud Build:**
    ```bash
    cd Flowise
    gcloud builds submit . --config=cloudbuild.yaml --project=lionspace
    ```
- [ ] **5. ✅ אימות וולידציה:**
    ```bash
    # קבל את כתובת ה-URL הפנימית של השירות
    gcloud run services describe flowise-control-plane --project=lionspace --region=us-central1 --format="value(status.url)"
    ```

---

## שלב 7: אבטחת גישה לממשק (IAP)

- [ ] **1. הגדר OAuth Consent Screen:**
    - ב-Cloud Console, בפרויקט ה-Hub, נווט ל-`APIs & Services > OAuth consent screen`.
    - בחר `Internal` ולחץ `Create`.
    - מלא את הפרטים הנדרשים (שם אפליקציה, אימייל תמיכה) ושמור.

- [ ] **2. צור OAuth Client ID:**
    - נווט ל-`APIs & Services > Credentials`.
    - לחץ `Create Credentials > OAuth client ID`.
    - בחר `Web application`, תן שם, ושמור. העתק את ה-Client ID וה-Client Secret שנוצרו.

- [ ] **3. הפעל את IAP על שירות ה-Cloud Run:**
    ```bash
    # הפקודה תהיה אינטראקטיבית ותבקש את ה-Client ID וה-Secret שיצרת
    gcloud run services update flowise-control-plane --project=lionspace --region=us-central1 --iap=enabled
    ```
- [ ] **4. הענק הרשאות גישה למשתמשים:**
    ```bash
    gcloud run services add-iam-policy-binding flowise-control-plane \
      --project=lionspace \
      --region=us-central1 \
      --member="user:admin@lionsofzion-official.org" \
      --role="roles/run.invoker"

    gcloud projects add-iam-policy-binding lionspace \
      --member="user:admin@lionsofzion-official.org" \
      --role="roles/iap.[https://www.googleapis.com/auth/userinfo.email](https://www.googleapis.com/auth/userinfo.email)"
    ```
- [ ] **5. ✅ אימות וולידציה:**
  - גש לכתובת ה-URL של שירות ה-Cloud Run. אתה אמור לעבור תהליך הזדהות של גוגל, ורק לאחר מכן לראות את ממשק Flowise.

---

## שלב 8: הגדרות סופיות ובדיקות

- [ ] **1. צור והגדר כלי מותאם אישית ב-Flowise:**
  - [ ] בממשק של Flowise, צור Chatflow חדש.
  - [ ] הוסף "Custom Tool" והדבק בו את קוד ה-JavaScript המתאים.
  - [ ] חבר את הכלי לסוכן (Agent) בזרימת השיחה.

- [ ] **2. בדוק את המערכת מקצה לקצה:**
  - [ ] ב-Chatflow, שאל את הסוכן: "הצג לי את כל המכונות בפרויקט `lionspace-spoke-prod`".
  - [ ] **✅ אימות וולידציה:** ודא שהסוכן עונה עם רשימת ה-VMs (אם קיימים) מהפרויקט. זה מאשר שהמערכת כולה עובדת כמצופה.

---

## שלב 9: ניטור, התראות והקשחת אבטחה (Production Hardening)

- [ ] **1. הגדר ניטור והתראות:**
  - [ ] ב-Cloud Monitoring, צור `Uptime Check` על כתובת ה-URL של שירות ה-Cloud Run.
  - [ ] צור `Alerting Policy` שתישלח אליך אימייל אם ה-Uptime Check נכשל.

- [ ] **2. צור מתחם VPC Service Controls:**
  - [ ] בפרויקט ה-Hub, נווט ל-`VPC Service Controls`.
  - [ ] צור `New Perimeter`.
  - [ ] הוסף את פרויקט ה-Hub ואת פרויקט ה-Spoke למתחם.
  - [ ] הגדר את השירותים המוגנים (Restricted Services) כך שיכללו את `Compute Engine API` ו-`Cloud Functions API`.

- [ ] **3. סקור והקשח את הרשאות ה-IAM:**
  - [ ] ודא שה-Service Account `flowise-agent` מחזיק רק בהרשאות המינימליות הנדרשות לפעולתו (`compute.viewer`, `cloudfunctions.invoker`).
  - [ ] הסר כל הרשאת `Owner` או `Editor` מיותרת מחשבונות שירות או משתמשים.