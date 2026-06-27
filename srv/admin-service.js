const SELECT = require("@sap/cds/lib/ql/SELECT");
const calculatePriority = require("./utils/priority-calculator.js");
const { getDublicateIncident } = require("./utils/dublicate-incident.js");
const { calculateSlaDue } = require("./utils/sla-calculator.js");
const { generateBusinessId } = require("./utils/generateId.js");


module.exports = (srv) => {

  srv.before("CREATE", "Incidents", async (req) => {
    console.log(req.user.id ,"user is this")
    //generate unique system ID for the incident
    req.data.incidentId = await generateBusinessId(req, "INCIDENT_SEQ", "INC");
    //duplicate check
    const masterIncident = await getDublicateIncident(req.data.system_ID);
    if (masterIncident) {
      req.data.isDuplicate = true;
      req.data.masterIncident_ID = masterIncident.ID;
      req.data.priority = masterIncident.priority;
      req.data.responseDueAt = masterIncident.responseDueAt;
      req.data.resolutionDueAt = masterIncident.resolutionDueAt;
      return;
    }
    console.log("No duplicate incident found. Proceeding with priority and SLA calculations.");
    // priority calculation and sla calculation only for non-duplicate incidents
    let priority = calculatePriority({
      severity: req.data.severity,
      businessImpact: req.data.businessImpact,
      affectedUsers: req.data.affectedUsers,
      customerImpact: req.data.customerImpact
    });

    req.data.priority = priority;
    req.data.sla_priority = priority;

    //calculate sla for response and resolution based on priority from the configuration
    const sla = await calculateSlaDue(priority);
    if (sla) {
      req.data.responseDueAt = sla.responseDueAt;
      req.data.resolutionDueAt = sla.resolutionDueAt;
    }

  });

  srv.before("CREATE", "Systems", async (req) => {
    req.data.systemId = await generateBusinessId(req, "SYSTEM_SEQ", "SYS");
  });

  srv.before("CREATE", "Users", async (req) => {
    req.data.userId = await generateBusinessId(req, "USER_SEQ", "USR");
  });

  srv.before("CREATE", "SupportTeams", async (req) => {
    req.data.teamId = await generateBusinessId(req, "TEAM_SEQ", "TM");
  });

  srv.before("CREATE", "SLAConfigurations", async (req) => {
    req.data.slaConfigId = await generateBusinessId(req, "SLA_SEQ", "SLA");
  });

  srv.before("UPDATE", "Incidents", async (req) => {
    const { status } = req.data;
    if (status === "Resolved") {
      req.data.resolvedAt = new Date().toISOString();
    } else if (status === "InProgress" || status === "Assigned") {
      const existing = await cds.tx(req).run(
        SELECT.one.from("incidentmanagement.Incident")
          .where({ ID: req.data.ID || req.params[0]?.ID })
      );
      if (existing && !existing.respondedAt) {
        req.data.respondedAt = new Date().toISOString();
      }
    }
  });


};