sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/ComboBox",
    "sap/m/Select",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/core/Item"
], function (Controller, MessageToast, MessageBox, Dialog, Button, Label, Input, ComboBox, Select, List, StandardListItem, SimpleForm, Item) {
    "use strict";

    return Controller.extend("com.amista.incidentmanagement.incidentmanagement.controller.UserManagement", {
        onInit: function () {
            // Register for Role Changes to rebind table if role changes
            this.getOwnerComponent().getEventBus().subscribe("DefaultChannel", "RoleChanged", this.onRoleChanged, this);
        },

        onExit: function () {
            this.getOwnerComponent().getEventBus().unsubscribe("DefaultChannel", "RoleChanged", this.onRoleChanged, this);
        },

        onRoleChanged: function () {
            const oTable = this.byId("usersTable");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").refresh();
            }
        },

        onUserPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext("adminService");
            const sUserId = oContext.getProperty("ID");
            
            this.getOwnerComponent().getRouter().navTo("UserDetail", {
                userId: sUserId
            });
        },

        onAddUser: function () {
            const oTable = this.byId("usersTable");
            const oBinding = oTable.getBinding("items");

            const oNameInput = new Input({ placeholder: "Full Name" });
            const oEmailInput = new Input({ placeholder: "Email Address", type: "Email" });
            const oRoleSelect = new Select({
                items: [
                    new Item({ key: "User", text: "User / Employee" }),
                    new Item({ key: "Admin", text: "Administrator" })
                ]
            });
            const oTeamCombo = new ComboBox({
                items: {
                    path: "adminService>/SupportTeams",
                    template: new Item({ key: "{adminService>ID}", text: "{adminService>name}" })
                },
                placeholder: "Select Support Team..."
            });

            const oDialog = new Dialog({
                title: "Register New User",
                type: "Message",
                content: [
                    new SimpleForm({
                        editable: true,
                        content: [
                            new Label({ text: "Name", required: true }),
                            oNameInput,
                            new Label({ text: "Email Address", required: true }),
                            oEmailInput,
                            new Label({ text: "Role", required: true }),
                            oRoleSelect,
                            new Label({ text: "Support Team" }),
                            oTeamCombo
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Create",
                    type: "Emphasized",
                    press: async function () {
                        const sName = oNameInput.getValue();
                        const sEmail = oEmailInput.getValue();
                        const sRole = oRoleSelect.getSelectedKey();
                        const sTeamId = oTeamCombo.getSelectedKey();
                        if (!sName || sName.trim() === "") {
                            MessageBox.error("Please enter a User Name");
                            return;
                        }
                        if (!sEmail || sEmail.trim() === "") {
                            MessageBox.error("Please enter an Email Address");
                            return;
                        }

                        this.getView().setBusy(true);
                        try {
                            oBinding.create({
                                name: sName,
                                email: sEmail,
                                role: sRole,
                                supportTeam_ID: sTeamId || null
                            });
                            MessageToast.show("User added locally. Click 'Save Changes' to persist.");
                            oDialog.close();
                        } catch (error) {
                            MessageBox.error("Failed to add user: " + error.message);
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

        onDeleteUser: function () {
            const oTable = this.byId("usersTable");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Please select a user to delete");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected user?", {
                onClose: async function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this.getView().setBusy(true);
                        try {
                            const oContext = oSelectedItem.getBindingContext("adminService");
                            await oContext.delete();
                            MessageToast.show("User deleted successfully");
                        } catch (error) {
                            MessageBox.error("Failed to delete user: " + error.message);
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
                    MessageToast.show("Users updated successfully");
                } else {
                    MessageToast.show("No changes to save");
                }
            } catch (error) {
                MessageBox.error("Failed to save changes: " + error.message);
            } finally {
                this.getView().setBusy(false);
            }
        },

        onAssignIncident: function () {
            const oTable = this.byId("usersTable");
            const oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Please select a user to assign an incident to.");
                return;
            }

            const oUserContext = oSelectedItem.getBindingContext("adminService");
            const sUserId = oUserContext.getProperty("ID");
            const sUserName = oUserContext.getProperty("name");

            // Open incidents list dialog
            const oIncidentList = new List({
                mode: "SingleSelectMaster",
                items: {
                    path: "adminService>/Incidents",
                    parameters: {
                        $filter: "status ne 'Resolved' and status ne 'Closed'"
                    },
                    template: new StandardListItem({
                        title: "{adminService>title}",
                        description: "Status: {adminService>status} | Priority: {adminService>priority}",
                        type: "Active"
                    })
                }
            });

            const oDialog = new Dialog({
                title: "Assign Incident to " + sUserName,
                contentWidth: "400px",
                contentHeight: "450px",
                content: [oIncidentList],
                beginButton: new Button({
                    text: "Assign",
                    type: "Emphasized",
                    press: async function () {
                        const oSelectedIncidentItem = oIncidentList.getSelectedItem();
                        if (!oSelectedIncidentItem) {
                            MessageBox.warning("Please select an incident to assign.");
                            return;
                        }

                        const oIncidentContext = oSelectedIncidentItem.getBindingContext("adminService");
                        const oModel = this.getOwnerComponent().getModel("adminService");

                        this.getView().setBusy(true);
                        try {
                            oIncidentContext.setProperty("assignedTo_ID", sUserId);
                            // If status is New or Open, update it to Assigned
                            const sCurrentStatus = oIncidentContext.getProperty("status");
                            if (sCurrentStatus === "New" || sCurrentStatus === "Open") {
                                oIncidentContext.setProperty("status", "Assigned");
                            }

                            await oModel.submitBatch("$auto");
                            MessageToast.show("Incident successfully assigned to " + sUserName);
                            oDialog.close();
                        } catch (error) {
                            MessageBox.error("Failed to assign incident: " + error.message);
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
        }
    });
});
