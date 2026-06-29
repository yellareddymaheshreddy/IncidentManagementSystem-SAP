sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, DateFormat) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.Alerts", {

        onInit: function () {

        },

        onAssign: function (oEvent) {

            const oContext = oEvent.getSource().getBindingContext("dashboardService");

            const sIncidentId = oContext.getProperty("ID");

            this.getOwnerComponent()
                .getRouter()
                .navTo("IncidentDetail", {
                    incidentId: sIncidentId
                });

        },

        onOpenIncident: function (oEvent) {

            const oContext = oEvent.getSource().getBindingContext("dashboardService");

            const sIncidentId = oContext.getProperty("ID");

            this.getOwnerComponent()
                .getRouter()
                .navTo("IncidentDetail", {
                    incidentId: sIncidentId
                });

        },

        onRefresh: function () {

            this.getView()
                .getModel("dashboardService")
                .refresh();

        },



    });
});
