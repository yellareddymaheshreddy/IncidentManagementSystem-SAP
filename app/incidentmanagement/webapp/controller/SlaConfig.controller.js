sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.SlaConfig", {
        onInit: function () {
            // Initialization if needed
        },

        onSaveChanges: async function () {
            this.getView().setBusy(true);
            const oModel = this.getOwnerComponent().getModel("adminService");

            try {
                // Submit changes for OData V4
                if (oModel.hasPendingChanges("slaUpdateGroup")) {
                    await oModel.submitBatch("slaUpdateGroup");
                    MessageToast.show("SLA configurations updated successfully");
                } else {
                    MessageToast.show("No changes to save");
                }
            } catch (error) {
                MessageBox.error("Failed to save SLA configurations: " + error.message);
            } finally {
                this.getView().setBusy(false);
            }
        }
    });
});
