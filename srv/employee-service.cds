using { incidentmanagement as db } from '../db/schema';

service EmployeeService {

    entity Incidents as projection on db.Incident;
    entity IncidentComments as projection on db.IncidentComments;
}