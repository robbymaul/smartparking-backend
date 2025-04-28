import { runAllSeeders } from './seeds';

async function main() {
  await runAllSeeders();
}

main()
  .then(() => {
    console.log('🎉 All seeders completed');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Seeder failed', e);
    process.exit(1);
  });
