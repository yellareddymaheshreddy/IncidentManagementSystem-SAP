sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/amista/incidentmanagement/incidentmanagement/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.amista.incidentmanagement.incidentmanagement.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        async init() {


            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            //    await this.loadCurrentUser()
            this.setModel(
                new sap.ui.model.json.JSONModel(
                    {isAdmin: false, userId: "df3bb831-2be3-4695-8995-3f9d37f6d30a", username: "mahesh", role: "User" , email:"mahesh@example.com"}
                ),
                "user"
            );

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();


        },
        async loadCurrentUser() {

            const oUserService =
                this.getModel("adminService");

            const oContext =
                oUserService.bindContext(
                    "/whoAmI(...)"
                );

            await oContext.execute();

            const userData =
                oContext.getBoundContext()
                    .getObject();

            console.log(
                "Current user data:",
                userData
            );

            this.setModel(
                new sap.ui.model.json.JSONModel(
                    userData
                ),
                "user"
            );

        }
    });
});