service DashboardService {

    function getDashboardKPIs() returns DashboardKPIs;

    function getIncidentTrend() returns many IncidentTrend;

    function getSLABreachSummary() returns many SLABreachSummary;

    function getPendingAlerts() returns many Alerts;
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