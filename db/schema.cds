namespace incidentmanagement;

using {
    cuid,
    managed
} from '@sap/cds/common';

type Severity       : String enum {
    Low;
    Medium;
    High;
    Critical
}

type UserRole       : String enum {
    User;
    Admin
}

type Priority       : String enum {
    P1;
    P2;
    P3;
    P4;
    P5;
}

type IncidentStatus : String enum {
    New;
    Open;
    Assigned;
    InProgress;
    Resolved;
    Closed
}

entity User : cuid, managed {
    name              : String(255);
    email             : String(255);
    role              : UserRole;
    assignedIncidents : Association to many Incident
                            on assignedIncidents.assignedTo = $self;
    supportTeam       : Association to SupportTeam;
    reportedIncidents : Association to many Incident
                            on reportedIncidents.reportedBy = $self;
}

entity SupportTeam : cuid, managed {
    name        : String(255);
    description : String(1000);
    manager     : Association to User;

    members     : Association to many User
                      on members.supportTeam = $self;
    incidents   : Association to many Incident
                      on incidents.supportTeam = $self;
}

entity System : cuid, managed {
    name        : String(255);
    description : String(1000);
    owner       : Association to User;

    incidents   : Association to many Incident
                      on incidents.system = $self;

}

entity SLAConfiguration : managed {
    key priority      : Priority;
    description       : String(1000);
    responseTime      : Integer; // in Hours
    resolutionTime    : Integer; // in Hours
    businessHoursOnly : Boolean;
    incidents         : Association to many Incident
                            on incidents.sla = $self;

}

entity Incident : cuid, managed {
    title            : String(255);
    description      : String(1000);
    status           : IncidentStatus default 'New';
    severity         : Severity;
    priority         : Priority;
    businessImpact   : String(255);
    affectedUsers    : Integer;
    customerImpact   : Boolean;
    isDuplicate      : Boolean default false;
    alertSent        : Boolean default false;

    resolutionDueAt  : Timestamp;
    responseDueAt    : Timestamp;
    resolvedAt       : Timestamp;
    respondedAt      : Timestamp;

    system           : Association to System;
    reportedBy       : Association to User;
    assignedTo       : Association to User;
    supportTeam      : Association to SupportTeam;
    sla              : Association to SLAConfiguration;
    masterIncident   : Association to Incident;

    dublicates       : Association to many Incident
                           on dublicates.masterIncident = $self;
    comments         : Composition of many IncidentComments
                           on comments.incident = $self;
    alerts           : Composition of many IncidentAlerts
                           on alerts.incident = $self;
}

entity IncidentComments : cuid, managed {
    incident : Association to Incident;
    comment  : String(1000);
    user     : Association to User;
}

entity IncidentAlerts : cuid, managed {
    incident : Association to Incident;
    message  : String(1000);
    status   : String(255);
}
