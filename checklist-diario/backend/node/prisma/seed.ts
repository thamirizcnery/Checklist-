// Dados de exemplo para uso local. Só cria se ainda não houver nenhuma atividade.
// Rodar: docker compose exec api npm run seed
import { prisma } from '../src/shared/database/prisma.js';

const names = [
  'Beber 2 litros de água',
  'Ler os e-mails da manhã',
  'Revisar a agenda do dia',
  'Caminhar 30 minutos',
  'Registrar as horas trabalhadas',
];

const existing = await prisma.activity.count();
if (existing > 0) {
  process.stdout.write(`Já existem ${existing} atividades. Nada foi alterado.` + '\n');
} else {
  await prisma.activity.createMany({
    data: names.map((name, index) => ({ name, position: index + 1 })),
  });
  process.stdout.write(`${names.length} atividades de exemplo criadas.` + '\n');
}
await prisma.$disconnect();
