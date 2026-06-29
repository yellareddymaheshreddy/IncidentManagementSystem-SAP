@requires:'authenticated-user'
service DashboardService {
    function getDashboardKPIs()         returns DashboardKPIs;
    function getIncidentTrend()         returns many IncidentTrend;
    function getSLABreachSummary()      returns many SLABreachSummary;
    function getPendingAlerts()         returns many Alerts;
    function getIncidentStatusSummary() returns many IncidentStatusSummary;
    function getIncidentTree()       returns many Incident;
    function getChartData() returns many IncidentTrend;
    function getOpenIncidents() returns many Incident;
}

type DashboardKPIs {
    totalIncidents    : Integer;
    openIncidents     : Integer;
    criticalIncidents : Integer;
    slaBreaches       : Integer;
}

type IncidentTrend {
    date          : Date;
    incidentCount : Integer;
}

type SLABreachSummary {
    priority    : String;
    breachCount : Integer;
}

type Alerts {
    id          : UUID;
    title       : String;
    description : String;
    severity    : String;
    createdAt   : DateTime;
}

type IncidentStatusSummary {
    status : String;
    count  : Integer;
}

type Incident{
    id          : UUID;
    title       : String;
    description : String;
    status      : String;
    severity    : String;
    priority    : String;
    createdAt   : DateTime;
}