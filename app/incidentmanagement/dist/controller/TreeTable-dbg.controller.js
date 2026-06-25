sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.TreeTable", {
        onInit: async function () {

            const oModel = this.getOwnerComponent().getModel("dashboardService");

            const oData = await oModel.bindContext(
                "/getIncidentTree()"
            ).requestObject();

            const oTreeModel = new sap.ui.model.json.JSONModel({
                incidents: oData.value
            });

            this.getView().setModel(
                oTreeModel,
                "tree"
            );
        }


    });
});