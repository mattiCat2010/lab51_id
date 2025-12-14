import { Human } from '../models/human.js';

export async function updateUser(targetId, newUser, fields) {
    let response = {};

    try {
        const updatedUser = await Human.update(newUser, {
            where: {
                pubid: targetId,
            },
        },
            { fields: fields }
        )

        response = await Human.findOne({
            where: {
                pubid: targetId,
            }
        })
        return response;

    } catch (error) {
        response.error = error;
        console.log("An error occurred in the function updateUser (src/utils/updateUser.js):", error);
        return response.error;    
    }
}