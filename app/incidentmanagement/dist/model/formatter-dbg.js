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
        }
    };
});