sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Core"
], function (Controller, JSONModel, Core) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.App", {
        onInit: function () {
            const oLayoutModel = new JSONModel({
                layout: "OneColumn"
            });
            this.getOwnerComponent().setModel(oLayoutModel, "layoutModel");
            // Setup global alerts count model
            const oAlertsCountModel = new JSONModel({
                count: 0
            });
            this.getOwnerComponent().setModel(oAlertsCountModel, "alertsCountModel");

            // Attach listener to wait until models are propagated to the view
            this.getView().attachModelContextChange(this._onModelContextChange, this);

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRouteMatched(this._onRouteMatched, this);

            // Refresh count every 30 seconds
            this._iIntervalId = setInterval(this._fetchAlertsCount.bind(this), 30000);

            
            const sTheme = localStorage.getItem("sap-ui-theme");
            if(sTheme === "sap_horizon_dark") {
                this.byId("themeSwitch").setState(true);
            }
        },_onRouteMatched: function (oEvent) {
            console.log("Route matched:", oEvent.getParameter("name"));
            const sRouteName = oEvent.getParameter("name");
            const oSideNavigation = this.byId("sideNavigation");
            
            // Adjust FCL layout based on route
            const oLayoutModel = this.getOwnerComponent().getModel("layoutModel");
            if (sRouteName === "IncidentDetail" || sRouteName === "CreateIncident"  || sRouteName === "Recomendations") {
                oLayoutModel.setProperty("/layout", "TwoColumnsBeginExpanded");
            } else {
                oLayoutModel.setProperty("/layout", "OneColumn");
            }

            if (oSideNavigation && sRouteName) {
                let sKey = sRouteName;
                if (sRouteName === "EmployeeWorkspace") {
                    sKey = "RouteHome";
                } else if (sRouteName === "AdminWorkspace") {
                    sKey = "Dashboard";
                } else if (sRouteName === "IncidentDetail" || sRouteName === "UserDetail") {
                    sKey = "RouteHome";
                }
                oSideNavigation.setSelectedKey(sKey);
            }
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

            onUserProfilePress: function () {
            const sUserId = this.getOwnerComponent().getModel("user").getProperty("/userId");
            this.getOwnerComponent().getRouter().navTo("UserDetail", {
                userId: sUserId
            });
        },
        onThemeSwitch: function (oEvent) {
            const bState = oEvent.getParameter("state");
            if (bState) {
                Core.applyTheme("sap_horizon_dark");
                localStorage.setItem("sap-ui-theme", "sap_horizon_dark");
            } else {
                Core.applyTheme("sap_horizon");
                localStorage.setItem("sap-ui-theme", "sap_horizon");
            }

        }
        });
    });