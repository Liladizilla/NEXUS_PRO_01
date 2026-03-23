# Odyseus Infrastructure - Terraform Configuration

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud Run Service for Odyseus Gateway
resource "google_cloud_run_service" "gateway" {
  name     = "odyseus-gateway"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/odyseus-gateway:latest"
        env {
          name  = "GEMINI_API_KEY"
          value = var.gemini_api_key
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Firestore Database for Task Persistence
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}
