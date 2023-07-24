import { Router } from "express"
import { authenticateToken , validateBody } from "@/middlewares"
import { reservaSchema } from "../schemas/booking-schemas"
import { reserva, attQuarto, quarto } from "../controllers/booking-controller"

const bookingRoute = Router()

bookingRoute
 .all('/*', authenticateToken)
 .get('/', quarto)
 .post('/', validateBody(reservaSchema), reserva)
 .put('/:bookingId', validateBody(reservaSchema), attQuarto)

export  { bookingRoute }