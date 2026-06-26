sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/amista/incidentmanagement/incidentmanagement/model/models",
    "sap/ui/core/Core"
], (UIComponent, models, Core) => {
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
            //theme set
            Core.applyTheme(localStorage.getItem("sap-ui-theme")||"sap_horizon");
               await this.loadCurrentUser()

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