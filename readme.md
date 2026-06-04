# Incident Monitoring Dashboard

## Overview

The Incident Monitoring Dashboard is an enterprise application built using:

* SAP CAP (Node.js)
* SAP HANA Cloud
* SAPUI5 Freestyle
* OData V4

The application enables support teams to monitor, manage, prioritize, and resolve incidents across multiple enterprise systems.

---

## Project Structure

```text
app/        SAPUI5 Application
db/         CDS Data Model
srv/        CAP Services and Business Logic
docs/       Design Documents and Diagrams
```

---

## Documentation

For detailed project documentation, refer to:

* [Requirement Understanding & Solution Design](./docs/understanding.md)

---

## Architecture Diagram

![Architecture Diagram](./docs/architecture-diagram.png)

---

## Entity Relationship Diagram

![ERD Diagram](./docs/erd-diagram.png)

---

## Features

### Employee

* Create Incident
* View Own Incidents
* Add Comments
* Track Incident Status

### Admin

* View All Incidents
* Assign Support Teams
* Configure SLA
* Dashboard & Reporting
* Manage Systems

---

## Business Rules

* Dynamic Priority Calculation
* Duplicate Incident Detection
* Alert Noise Suppression
* Business Hour SLA Tracking

---

## Technology Stack

* SAP CAP Node.js
* SAP HANA Cloud
* SAPUI5 Freestyle
* OData V4

---

## Status

Design Phase
