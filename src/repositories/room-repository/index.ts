import { prisma } from '@/config'



async function acharQuartoPorId(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
    include: {
      Booking: true,
    },
  })}

const quartoR = {
  acharQuartoPorId,
};


export default quartoR