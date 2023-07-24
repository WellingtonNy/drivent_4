import Joi from "joi"

export const reservaSchema = Joi.object( 
    { 
        roomId:Joi.number().required()
     }
)