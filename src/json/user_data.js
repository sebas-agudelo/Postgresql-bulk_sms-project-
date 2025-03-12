// import { faker } from "@faker-js/faker";

// export const users_data = {
//     profileName: faker.person.fullName(),
//     message: faker.lorem.sentence(),
//     scheduledTime: faker.date.recent().toISOString(),
//     data: [],
//   };
  
//   for (let i = 0; i < 10; i++) {
//     const fake_data = {
//       name: faker.person.fullName(),
//       phone: faker.phone.number(),
//     };
//     users_data.data.push(fake_data);
//   }
  
import { faker } from "@faker-js/faker";

export const users_data = {
  profileName: faker.person.fullName(),
  message: faker.lorem.sentence(),
  scheduledTime: faker.date.recent().toISOString(),
  data: [],
};

// Skapa 5 deltagare som lyckas
for (let i = 0; i < 8; i++) {
  users_data.data.push({
    name: faker.person.fullName(),
    phone: faker.phone.number(), 
  });
}

// 5 participant som misslyckas
for (let i = 0; i < 2; i++) {
  users_data.data.push({
    name: faker.color.hwb(),
    phone: faker.color.hwb()
  });
}
