const SELECT = require("@sap/cds/lib/ql/SELECT");

getDublicateIncident = async (system_ID) => {
  if(!system_ID) {
    throw new Error("system_ID is required");
  }
    const masterIncident = await SELECT.one.from("incidentmanagement.Incident").where({
        system_ID: system_ID,isDuplicate: false
      })
        .and({
          status: {
            in: ["New", "Open", "Assigned", "InProgress"]
          }
        });
    return masterIncident;
}

module.exports = {
    getDublicateIncident
}