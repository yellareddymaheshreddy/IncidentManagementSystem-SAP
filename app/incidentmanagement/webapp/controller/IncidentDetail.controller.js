sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend(
        "com.amista.incidentmanagement.incidentmanagement.controller.IncidentDetail",
        {

            onInit: function () {

                const oRouter =
                    this.getOwnerComponent().getRouter();

                oRouter.getRoute("IncidentDetail")
                    .attachPatternMatched(
                        this._onObjectMatched,
                        this
                    );

            },

            _onObjectMatched: function (oEvent) {

                const sIncidentId =
                    oEvent.getParameter("arguments")
                        .incidentId;

                const sPath = "/Incidents('" + sIncidentId + "')";

                this.getView().bindElement({
                    path: sPath,
                    parameters: {
                        $expand: [
                            "reportedBy",
                            "assignedTo",
                            "comments($expand=user)",
                            "alerts",
                            "masterIncident"
                        ].join(",")
                    }
                });

            },

            onNavBack: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteHome");

            }

        }
    );

});