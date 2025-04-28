import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPlaces() {
  await prisma.place.createMany({
    data: [
      {
        name: 'Mall of Indonesia',
        placeType: 'mall',
        address: 'Jl. Boulevard Bar. Raya, Jakarta',
        latitude: -6.1501471,
        longitude: 106.9037089,
        contactNumber: '02145812345',
        email: 'info@moimall.com',
        description: 'Tempat belanja dan hiburan',
        totalCapacity: 300,
      },
      {
        name: 'Grand Indonesia',
        placeType: 'mall',
        address: 'Jl. MH Thamrin, Jakarta',
        latitude: -6.1954553,
        longitude: 106.8227453,
        contactNumber: '0212358001',
        email: 'contact@grandindo.com',
        description: 'Mall di pusat kota',
        totalCapacity: 500,
      },
    ],
  });

  console.log('✅ Places seeded!');
}
