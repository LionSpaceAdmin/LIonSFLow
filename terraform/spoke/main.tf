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
