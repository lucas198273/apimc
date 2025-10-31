"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrarSenhas_1 = require("./migrarSenhas");
async function runMigration() {
    try {
        await (0, migrarSenhas_1.migrarSenhasParaHash)();
        console.log('Migração concluída!');
        process.exit(0); // encerra após terminar
    }
    catch (err) {
        console.error('Erro na migração:', err);
        process.exit(1);
    }
}
runMigration();
//# sourceMappingURL=runMigration.js.map