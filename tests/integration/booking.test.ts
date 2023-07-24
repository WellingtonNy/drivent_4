import app, { init } from '@/app'
import supertest from 'supertest'
import * as jwt from 'jsonwebtoken'
import { cleanDb, generateValidToken } from '../helpers'
import faker from '@faker-js/faker'
import { criarReserva } from '../factories/booking-factory'
import httpStatus from 'http-status'
import { TicketStatus } from '@prisma/client'
import { createEnrollmentWithAddress, createHotel, createPayment, createRoomWithHotelId, createTicket, createTicketTypeWithHotel, createUser, } from '../factories'



beforeAll(async () => {
  await init()
})



beforeEach(async () => {
  await cleanDb()
})



const server = supertest(app)



describe('get', () => {



  it('401 - token invalido', async () => {
    const token = faker.lorem.word()
    const resposta = await server.get('/booking').set('Authorization', `Bearer ${token}`)
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
  })



  it('404 - sem reserva', async () => {
    const usuario = await createUser()
    const token = await generateValidToken(usuario)
    const enrollment = await createEnrollmentWithAddress(usuario)
    const tipoDeTicket = await createTicketTypeWithHotel()

    await createTicket(enrollment.id, tipoDeTicket.id, 'PAID')

    const resposta = await server.get('/booking').set('Authorization', `Bearer ${token}`)

    expect(resposta.status).toBe(httpStatus.NOT_FOUND)
  })



  it('401 - Sem token', async () => {
    const resposta = await server.get('/booking')
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
  })



  it('200 - retorna dados da reserva ao fazer reserva', async () => {
    const usuario = await createUser()
    const token = await generateValidToken(usuario)
    const enrollment = await createEnrollmentWithAddress(usuario)
    const ticketType = await createTicketTypeWithHotel()
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
    await createPayment(ticket.id, ticketType.price)
    const hotel = await createHotel()
    const quarto = await createRoomWithHotelId(hotel.id)
    const reserva = await criarReserva(quarto.id, usuario.id)
    const resposta = await server.get('/booking').set('Authorization', `Bearer ${token}`)
    expect(resposta.status).toBe(httpStatus.OK);
    expect(resposta.body).toEqual({
      id: reserva.id,
      Room: {
        id: quarto.id,
        name: quarto.name,
        capacity: quarto.capacity,
        hotelId: quarto.hotelId,
        createdAt: quarto.createdAt.toISOString(),
        updatedAt: quarto.updatedAt.toISOString()

      }
    })
  })



  it('401 token sem sessão', async () => {
    const usuarioSemSessao = await createUser()
    const token = jwt.sign({ userId: usuarioSemSessao.id }, process.env.JWT_SECRET)
    const resposta = await server.get('/booking').set('Authorization', `Bearer ${token}`)
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)

  })
})



describe('post', () => {



  it('401 - token fora da sessao', async () => {
    const usuarioSemSessao = await createUser()
    const token = jwt.sign({ userId: usuarioSemSessao.id }, process.env.JWT_SECRET)
    const resposta = await server.post('/booking').set('Authorization', `Bearer ${token}`)
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
  })



  it('401 - token invalido', async () => {
    const token = faker.lorem.word()
    const resposta = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
  })



  it('401- sem token', async () => {
    const resposta = await server.post('/booking')
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
  })



  describe('com token', () => {



    it('200 - retornar id quando tiver reserva ', async () => {
      const usuario = await createUser()
      const token = await generateValidToken(usuario)
      const inscricao = await createEnrollmentWithAddress(usuario)
      const tipoDeTicket = await createTicketTypeWithHotel()
      const ticket = await createTicket(inscricao.id, tipoDeTicket.id, TicketStatus.PAID)
      await createPayment(ticket.id, tipoDeTicket.price)
      const hotel = await createHotel()
      const quarto = await createRoomWithHotelId(hotel.id)
      const body = { roomId: quarto.id }
      const resposta = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body)
      expect(resposta.status).toBe(httpStatus.OK)
      expect(resposta.body).toEqual({
        bookingId: expect.any(Number)

      })
    })
  })
})



describe('put', () => {



  it('401- sem token', async () => {
    const resposta = await server.put('/booking/6')
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
  })



  it('401 - sem sessao para o token', async () => {
    const usuarioSemSessao = await createUser()
    const token = jwt.sign({ userId: usuarioSemSessao.id }, process.env.JWT_SECRET)
    const resposta = await server.put('/booking/1').set('Authorization', `Bearer ${token}`)
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED);
  })



  it('401- token invalido', async () => {
    const token = faker.lorem.word();
    const resposta = await server.put('/booking/1').set('Authorization', `Bearer ${token}`)
    expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
  })



  describe('com token valido', () => {



    it('200 - retornar dados quando houver reserva', async () => {
      const usuario = await createUser()
      const token = await generateValidToken(usuario)
      const enrollment = await createEnrollmentWithAddress(usuario)
      const tipoDeTicket = await createTicketTypeWithHotel()
      const ticket = await createTicket(enrollment.id, tipoDeTicket.id, 'PAID')
      await createPayment(ticket.id, tipoDeTicket.price)
      const hotel = await createHotel()
      const quarto = await createRoomWithHotelId(hotel.id)
      const reserva = await criarReserva(quarto.id, usuario.id)
      const quartoB = await createRoomWithHotelId(hotel.id)
      const body = { roomId: quartoB.id }
      const resposta = await server.put(`/booking/${reserva.id}`).set('Authorization', `Bearer ${token}`).send(body)
      expect(resposta.status).toBe(httpStatus.OK)
      expect(resposta.body).toEqual({
        bookingId: reserva.id

      })
    })
  })
})