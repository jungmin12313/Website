import { build } from 'vite';

const oldExit = process.exit;
process.exit = function(code) {
  console.error("VITE TRIED TO EXIT WITH CODE:", code);
  console.trace();
  oldExit(code);
};

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

async function run() {
  try {
    const res = await build({
      logLevel: 'info',
    });
    console.log("BUILD COMPLETED WITH RESULT:", typeof res);
  } catch (err) {
    console.error("BUILD EXCEPTION", err);
  }
}
run();
