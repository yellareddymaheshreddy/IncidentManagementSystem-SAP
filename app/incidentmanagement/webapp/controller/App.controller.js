sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.App", {
        onInit: function () {
            // Setup global alerts count model
            const oAlertsCountModel = new JSONModel({
                count: 0
            });
            this.getOwnerComponent().setModel(oAlertsCountModel, "alertsCountModel");

            // Attach listener to wait until models are propagated to the view
            this.getView().attachModelContextChange(this._onModelContextChange, this);

            // Refresh count every 30 seconds
            this._iIntervalId = setInterval(this._fetchAlertsCount.bind(this), 30000);
        },

            onExit: function () {
                if (this._iIntervalId) {
                    clearInterval(this._iIntervalId);
                }
            },

            _onModelContextChange: function () {
                const oModel = this.getOwnerComponent().getModel("dashboardService");
                if (oModel && !this._bInitialAlertsFetched) {
                    this._bInitialAlertsFetched = true;
                    this._fetchAlertsCount();
                }
            },

            onSideNavigationToggleButtonPress: function () {
                const oToolPage = this.byId("toolPage");
                const bSideExpanded = oToolPage.getSideExpanded();
                
                oToolPage.setSideExpanded(!bSideExpanded);
            },

            onSideNavItemSelect: function (oEvent) {
                const sKey = oEvent.getParameter("item").getKey();
                const oRouter = this.getOwnerComponent().getRouter();
                
                oRouter.navTo(sKey);
            },

            onAlertsIconPress: function () {
                this.getOwnerComponent().getRouter().navTo("Alerts");
            },

            onRoleChange: function (oEvent) {
                const sRole = oEvent.getParameter("selectedItem").getKey();
                const oUserModel = this.getOwnerComponent().getModel("user");
                const sUsername = sRole === "Admin" ? "Admin" : "mahesh";
                const sDbUserId = sRole === "Admin" ? "USR003" : "USR001";
                const bIsAdmin = sRole === "Admin";

                oUserModel.setProperty("/role", sRole);
                oUserModel.setProperty("/username", sUsername);
                oUserModel.setProperty("/userId", sDbUserId);
                oUserModel.setProperty("/isAdmin", bIsAdmin);

                // Publish event so active views can run initialization if needed
                this.getOwnerComponent().getEventBus().publish("DefaultChannel", "RoleChanged", {
                    role: sRole,
                    username: sUsername,
                    isAdmin: bIsAdmin
                });
            },

            _fetchAlertsCount: async function () {
                const oModel = this.getOwnerComponent().getModel("dashboardService");
                if (!oModel) return;

                try {
                    const oBinding = oModel.bindList("/getPendingAlerts()");
                    const contexts = await oBinding.requestContexts();
                    const data = contexts.map(c => c.getObject());
                    const oAlertsCountModel = this.getOwnerComponent().getModel("alertsCountModel");
                    if (oAlertsCountModel) {
                        oAlertsCountModel.setProperty("/count", data.length);
                    }
                } catch (error) {
                    console.error("Failed to load alerts count", error);
                }
            },


        });
    });