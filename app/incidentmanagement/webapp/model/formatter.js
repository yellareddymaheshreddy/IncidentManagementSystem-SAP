sap.ui.define([], function () {
    "use strict";

    return {

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "New": return "Information";
                case "Open": return "Warning";
                case "Assigned": return "Indication03";
                case "InProgress": return "Indication04";
                case "Resolved": return "Success";
                case "Closed": return "Success";
                default: return "None";
            }
        },

        formatPriorityState: function (sPriority) {
            switch (sPriority) {
                case "P1": return "Error";
                case "P2": return "Warning";
                case "P3": return "Information";
                default: return "Success";
            }
        },

        formatBoolean: function (bValue) {
            return bValue=="Yes" ? "Yes" : "No";
        },

        formatDateTime: function (sValue) {
            if (!sValue) {
                return "-";
            }

            return new Date(sValue).toLocaleString("en-IN");
        },
        // Add to existing formatter.js

formatStatusIcon: function (sStatus) {
    const icons = {
        "New":        "sap-icon://status-new",
        "Open":       "sap-icon://status-in-process",
        "Assigned":   "sap-icon://person-placeholder",
        "InProgress": "sap-icon://status-in-process",
        "resolved":   "sap-icon://status-completed",
        "closed":     "sap-icon://status-completed"
    };
    return icons[sStatus] || "sap-icon://status-inactive";
},

formatSeverityState: function (sSeverity) {
    const map = {
        "critical": "Error",
        "high":     "Warning",
        "medium":   "None",
        "low":      "Success"
    };
    return map[sSeverity?.toLowerCase()] || "None";
},

formatAffectedUsersState: function (nUsers) {
    if (!nUsers) return "None";
    if (nUsers > 1000) return "Error";
    if (nUsers > 100)  return "Warning";
    return "Success";
}
    };
});