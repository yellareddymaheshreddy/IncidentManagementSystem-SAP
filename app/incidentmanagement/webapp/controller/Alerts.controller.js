sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, DateFormat) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.Alerts", {

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Alerts").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._fetchAlerts();
        },

        onRefresh: function () {
            this._fetchAlerts();
        },

        _fetchAlerts: async function () {
            this.getView().setBusy(true);
            const oModel = this.getOwnerComponent().getModel("dashboardService");
            if (!oModel) {
                this.getView().setBusy(false);
                return;
            }

            try {
                const oBinding = oModel.bindList("/getPendingAlerts()");
                const contexts = await oBinding.requestContexts();
                const data = contexts.map(c => c.getObject());

                this.getView().setModel(new JSONModel({ value: data }), "alertsModel");

                // Also sync with the global badge count model
                const oAlertsCountModel = this.getOwnerComponent().getModel("alertsCountModel");
                if (oAlertsCountModel) {
                    oAlertsCountModel.setProperty("/count", data.length);
                }
            } catch (error) {
                console.error("Failed to load alerts list", error);
            } finally {
                this.getView().setBusy(false);
            }
        },

        onInvestigate: function (oEvent) {
            const oItem = oEvent.getSource().getParent();
            const oContext = oItem.getBindingContext("alertsModel");
            const sIncidentId = oContext.getProperty("incidentId");
            console.log("Investigate incident with ID:", sIncidentId);

            if (sIncidentId) {
                this.getOwnerComponent().getRouter().navTo("IncidentDetail", {
                    incidentId: sIncidentId
                });
            }
        },

        onBack: function () {
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteHome", {}, true);
            }
        },

        formatAlertTime: function (sDate) {
            if (!sDate) return "";
            const oDate = new Date(sDate);
            const oDateTimeInstance = DateFormat.getDateTimeInstance({ style: "medium" });
            return oDateTimeInstance.format(oDate);
        }

    });
});
