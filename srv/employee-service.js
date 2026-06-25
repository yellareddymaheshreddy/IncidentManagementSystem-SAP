const SELECT = require("@sap/cds/lib/ql/SELECT");
const calculatePriority = require("./utils/priority-calculator.js");
const { getDublicateIncident } = require("./utils/dublicate-incident.js");
const { calculateSlaDue } = require("./utils/sla-calculator.js");
const { generateBusinessId } = require("./utils/generateId.js");



module.exports = (srv) => {

 
srv.before("READ", "Incidents", req => {
    let userId = req.user.id;

    if (userId === "anonymous") {
        userId = "df3bb831-2be3-4695-8995-3f9d37f6d30a";
    }

    req.query.where({
        reportedBy_ID: userId
    });
});

  srv.before("CREATE", "Incidents", async (req) => {
    console.log("=== CREATE INCIDENT ===");

    console.log("User:", req.user.id);

    console.log("Data:", req.data);
    console.log("complete user object:", req.user);
    // TODO: get user id and only show the incidents created by that user
    // req.data.reportedBy_ID = req.user.id;

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

  srv.before("UPDATE", "Incidents", async (req) => {
    console.log(req.data)
    if(req.data.assignedTo_ID && !req.data.status) {
      req.data.status = "Assigned";
    }
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

  srv.on("whoAmI", req => {

    console.log("User:", req.user.id);

    console.log("Roles:", [...req.user.roles]);

    return {
        user: req.user.id
    };

});

};