
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend(
        "com.amista.incidentmanagement.incidentmanagement.controller.Dashboard",
        {

            async onInit() {

                await this.loadDashboardKPIs();
                await this.loadIncidentTrend();
                await this.loadSLABreachSummary();
                await this.loadPendingAlerts();
            },

            async loadDashboardKPIs() {

                const oModel =
                    this.getOwnerComponent()
                        .getModel("dashboardService");

                const oContext = oModel.bindContext(
                    "/getDashboardKPIs(...)"
                );

                await oContext.execute();

                const data = oContext.getBoundContext().getObject();

                const dashboardModel =
                    new JSONModel(data);

                this.getView().setModel(
                    dashboardModel,
                    "dashboard"
                );

            },

            async loadIncidentTrend() {

                const oModel =
                    this.getOwnerComponent()
                        .getModel("dashboardService");

                const oBinding =
                    oModel.bindList("/getIncidentTrend()");

                const contexts =
                    await oBinding.requestContexts();

                const data =
                    contexts.map(c => c.getObject());

                this.getView().setModel(
                    new JSONModel({
                        value: data
                    }),
                    "trend"
                );

            },

            async loadSLABreachSummary() {

                const oModel =
                    this.getOwnerComponent()
                        .getModel("dashboardService");

                const oBinding =
                    oModel.bindList("/getSLABreachSummary()");

                const contexts =
                    await oBinding.requestContexts();

                const data =
                    contexts.map(c => c.getObject());

                this.getView().setModel(
                    new JSONModel({
                        value: data
                    }),
                    "sla"
                );

            },

            async loadPendingAlerts() {
                const oModel =
                    this.getOwnerComponent()
                        .getModel("dashboardService");

                const oBinding =
                    oModel.bindList("/getPendingAlerts()");

                const contexts =
                    await oBinding.requestContexts();

                const data =
                    contexts.map(c => c.getObject());

                this.getView().setModel(
                    new JSONModel({
                        value: data
                    }),
                    "alerts"
                );
            }

        }
    );

});