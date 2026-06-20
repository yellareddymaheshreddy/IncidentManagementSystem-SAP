using { incidentmanagement as db } from '../db/schema';

service EmployeeService {
    entity Incidents as projection on db.Incident; // expose only nessary fields to employee :TODO
    entity IncidentComments as projection on db.IncidentComments;
    @readonly
    entity Users as projection on db.User;
    // readonly access to support teams
    @readonly
    entity SupportTeam as projection on db.SupportTeam;
    @readonly
    entity Systems as projection on db.System;
    @readonly
    entity IncidentAlerts as projection on db.IncidentAlerts;
}