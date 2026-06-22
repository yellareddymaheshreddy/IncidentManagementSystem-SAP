sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter"
], function (Controller,formatter) {
    "use strict";

    return Controller.extend(
        "com.amista.incidentmanagement.incidentmanagement.controller.IncidentDetail",
        {   formatter:formatter,

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
                const oHistory = sap.ui.core.routing.History.getInstance();
                const sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("RouteHome");
                }


            }

        }
    );

});

