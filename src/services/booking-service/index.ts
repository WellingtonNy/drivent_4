import { Room } from "@prisma/client";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { notFoundError } from "@/errors";
import ticketsRepository from "@/repositories/tickets-repository";
import { reservaError } from "../../errors/booking-error";
import bookingRepository from "../../repositories/booking-repository";



  async function quartoS (userId: number): Promise<{ id: number; Room: Room }> {
 
    const usuario = await enrollmentRepository.findWithAddressByUserId(userId)
    if (!usuario) throw notFoundError()
      const ticketDoUsuario = await ticketsRepository.findTicketByEnrollmentId(usuario.id)
    if (!ticketDoUsuario) throw notFoundError()
    const dados = await bookingRepository.quartoUsuario(userId)
    if (!dados) throw notFoundError()
    return dados
  }
 


async function reservaS (userId: number, roomId: number): Promise<{ bookingId: number }> {

    const usuario = await enrollmentRepository.findWithAddressByUserId(userId) 
    if (!usuario) { throw reservaError('não foi possivel localizar o usuario') }

    const ticketDoUsuario = await ticketsRepository.findTicketByEnrollmentId(usuario.id)
    if (!ticketDoUsuario.TicketType.includesHotel || ticketDoUsuario.TicketType.isRemote || ticketDoUsuario.status === 'RESERVED' || !ticketDoUsuario ) { throw reservaError("o ticket do usuario é invalido") }

    const reservaQuarto = await bookingRepository.quarto(roomId)
    if (!reservaQuarto) { throw notFoundError()}

    if (!(reservaQuarto.capacity > reservaQuarto.book)) {
    throw reservaError("não há vagas para esse quarto")
    }
     const dados = await bookingRepository.registrarQuarto(userId, roomId);
     return { bookingId: dados.id }
  }

 
 
  async function attQuartoS (userId: number, idReserva: number, idQuarto: number): Promise<{ bookingId: number }> {
 
    const usuario = await enrollmentRepository.findWithAddressByUserId(userId) 
    if (!usuario) { throw reservaError("não foi possivel localizar o usuario") }

    const ticketDoUsuario = await ticketsRepository.findTicketByEnrollmentId(usuario.id)
    if (!ticketDoUsuario.TicketType.includesHotel || ticketDoUsuario.TicketType.isRemote || ticketDoUsuario.status === 'RESERVED' || !ticketDoUsuario ) { throw reservaError("o ticket do usuario é invalido") }
  
    const reserva = await bookingRepository.encontrarQuarto(idReserva)
    if (!reserva) throw reservaError("sem reserva anterior")
 
    const dados = await bookingRepository.quarto(idQuarto)
    if (!dados) throw notFoundError()
    if (!(dados.book < dados.capacity)) throw reservaError('Not found')
    await bookingRepository.attRegistro(reserva.id, dados.id)
    return { bookingId: reserva.id }
  }
 
  const bookingService = {
    attQuartoS,
    reservaS,
    quartoS
  }
 
  export default bookingService