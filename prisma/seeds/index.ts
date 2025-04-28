import { seedPlaces } from './places.seeder';

export async function runAllSeeders() {
  await seedPlaces();
  // await seedUsers();
  // await seedVehicles();
}
