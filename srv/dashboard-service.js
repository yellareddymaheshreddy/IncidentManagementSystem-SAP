const cds = require('@sap/cds');

module.exports = (srv) => {

    srv.on('getDashboardKPIs', async (req) => {

        const tx = cds.tx(req);
        const Incident = 'incidentmanagement.Incident';

        const totalIncidents = await tx.run(
            SELECT.one
                .from(Incident)
                .columns('count(*) as count')
        );

        const openIncidents = await tx.run(
            SELECT.one
                .from(Incident)
                .where({
                    status: { '!=': 'Resolved' }
                })
                .columns('count(*) as count')
        );

        const criticalIncidents = await tx.run(
            SELECT.one
                .from(Incident)
                .where({
                    severity: 'Critical'
                })
                .columns('count(*) as count')
        );

        const slaBreaches = await tx.run(
            SELECT.one
                .from(Incident)
                .where(`
                    status <> 'Resolved'
                    and resolutionDueAt < CURRENT_TIMESTAMP
                `)
                .columns('count(*) as count')
        );

        return {
            totalIncidents: totalIncidents.count || 0,
            openIncidents: openIncidents.count || 0,
            criticalIncidents: criticalIncidents.count || 0,
            slaBreaches: slaBreaches.count || 0
        };
    });

    srv.on('getIncidentTrend', async (req) => {

        const tx = cds.tx(req);

        return await tx.run(`
            SELECT
                CAST(createdAt AS DATE) AS date,
                COUNT(*) AS incidentCount
            FROM incidentmanagement_Incident
            GROUP BY CAST(createdAt AS DATE)
            ORDER BY date
        `);
    });

    srv.on('getSLABreachSummary', async (req) => {

        const tx = cds.tx(req);

        return await tx.run(`
            SELECT
                priority,
                COUNT(*) AS breachCount
            FROM incidentmanagement_Incident
            WHERE resolutionDueAt < CURRENT_TIMESTAMP
            GROUP BY priority
        `);
    });


    srv.on('getPendingAlerts', async (req) => {

    const tx = cds.tx(req);

    const incidents = await tx.run(
        SELECT.from('incidentmanagement.Incident')
            .where({
                // severity: 'Critical',
                priority: 'P2',
                status: { '!=': 'Resolved' },
                // alertSent: false TODO
            })
    );

    const now = new Date();

    return incidents
        .filter(i => {

            const ageMinutes =
            (now - new Date(i.createdAt))
            / (1000 * 60);
            return ageMinutes >= 15;
        })
        .map(i => ({
            incidentId: i.ID,
            title: i.title,
            priority: i.priority,
            severity: i.severity,
            createdAt: i.createdAt,
            ageMinutes: Math.floor(
                (now - new Date(i.createdAt))
                / (1000 * 60)
            )
        }));

        

});
    srv.on('getIncidentStatusSummary', async (req) => {
        const tx = cds.tx(req);
        const username = req.headers["x-mock-user"] || (req.user ? req.user.id : "admin");
        const whereClause = username !== "admin" ? "WHERE reportedBy_ID = 'df3bb831-2be3-4695-8995-3f9d37f6d30a'" : "";

        return await tx.run(`
            SELECT
                status,
                COUNT(*) AS count
            FROM incidentmanagement_Incident
            ${whereClause}
            GROUP BY status
        `);
    });

  srv.on("getIncidentTree", async (req) => {

    const tx = cds.tx(req);

    return await tx.run(
        SELECT.from("incidentmanagement.Incident")
            .where({
                masterIncident_ID: null
            })
            .columns(
                '*',
                {
                    ref: ['dublicates'],
                    expand: ['*']
                }
            )
    );

});
};