sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, formatter, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend(
        "com.amista.incidentmanagement.incidentmanagement.controller.IncidentDetail",
        {
            formatter: formatter,

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


            },

            onNavToMasterIncident: function () {
                const oContext = this.getView().getBindingContext();
                const sMasterId = oContext.getProperty("masterIncident/ID");

                if (sMasterId) {
                    this.getOwnerComponent().getRouter().navTo("IncidentDetail", {
                        incidentId: sMasterId
                    });
                }
            },

            async onAddComment() {

                const sComment =
                    this.byId("commentInput").getValue().trim();

                if (!sComment) {
                    sap.m.MessageToast.show("Enter a comment");
                    return;
                }

                const oModel = this.getView().getModel();

                const sIncidentId =
                    this.getView().getBindingContext().getProperty("ID");

                const sUserId =
                    this.getOwnerComponent()
                        .getModel("user")
                        .getProperty("/userId");

                const oBinding =
                    oModel.bindList("/IncidentComments");

                const oContext =
                    oBinding.create({

                        comment: sComment,

                        incident_ID: sIncidentId,

                        user_ID: sUserId

                    });

                await oContext.created();

                this.byId("commentInput").setValue("");

                this.getView().getBindingContext().refresh();

                sap.m.MessageToast.show(
                    "Comment Added Successfully"
                );

            },

            onReportedByPress: function () {

                const sUserId = this.getView()
                    .getBindingContext()
                    .getProperty("reportedBy/ID");

                if (!sUserId) {
                    return;
                }

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("UserDetail", {
                        userId: sUserId
                    });
            },

            onAssignedToPress: function () {

                const sUserId = this.getView()
                    .getBindingContext()
                    .getProperty("assignedTo/ID");

                if (!sUserId) {
                    return;
                }

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("UserDetail", {
                        userId: sUserId
                    });
            },
            onUserPress: function (oEvent) {

                const sUserId = oEvent.getSource().getTarget();

                if (!sUserId) {
                    return;
                }

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("UserDetail", {
                        userId: sUserId
                    });

            }


        }
    );

});