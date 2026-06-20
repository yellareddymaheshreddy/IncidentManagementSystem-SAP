sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend(
        "com.amista.incidentmanagement.incidentmanagement.controller.CreateIncident",
        {

            onSave: async function () {

                try {

                    const oModel =
                        this.getView().getModel();

                    const oListBinding =
                        oModel.bindList("/Incidents");

                    const oContext =
                        oListBinding.create({

                            title:
                                this.byId("titleInput")
                                    .getValue(),

                            description:
                                this.byId("descriptionInput")
                                    .getValue(),

                            severity:
                                this.byId("severitySelect")
                                    .getSelectedKey(),

                            businessImpact:
                                this.byId("businessImpactInput")
                                    .getValue(),

                            affectedUsers:
                                Number(
                                    this.byId("affectedUsersInput")
                                        .getValue()
                                ),

                            customerImpact:
                                this.byId("customerImpactSwitch")
                                    .getState(),

                            system_ID:
                                this.byId("systemSelect")
                                    .getSelectedKey(),

                            reportedBy_ID:
                                this.getOwnerComponent().getModel("user").getProperty("/userId")

                        });

                    await oContext.created();

                    MessageToast.show(
                        "Incident Created Successfully"
                    );

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo("RouteHome");

                } catch (error) {

                    MessageBox.error(
                        error.message
                    );

                }

            },

            onCancel: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteHome");

            }

        }
    );

});