variable "spoke_project_id" {
  type = string
}

variable "hub_project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "function_source_path" {
  type = string
}
