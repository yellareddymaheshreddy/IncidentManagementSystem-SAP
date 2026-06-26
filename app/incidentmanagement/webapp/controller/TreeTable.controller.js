// controller/TreeTable.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter"
], function (Controller, History, Filter, FilterOperator, formatter) {
    "use strict";

    return Controller.extend(
        "com.amista.incidentmanagement.incidentmanagement.controller.TreeTable",
        {
            formatter: formatter,

            onInit:async function () {
                const oModel = this.getOwnerComponent().getModel("dashboardService");

            const oData = await oModel.bindContext(
                "/getIncidentTree()"
            ).requestObject();

            const oTreeModel = new sap.ui.model.json.JSONModel({
                incidents: oData.value
            });
            console.log("Tree model data:", oTreeModel.getData());
            this.getView().setModel(
                oTreeModel,
                "tree"
            );
                this._updateRowCount();
            },

            // ── Navigation ──────────────────────────────────────────────────

            onNavBack: function () {
                const sPreviousHash = History.getInstance().getPreviousHash();
                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getOwnerComponent().getRouter().navTo("RouteHome");
                }
            },

            onNavigateToDetail: function () {
                const oTable = this.byId("incidentTreeTable");
                const iIndex = oTable.getSelectedIndex();
                if (iIndex < 0) return;

                const oContext = oTable.getContextByIndex(iIndex);
                const sId = oContext.getProperty("ID");
                this._navToDetail(sId);
            },

            onTitleLinkPress: function (oEvent) {
                const oContext = oEvent.getSource().getBindingContext("tree");
                const sId = oContext.getProperty("ID");
                this._navToDetail(sId);
            },

            onCellClick: function (oEvent) {
                // Single click selects row and enables the Open button
                const oTable = this.byId("incidentTreeTable");
                const iIndex = oTable.getSelectedIndex();
                const bHasSelection = iIndex >= 0;

                this.byId("navigateBtn").setEnabled(bHasSelection);

                if (bHasSelection) {
                    const oContext = oTable.getContextByIndex(iIndex);
                    const sTitle = oContext.getProperty("title");
                    this.byId("selectionInfo").setText(
                        "Selected: " + (sTitle || "Untitled Incident")
                    );
                }
            },

            onRowSelectionChange: function (oEvent) {
                const iIndex = oEvent.getParameter("rowIndex");
                const bHasSelection = iIndex >= 0;
                this.byId("navigateBtn").setEnabled(bHasSelection);

                if (bHasSelection) {
                    const oTable = this.byId("incidentTreeTable");
                    const oContext = oTable.getContextByIndex(iIndex);
                    this.byId("selectionInfo").setText(
                        "Selected: " + (oContext.getProperty("title") || "Untitled")
                    );
                }
            },

            _navToDetail: function (sId) {
                console.log("Navigating to detail for incident ID:", sId);
                if (!sId) return;
                this.getOwnerComponent().getRouter().navTo("IncidentDetail", {
                    incidentId: sId
                });
            },

            // ── Search & Filter ─────────────────────────────────────────────

            onSearch: function () {
                this._applyFilters();
            },

            onFilterChange: function () {
                this._applyFilters();
            },

            _applyFilters: function () {
                const oTable    = this.byId("incidentTreeTable");
                const oBinding  = oTable.getBinding("rows");
                const sSearch   = this.byId("searchFieldd").getValue().trim();
                const sPriority = this.byId("priorityFilterd").getSelectedKey();
                const sStatus   = this.byId("statusFilterd").getSelectedKey();

                const aFilters = [];

                // Search filter — title OR description
                if (sSearch) {
                    aFilters.push(new Filter({
                        filters: [
                            new Filter("title",       FilterOperator.Contains, sSearch),
                            new Filter("description", FilterOperator.Contains, sSearch)
                        ],
                        and: false  // OR
                    }));
                }

                // Priority filter
                if (sPriority) {
                    aFilters.push(new Filter("priority", FilterOperator.EQ, sPriority));
                }

                // Status filter
                if (sStatus) {
                    aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
                }

                // Combine all with AND
                oBinding.filter(
                    aFilters.length > 0
                        ? new Filter({ filters: aFilters, and: true })
                        : []
                );

                this._updateRowCount();
            },

            // ── Expand / Collapse ────────────────────────────────────────────

            onExpandAll: function () {
                const oTable = this.byId("incidentTreeTable");
                oTable.expandToLevel(999);
            },

            onCollapseAll: function () {
                const oTable = this.byId("incidentTreeTable");
                oTable.collapseAll();
            },

            // ── Refresh ──────────────────────────────────────────────────────

            onRefresh: function () {
                const oTable = this.byId("incidentTreeTable");
                oTable.getBinding("rows").refresh();
                this._updateRowCount();
            },

            // ── Helpers ──────────────────────────────────────────────────────

            _updateRowCount: function () {
                const oTable   = this.byId("incidentTreeTable");
                const oBinding = oTable?.getBinding("rows");
                const iCount   = oBinding?.getLength() ?? 0;
                const oStatus  = this.byId("rowCountStatus");
                if (oStatus) {
                    oStatus.setText(iCount + " incident" + (iCount !== 1 ? "s" : ""));
                }
            }
        }
    );
});