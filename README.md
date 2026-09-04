
# WeatherApp
My first project, a weather app


# Azure WeatherApp Deployment

A cloud-hosted weather application deployed on an **Azure Ubuntu Virtual Machine** and served through **Nginx**. The project demonstrates practical Azure cloud administration, Linux server administration, networking, security, web-server configuration, and application deployment.

## Project Overview

The WeatherApp is a web application that retrieves weather information using the **Open-Meteo API** and presents the information through a web-based interface.

The application was deployed to an **Azure Virtual Machine running Ubuntu**, with **Nginx** configured as the web server and reverse-facing entry point for the application.

This project was built to gain practical experience administering Azure infrastructure and deploying a web application in a cloud environment.

## Architecture

```text
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │   Azure NSG     │
              │ Network Security│
              │     Rules       │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   Azure VM      │
              │ Ubuntu Linux    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │     Nginx       │
              │   Web Server    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   WeatherApp    │
              │ HTML/CSS/JS     │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Open-Meteo API │
              └─────────────────┘
```

## Azure Infrastructure

The project used the following Azure components:

* Azure Virtual Machine
* Ubuntu Linux
* Network Security Group (NSG)
* Public IP address
* Azure Virtual Network
* Azure CLI / Azure Cloud Shell
* Azure Network Watcher for connectivity troubleshooting

I have also practiced configuring Azure networking components including VNets, subnets, NSGs, VNet peering, Azure DNS, and Hub-and-Spoke network architectures.

## Technologies Used

| Technology            | Purpose                   |
| --------------------- | ------------------------- |
| Microsoft Azure       | Cloud infrastructure      |
| Azure Virtual Machine | Application hosting       |
| Ubuntu Linux          | Server operating system   |
| Nginx                 | Web server                |
| HTML                  | Application structure     |
| CSS                   | Application styling       |
| JavaScript            | Application functionality |
| Open-Meteo API        | Weather data              |
| Azure NSG             | Network traffic filtering |
| Azure CLI             | Azure resource management |
| Git                   | Version control           |
| GitHub                | Source-code repository    |

## Deployment

### 1. Azure Virtual Machine

An Ubuntu Virtual Machine was provisioned in Azure to host the WeatherApp.

The VM was administered through SSH and used as the Linux server for the application.

The project involved deploying the WeatherApp to an Azure VM and installing/configuring web services including Nginx.

### 2. Network Security Group

An Azure Network Security Group was used to control inbound and outbound network traffic to the VM.

The NSG rules were configured to allow required traffic while restricting unnecessary access.

This provided practical experience with Azure network security and port-based traffic control.

### 3. Linux Server Configuration

The Ubuntu server was configured to host the application.

Key administration tasks included:

* Connecting to the VM through SSH
* Updating the Linux system
* Managing application files
* Working with Linux directories and permissions
* Inspecting and filtering log files
* Installing and configuring Nginx
* Testing the Nginx configuration
* Troubleshooting application and connectivity issues

My Linux practice also includes viewing and filtering logs and running applications on Ubuntu servers.

### 4. Nginx Configuration

Nginx was installed and configured to serve the WeatherApp.

The application files were placed under:

```text
/var/www/weatherapp
```

A dedicated Nginx server configuration was created for the application.

The configuration was tested using:

```bash
sudo nginx -t
```

After confirming that the configuration was valid, Nginx was used to serve the application.

### 5. Weather API

The application communicates with the **Open-Meteo API** to retrieve weather information.

The frontend sends requests to the weather API and displays the returned weather information to the user.

## Troubleshooting

Several practical troubleshooting tasks were performed during the deployment.

### Nginx Configuration

The Nginx configuration was tested using:

```bash
sudo nginx -t
```

This helped verify that the configuration syntax was valid before applying changes.

### HTTP Connectivity

Local connectivity was tested from the Azure VM using:

```bash
curl http://localhost
```

This helped determine whether Nginx was responding correctly on the server.

### Azure Network Troubleshooting

Azure Network Watcher tools were used to investigate VM connectivity problems, including **IP flow verification** and connection troubleshooting.

These tools helped identify whether connectivity problems were related to network security rules or network configuration.

## Azure CLI Automation

I also created a Bash-based VM deployment script to automate Azure VM creation and reduce the time required to provision a new server.

The script uses Azure CLI commands to provision Azure resources and deploy an Ubuntu VM.

Example:

```bash
./create-vm.sh
```

This demonstrates practical experience with **Azure CLI and Bash automation**.

## Key Skills Demonstrated

### Azure Cloud Administration

* Azure Virtual Machines
* Azure Virtual Networks
* Network Security Groups
* Public IP addresses
* Azure Storage
* Azure Monitor
* Azure Network Watcher
* Azure CLI
* Azure Cost Management
* Azure DNS

### Networking

* VNet configuration
* Subnet configuration
* NSG configuration
* Network traffic filtering
* VNet peering
* Hub-and-Spoke networking
* VM connectivity troubleshooting

### Linux Administration

* Ubuntu server administration
* SSH
* File and directory management
* Linux permissions
* Log inspection
* Nginx installation and configuration
* Application deployment

### Automation

* Bash scripting
* Azure CLI
* Automated VM provisioning

## What I Learned

This project provided practical experience deploying and administering a cloud-hosted application rather than only working with Azure services theoretically.

Key learning outcomes included:

* Provisioning and administering Azure Virtual Machines
* Configuring network access using NSGs
* Deploying a web application to Ubuntu
* Configuring Nginx as a web server
* Troubleshooting Linux and Azure networking issues
* Using Azure Network Watcher to diagnose connectivity
* Automating Azure infrastructure deployment using Bash and Azure CLI
* Working with APIs from a cloud-hosted application

## Future Improvements

Potential improvements to the project include:

* Implement HTTPS using TLS/SSL
* Configure a custom domain
* Improve monitoring and alerting
* Automate deployment using CI/CD
* Implement infrastructure as code using Bicep
* Add stronger network segmentation
* Improve application logging
* Add automated deployment and rollback procedures

## Author

**Ibelo Precious Daberechukwu**

Aspiring **Azure Cloud Administrator** focused on Azure infrastructure, networking, security, Linux administration, monitoring, and cloud automation.

