const SELECT = require("@sap/cds/lib/ql/SELECT");

const BUSINESS_HOURS_START = 9; // 9 AM IST
const BUSINESS_HOURS_END = 18; // 6 PM IST
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function utcToIST(date) {
    return new Date(date.getTime() + IST_OFFSET_MS);
}

function istToUTC(date) {
    return new Date(date.getTime() - IST_OFFSET_MS);
}

// console.log("Current UTC time: ", new Date());
// console.log("Current IST time: ", utcToIST(new Date()));

function isBusinessDay(date) {
    const day = date.getDay();

    return day !== 0 && day !== 6;
}

function moveToNextBusinessDay(date) {

    const d = new Date(date);

    do {
        d.setDate(d.getDate() + 1);
    } while (!isBusinessDay(d));

    d.setHours(9, 0, 0, 0);

    return d;
}

function addBusinessHours(startDate, hoursToAdd) {

    let current = utcToIST(new Date(startDate)); // Convert to IST for calculations

    while (hoursToAdd > 0) {

        if (!isBusinessDay(current)) {
            current = moveToNextBusinessDay(current);
            continue;
        }

        const hour = current.getHours();

        if (hour < BUSINESS_HOURS_START) {
            current.setHours(BUSINESS_HOURS_START, 0, 0, 0);
        }

        if (hour >= BUSINESS_HOURS_END) {
            current = moveToNextBusinessDay(current);
            continue;
        }

        const endOfDay = new Date(current);
        endOfDay.setHours(BUSINESS_HOURS_END, 0, 0, 0);

        const availableHours =
            (endOfDay - current) / (1000 * 60 * 60);

        if (hoursToAdd <= availableHours) {

            current.setTime(
                current.getTime() +
                hoursToAdd * 60 * 60 * 1000
            );

            return istToUTC(current);
        }

        hoursToAdd -= availableHours;

        current = moveToNextBusinessDay(current);
    }

    return istToUTC(current);
}

function addHours(startDate, hoursToAdd) {

    const result = new Date(startDate);

    result.setTime(
        result.getTime() + (hoursToAdd * 60 * 60 * 1000)
    );

    return result;

}

async function calculateSlaDue(priority) {
    const slaConfig = await SELECT.one.from("incidentmanagement.SLAConfiguration").where({ priority: priority });
    if (slaConfig) {
        const now = new Date();
        let responseDueAt;
        let resolutionDueAt;

        if (slaConfig.businessHoursOnly) {
            console.log("calculating business hours")
            responseDueAt = new Date(addBusinessHours(now, slaConfig.responseTime)); // Calculate response due date
            resolutionDueAt = new Date(addBusinessHours(now, slaConfig.resolutionTime)); // Calculate resolution due date
        } else {
            console.log("adding hours (no business hours specified)")
            responseDueAt= new Date(addHours(now,slaConfig.responseTime))
            resolutionDueAt = new Date(addHours(now,slaConfig.resolutionTime))
        }

        return { responseDueAt, resolutionDueAt };
    }
    return null;
}

module.exports = {
    calculateSlaDue
};