export const PROCEDURE_WOLFEK_TRANSITION = {
  duration: 3,
  times: [0, .2, .4, .46, .53, .76, 1],
  ease: 'easeInOut' as const,
}

export const PROCEDURE_WOLFEK_FLINCH = {
  x: [0, 0, -3, -7, -4, -2, 0],
  y: [0, 0, 0, -3, 1, 0, 0],
  rotate: [0, 0, -3, -7, -3, -1, 0],
}

export const PROCEDURE_WOLFEK_SYRINGE = {
  x: [32, 32, -2, -2, 2, -48, -48],
  opacity: [0, 0, 1, 1, 1, 1, 1],
  y: [6, 2, 0, 0, 2, 27, 24],
  rotate: [8, 0, -4, -4, 0, -50, -45],
}
