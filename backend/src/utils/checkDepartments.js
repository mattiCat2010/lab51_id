export function checkDepartments(dpArr, authDpArr) {
    // Prepare authUser's department map for easy lookup: { 'name': level }
    const authDpMap = authDpArr.reduce((map, dpString) => {
        const cleanString = dpString.replace(/^'|'$/g, '');
        const [name, level] = cleanString.split(".");
        map[name] = Number(level);
        return map;
    }, {});

    for (const dpString of dpArr) {
        const [dpName, dpLv] = dpString.split(".");
        const newDpLevel = Number(dpLv);

        // Check 1: Does the authorized user manage this department?
        if (!authDpMap.hasOwnProperty(dpName)) {
            return { error: true, status: 401, message: `Unauthorized department: You do not manage ${dpName}.` };
        }

        const authUserDpLevel = authDpMap[dpName];

        if (
            newDpLevel > authUserDpLevel || // New user level is higher than auth user's level in that department
            authUserDpLevel < 3             // Auth user's level in this department is too low to assign users
        ) {
            return { error: true, status: 401, message: `Unauthorized level: Your level (${authUserDpLevel}) in ${dpName} is insufficient.` };
        }
    }

    return { error: false };
}