import { faker } from "@faker-js/faker";

export const users_data = {
    profileName: "Adoveo",
    message: "Hej! Det här är ett sms från Adoveo",
    campaign_id: faker.number.int({max: 100}),
    scheduledTime: faker.date.recent().toISOString(),
    data: [],
  };
  
  for (let i = 0; i < 2500; i++) {
    const fake_data = {
      name: faker.person.fullName(),
      phone: "+46735658307",
    };
    users_data.data.push(fake_data);
  }
  
