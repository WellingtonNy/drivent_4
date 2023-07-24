
import { AuthenticatedRequest } from "@/middlewares"
import { Request, Response, NextFunction } from "express"
import bookingService from "../services/booking-service"


export async function quarto(req: AuthenticatedRequest, res: Response, next: NextFunction) {

    const { userId } = req
    try {
        const dados = await bookingService.quartoS(userId)
        return res.status(200).send(dados)
    } catch (error) {
        next(error)
    }
}



export async function reserva(req: AuthenticatedRequest, res: Response, next: NextFunction) {

    const { userId } = req
    const roomId = +(req.body.roomId)
    try {
        const dados = await bookingService.reservaS(userId, roomId)
        return res.status(200).send(dados)
    } catch (error) {
        next(error)
    }
}



export async function attQuarto(req: AuthenticatedRequest, res: Response, next: NextFunction) {

    const { userId } = req
    const idReserva = +(req.params.bookingId)
    const idQuarto = +(req.body.roomId)
    try {
   const dados = await bookingService.attQuartoS(userId, idReserva, idQuarto)
    return res.status(200).send(dados)
    } catch (error) {
        next(error)
    }
}