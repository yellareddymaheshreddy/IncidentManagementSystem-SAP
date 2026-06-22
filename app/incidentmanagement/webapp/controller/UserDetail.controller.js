sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Button"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox, Dialog, List, StandardListItem, Button) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.UserDetail", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("UserDetail").attachPatternMatched(this._onUserMatched, this);
        },

        _onUserMatched: function (oEvent) {
            const sUserId = oEvent.getParameter("arguments").userId;
            
            // Bind the view to the specific user in the admin model
            this.getView().bindElement({
                path: "adminService>/Users('" + sUserId + "')",
                parameters: {
                    $expand: "supportTeam,reportedIncidents,assignedIncidents"

                }
            });
        },

        onAssignIncident: function () {
            const oContext = this.getView().getBindingContext("adminService");
            if (!oContext) return;

            const sUserId = oContext.getProperty("ID");
            const sUserName = oContext.getProperty("name");

            // Open incidents list dialog
            const oIncidentList = new List({
                mode: "SingleSelectMaster",
                items: {
                    path: "adminService>/Incidents",
                    parameters: {
                        $filter: "status ne 'Resolved' and status ne 'Closed'"
                    },
                    template: new StandardListItem({
                        title: "{adminService>title}",
                        description: "Status: {adminService>status} | Priority: {adminService>priority}",
                        type: "Active"
                    })
                }
            });

            const oDialog = new Dialog({
                title: "Assign Incident to " + sUserName,
                contentWidth: "400px",
                contentHeight: "450px",
                content: [oIncidentList],
                beginButton: new Button({
                    text: "Assign",
                    type: "Emphasized",
                    press: async function () {
                        const oSelectedIncidentItem = oIncidentList.getSelectedItem();
                        if (!oSelectedIncidentItem) {
                            MessageBox.warning("Please select an incident to assign.");
                            return;
                        }

                        const oIncidentContext = oSelectedIncidentItem.getBindingContext("adminService");
                        const oModel = this.getOwnerComponent().getModel("adminService");

                        this.getView().setBusy(true);
                        try {
                            oIncidentContext.setProperty("assignedTo_ID", sUserId);
                            // If status is New or Open, update it to Assigned
                            const sCurrentStatus = oIncidentContext.getProperty("status");
                            if (sCurrentStatus === "New" || sCurrentStatus === "Open") {
                                oIncidentContext.setProperty("status", "Assigned");
                            }

                            await oModel.submitBatch("$auto");
                            MessageToast.show("Incident successfully assigned to " + sUserName);
                            
                            // Refresh assigned incidents table binding
                            const oAssignedTable = this.byId("assignedIncidentsTable");
                            if (oAssignedTable.getBinding("items")) {
                                oAssignedTable.getBinding("items").refresh();
                            }
                            
                            oDialog.close();
                        } catch (error) {
                            MessageBox.error("Failed to assign incident: " + error.message);
                        } finally {
                            this.getView().setBusy(false);
                        }
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });

            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        onIncidentPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext("adminService");
            const sIncidentId = oContext.getProperty("ID");
            
            this.getOwnerComponent().getRouter().navTo("IncidentDetail", {
                incidentId: sIncidentId
            });
        },

        onClose: function () {
            // const oLayoutModel = this.getOwnerComponent().getModel("layoutModel");
            // oLayoutModel.setProperty("/layout", "OneColumn");
            
            // Go back to the dashboard or home view depending on role
            const oUserModel = this.getOwnerComponent().getModel("user");
            if (oUserModel && oUserModel.getProperty("/isAdmin")) {
                this.getOwnerComponent().getRouter().navTo("RouteHome"); // Home is the incident list
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteHome");
            }
        }
    });
});
