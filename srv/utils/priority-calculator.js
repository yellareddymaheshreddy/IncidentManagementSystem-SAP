function calculatePriority({
    severity,
    businessImpact,
    affectedUsers = 0,
    customerImpact = false
}) {
    console.log("Calculating priority with inputs:", {
        severity,
        businessImpact,
        affectedUsers,
        customerImpact
    });
    let score = 0;

    // Severity Weight
    switch (severity) {
        case "Critical":
            score += 6;
            break;

        case "High":
            score += 4;
            break;

        case "Medium":
            score += 2;
            break;

        case "Low":
            score += 1;
            break;
    }

    // Business Impact Weight
    if (businessImpact) {

        const impact = businessImpact.toLowerCase();

        if (
            impact.includes("production down") ||
            impact.includes("outage") ||
            impact.includes("revenue loss")
        ) {
            score += 4;
        }
        else if (
            impact.includes("major") ||
            impact.includes("critical")
        ) {
            score += 3;
        }
        else if (
            impact.includes("moderate")
        ) {
            score += 2;
        }
        else {
            score += 1;
        }
    }

    // Number of affected users
    if (affectedUsers >= 1000) {
        score += 4;
    }
    else if (affectedUsers >= 500) {
        score += 3;
    }
    else if (affectedUsers >= 100) {
        score += 2;
    }
    else if (affectedUsers >= 10) {
        score += 1;
    }

    // External Customer Impact
    if (customerImpact) {
        score += 3;
    }

    // Priority Mapping
    if (score >= 12) return "P1";
    if (score >= 9) return "P2";
    if (score >= 6) return "P3";
    if (score >= 3) return "P4";

    return "P5";
}

module.exports = calculatePriority;