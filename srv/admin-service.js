const SELECT = require("@sap/cds/lib/ql/SELECT");
const calculatePriority = require("../utils/priority-calculator");
const { getDublicateIncident } = require("../utils/dublicate-incident");
const { calculateSlaDue } = require("../utils/sla-calculator");


module.exports = (srv) => {

  srv.before("CREATE", "Incidents", async (req) => {
    console.log(req.user.id ,"user is this")
    
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

};