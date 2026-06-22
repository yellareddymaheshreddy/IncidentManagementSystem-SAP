sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/ComboBox",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/core/Item"
], function (Controller, MessageToast, MessageBox, Dialog, Button, Label, Input, ComboBox, SimpleForm, Item) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.SupportTeam", {
        onInit: function () {
            // Initialization
        },

        onAddTeam: function () {
            const oTable = this.byId("teamsTable");
            const oBinding = oTable.getBinding("items");

            // Define inputs for dialog
            const oIdInput = new Input({ placeholder: "e.g. TEAM004" });
            const oNameInput = new Input({ placeholder: "Team Name" });
            const oDescInput = new Input({ placeholder: "Description" });
            const oManagerCombo = new ComboBox({
                items: {
                    path: "adminService>/Users",
                    template: new Item({ key: "{adminService>ID}", text: "{adminService>name}" })
                },
                placeholder: "Select Manager..."
            });

            const oDialog = new Dialog({
                title: "Register New Support Team",
                type: "Message",
                content: [
                    new SimpleForm({
                        editable: true,
                        content: [
                            new Label({ text: "Team ID", required: true }),
                            oIdInput,
                            new Label({ text: "Name", required: true }),
                            oNameInput,
                            new Label({ text: "Description" }),
                            oDescInput,
                            new Label({ text: "Manager" }),
                            oManagerCombo
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Create",
                    type: "Emphasized",
                    press: async function () {
                        const sId = oIdInput.getValue();
                        const sName = oNameInput.getValue();
                        const sDesc = oDescInput.getValue();
                        const sManagerId = oManagerCombo.getSelectedKey();

                        if (!sId || sId.trim() === "") {
                            MessageBox.error("Please enter a Team ID");
                            return;
                        }
                        if (!sName || sName.trim() === "") {
                            MessageBox.error("Please enter a Team Name");
                            return;
                        }

                        this.getView().setBusy(true);
                        try {
                            oBinding.create({
                                ID: sId.trim().toUpperCase(),
                                name: sName,
                                description: sDesc,
                                manager_ID: sManagerId || null
                            });
                            MessageToast.show("Support team added locally. Click 'Save Changes' to persist.");
                            oDialog.close();
                        } catch (error) {
                            MessageBox.error("Failed to add support team: " + error.message);
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

        onDeleteTeam: function () {
            const oTable = this.byId("teamsTable");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Please select a support team to delete");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected support team?", {
                onClose: async function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this.getView().setBusy(true);
                        try {
                            const oContext = oSelectedItem.getBindingContext("adminService");
                            await oContext.delete();
                            MessageToast.show("Support team deleted successfully");
                        } catch (error) {
                            MessageBox.error("Failed to delete support team: " + error.message);
                        } finally {
                            this.getView().setBusy(false);
                        }
                    }
                }.bind(this)
            });
        },

        onSaveChanges: async function () {
            this.getView().setBusy(true);
            const oModel = this.getOwnerComponent().getModel("adminService");

            try {
                if (oModel.hasPendingChanges("teamUpdateGroup")) {
                    await oModel.submitBatch("teamUpdateGroup");
                    MessageToast.show("Support teams updated successfully");
                } else {
                    MessageToast.show("No changes to save");
                }
            } catch (error) {
                MessageBox.error("Failed to save changes: " + error.message);
            } finally {
                this.getView().setBusy(false);
            }
        }
    });
});
