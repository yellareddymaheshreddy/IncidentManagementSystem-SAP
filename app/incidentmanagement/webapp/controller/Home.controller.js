sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend(
        "com.amista.incidentmanagement.incidentmanagement.controller.Home",
        {

            onInit: function () {

            },

            onCreateIncident: function () {
                console.log("Create Incident button pressed");
                const oRouter = this.getOwnerComponent().getRouter();

                oRouter.navTo("CreateIncident");

            },

            onIncidentPress: function (oEvent) {

                const oItem =
                    oEvent.getParameter("listItem");

                const oContext =
                    oItem.getBindingContext();

                const sIncidentId =
                    oContext.getProperty("ID");

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("IncidentDetail", {
                        incidentId: sIncidentId
                    });

            }

        }
    );

});