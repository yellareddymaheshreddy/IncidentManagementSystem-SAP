const SELECT = require("@sap/cds/lib/ql/SELECT");

getDublicateIncident = async (system_ID) => {
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

// const masterIncident = await SELECT.one.from("incidentmanagement.Incident").where({
    //   system_ID: req.data.system_ID,isDuplicate: false
    // })
    //   .and({
    //     status: {
    //       in: ["New", "Open", "Assigned", "InProgress"]
    //     }
    //   });