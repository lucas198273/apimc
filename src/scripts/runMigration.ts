import { migrarSenhasParaHash } from './migrarSenhas';

async function runMigration() {
  try {
    await migrarSenhasParaHash();
    console.log('Migração concluída!');
    process.exit(0); // encerra após terminar
  } catch (err) {
    console.error('Erro na migração:', err);
    process.exit(1);
  }
}

runMigration();
