import { faker } from "@faker-js/faker";

export const users_data = {
    profileName: faker.person.fullName(),
    message: faker.lorem.sentence(),
    scheduledTime: faker.date.recent().toISOString(),
    data: [],
  };
  
  for (let i = 0; i < 1; i++) {
    const fake_data = {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
    };
    users_data.data.push(fake_data);
  }
  
