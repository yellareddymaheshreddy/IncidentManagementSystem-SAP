using { incidentmanagement as db } from '../db/schema';

service EmployeeService {

    entity Incidents as projection on db.Incident; // expose only nessary fields to employee :TODO
    entity IncidentComments as projection on db.IncidentComments;
    entity Users as projection on db.User;
}