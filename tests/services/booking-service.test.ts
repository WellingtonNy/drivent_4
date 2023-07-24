import { init } from '@/app'
import { cleanDb } from '../helpers'
import ticketsRepository from '@/repositories/tickets-repository'
import enrollmentRepository from '@/repositories/enrollment-repository'
import faker from '@faker-js/faker'
import { createEnrollmentWithAddress, createHotel , createTicket, createTicketTypeRemote, createTicketTypeWithHotel, criarQuartoCheio, criarTicketSemHotel } from '../factories'
import bookingService from './booking-service'



beforeAll(async () => {
  await init()
  await cleanDb()
})



beforeEach(() => {
  jest.clearAllMocks()
})



describe('reservaS', () => {


  it('tiket de tipo remoto', async () => {
    const roomId = faker.datatype.number()
    const enrollment = await createEnrollmentWithAddress()
    const tipoDeTicket = await createTicketTypeRemote()
    const ticket = await createTicket(enrollment.id, tipoDeTicket.id, 'PAID')

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: tipoDeTicket });

    const promise = bookingService.reservaS(roomId, enrollment.userId);

    expect(promise).rejects.toEqual({
        name: 'reservaError',
        message: 'o ticket do usuario é invalido',
    })
  })

 

  it('inscrição não encontrada', async () => {
    const roomId = faker.datatype.number()
    const userId = faker.datatype.number()
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(null)
    const promise = bookingService.reservaS(roomId, userId)
    expect(promise).rejects.toEqual({
      name: 'reservaError',
      message: 'não foi possivel localizar o usuario'
    })
  })



  it('ticket não encontrado', async () => {
    const roomId = faker.datatype.number()
    const enrollment = await createEnrollmentWithAddress()
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment)
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(null)

    const promise = bookingService.reservaS(roomId, enrollment.userId)

    expect(promise).rejects.toEqual({
        name: 'reservaError',
        message: 'não foi possivel localizar o usuario',
    })
  })



  it('tiket não inclue hotel', async () => {
    const roomId = faker.datatype.number()
    const enrollment = await createEnrollmentWithAddress()
    const ticketType = await criarTicketSemHotel()
    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment);
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: ticketType })

    const promise = bookingService.reservaS(roomId, enrollment.userId)

    expect(promise).rejects.toEqual({
        name: 'reservaError',
        message: 'o ticket do usuario é invalido',
    })
  })
})



it('quarto cheio', async () => {
    const bookingId = faker.datatype.number()
    const enrollment = await createEnrollmentWithAddress()
    const ticketType = await createTicketTypeWithHotel()
    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID')
    const hotel = await createHotel()
    const userInRoom = await createEnrollmentWithAddress()
    const room = await criarQuartoCheio(hotel.id, userInRoom.userId)

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(enrollment)
    jest
      .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
      .mockResolvedValueOnce({ ...ticket, TicketType: ticketType })

    const promise = bookingService.attQuartoS(bookingId, room.id, enrollment.userId);

    expect(promise).rejects.toEqual({
      name: 'reservaError',
      message: 'não há vagas para esse quarto'
    })
  })