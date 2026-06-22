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

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.System", {
        onInit: function () {
            // Initialization
        },

        onAddSystem: function () {
            const oTable = this.byId("systemsTable");
            const oBinding = oTable.getBinding("items");

            // Define inputs for dialog
            const oIdInput = new Input({ placeholder: "e.g. SYS004" });
            const oNameInput = new Input({ placeholder: "System Name" });
            const oDescInput = new Input({ placeholder: "Description" });
            const oOwnerCombo = new ComboBox({
                items: {
                    path: "adminService>/Users",
                    template: new Item({ key: "{adminService>ID}", text: "{adminService>name}" })
                },
                placeholder: "Select Owner..."
            });

            const oDialog = new Dialog({
                title: "Register New System",
                type: "Message",
                content: [
                    new SimpleForm({
                        editable: true,
                        content: [
                            new Label({ text: "System ID", required: true }),
                            oIdInput,
                            new Label({ text: "Name", required: true }),
                            oNameInput,
                            new Label({ text: "Description" }),
                            oDescInput,
                            new Label({ text: "Owner" }),
                            oOwnerCombo
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
                        const sOwnerId = oOwnerCombo.getSelectedKey();

                        if (!sId || sId.trim() === "") {
                            MessageBox.error("Please enter a System ID");
                            return;
                        }
                        if (!sName || sName.trim() === "") {
                            MessageBox.error("Please enter a System Name");
                            return;
                        }

                        this.getView().setBusy(true);
                        try {
                            oBinding.create({
                                ID: sId.trim().toUpperCase(),
                                name: sName,
                                description: sDesc,
                                owner_ID: sOwnerId || null
                            });
                            MessageToast.show("System added locally. Click 'Save Changes' to persist.");
                            oDialog.close();
                        } catch (error) {
                            MessageBox.error("Failed to add system: " + error.message);
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

        onDeleteSystem: function () {
            const oTable = this.byId("systemsTable");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Please select a system to delete");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected system?", {
                onClose: async function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this.getView().setBusy(true);
                        try {
                            const oContext = oSelectedItem.getBindingContext("adminService");
                            await oContext.delete();
                            MessageToast.show("System deleted successfully");
                        } catch (error) {
                            MessageBox.error("Failed to delete system: " + error.message);
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
                if (oModel.hasPendingChanges()) {
                    await oModel.submitBatch("$auto");
                    MessageToast.show("Systems updated successfully");
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
