using {incidentmanagement as db} from '../db/schema';

@(requires:'Admin')
service AdminService {
    entity Incidents as projection on db.Incident;
    entity IncidentComments as projection on db.IncidentComments;
    entity Systems as projection on db.System;
    entity SLAConfigurations as projection on db.SLAConfiguration;
    entity SupportTeams as projection on db.SupportTeam;
    entity Users as projection on db.User;
}

