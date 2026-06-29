sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, DateFormat, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.IncidentList", {

        onInit: function () {
            const oViewModel = new JSONModel({
                tableTitle: "My Incidents"
            });
            this.getView().setModel(oViewModel, "view");
            this._bindTable();
        },
        onRefresh: function () {
            this._bindTable();
        },
        

        _bindTable: function () {

            const bIsAdmin = this.getOwnerComponent()
                .getModel("user")
                .getProperty("/isAdmin");
            if(bIsAdmin) {
                this.getView().getModel("view").setProperty("/tableTitle", "All Incidents");
            } else {
                this.getView().getModel("view").setProperty("/tableTitle", "My Incidents");
            }
            const oModel = bIsAdmin
                ? this.getOwnerComponent().getModel("adminService")
                : this.getOwnerComponent().getModel();

            this.getView().setModel(oModel);
        },

        onSearch: function () {
            this._applyFilters();
        },

        onFilterChange: function () {
            this._applyFilters();
        },

        onResetFilters: function () {
            this.byId("searchField").setValue("");
            this.byId("statusFilter").setSelectedKey("");
            this.byId("priorityFilter").setSelectedKey("");
            this._applyFilters();
        },

        _applyFilters: function () {
            const oTable = this.byId("incidentTable");
            const oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            const aFilters = [];

            // 1. Search Query
            const sQuery = this.byId("searchField").getValue();
            if (sQuery && sQuery.trim().length > 0) {
                const oSearchFilter = new Filter({
                    filters: [
                        new Filter("title", FilterOperator.Contains, sQuery),
                        new Filter("description", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                aFilters.push(oSearchFilter);
            }

            // 2. Status Filter
            const sStatus = this.byId("statusFilter").getSelectedKey();
            if (sStatus && sStatus !== "All") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }

            // 3. Priority Filter
            const sPriority = this.byId("priorityFilter").getSelectedKey();
            if (sPriority && sPriority !== "All") {
                aFilters.push(new Filter("priority", FilterOperator.EQ, sPriority));
            }

            oBinding.filter(aFilters);
        },

        onCreateIncident: function () {
            this.getOwnerComponent().getRouter().navTo("CreateIncident");
        },

        onSaveAssignments: function () {
            const oAdminModel = this.getOwnerComponent().getModel("admin");
            if (oAdminModel) {
                oAdminModel.submitBatch("$auto").then(function () {
                    MessageToast.show("Assignments saved successfully.");
                }, function (oError) {
                    MessageBox.error("Failed to save assignments: " + (oError.message || oError));
                });
            }
        },

        onIncidentPress: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const oContext = oItem.getBindingContext();
            const sIncidentId = oContext.getProperty("ID");
            console.log("Navigating to details of incident ID:", sIncidentId);

            this.getOwnerComponent().getRouter().navTo("IncidentDetail", {
                incidentId: sIncidentId,layout:"TwoColumnsMidExpanded"
            });
        },

        /* Formatters */

        formatIncidentId: function (sId) {
            if (!sId) return "";
            return "INC-" + sId.substring(0, 2).toUpperCase();
        },

        formatPriorityState: function (sPriority) {
            switch (sPriority) {
                case "P1":
                    return "Error";
                case "P2":
                    return "Error";
                case "P3":
                    return "Warning";
                case "P4":
                    return "Success";
                case "P5":
                    return "None";
                default:
                    return "None";
            }
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "New":
                    return "Information";
                case "Open":
                    return "Warning";
                case "Assigned":
                case "InProgress":
                    return "None";
                case "Resolved":
                    return "Success";
                case "Closed":
                    return "Success";
                default:
                    return "None";
            }
        },

        formatStatusIcon: function (sStatus) {
            switch (sStatus) {
                case "New":
                    return "sap-icon://circle-task-2";
                case "Open":
                    return "sap-icon://message-popup";
                case "Assigned":
                    return "sap-icon://user-settings";
                case "InProgress":
                    return "sap-icon://edit";
                case "Resolved":
                    return "sap-icon://accept";
                case "Closed":
                    return "sap-icon://decline";
                default:
                    return "";
            }
        },

        formatDate: function (sDate) {
            if (!sDate) return "";
            const oDate = new Date(sDate);
            const oDateTimeInstance = DateFormat.getDateTimeInstance({ style: "medium" });
            return oDateTimeInstance.format(oDate);
        }

    });
});