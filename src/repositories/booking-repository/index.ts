import { prisma } from "@/config";
import { Booking, Room } from "@prisma/client";



async function quartoUsuario(userId: number): Promise<{ Room: Room; id: number }> {

   const dados = await prisma.booking.findFirst({ select: { id: true, Room: true }, where: { userId } })
   return dados
}



async function registrarQuarto(userId: number, roomId: number): Promise<Booking> {

   return prisma.booking.create({ data: { roomId, userId } })
}

 

async function quarto(roomId: number): Promise <Room & { book: number }> {

   const book = await prisma.booking.count({ where: { roomId } })
   const quarto = await prisma.room.findUnique({ where: { id: roomId } });
   return quarto ? { ...quarto, book } : null
}



async function encontrarQuarto(bookingId: number): Promise<{ Room: Room; id: number }> {

   const resultado = await prisma.booking.findFirst({ select: { id: true, Room: true }, where: { id: bookingId } })
   return resultado
}



async function attRegistro(bookingId: number, roomId: number): Promise<void> {

   await prisma.booking.update({ where: { id: bookingId }, data: { roomId } })
}



const bookingRepository = {
   encontrarQuarto,
   quartoUsuario,
   registrarQuarto,
   attRegistro,
   quarto
}

export default bookingRepository