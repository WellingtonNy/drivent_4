import { ApplicationError } from "@/protocols"
 

export function reservaError (message = 'Erro de Reserva'): ApplicationError {
     return {name: 'reservaError',message}
  }

