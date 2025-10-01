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

resource "google_service_account" "flowise_agent" {
  account_id   = "flowise-agent"
  display_name = "Flowise Control Plane Agent"
}
