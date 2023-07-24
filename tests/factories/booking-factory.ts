import { prisma } from '@/config'



export async function criarReserva(roomId: number, userId: number) {
  return prisma.booking.create(
    {
    data: {
      roomId,
      userId
    }
  })
}