import { faker } from "@faker-js/faker";

export const users_data = {
    profileName: "Adoveo",
    message: "Hej! Det här är ett sms från Adoveo",
    scheduledTime: faker.date.recent().toISOString(),
    data: [],
  };
  
  for (let i = 0; i < 50; i++) {
    const fake_data = {
      name: faker.person.fullName(),
      phone: "+46735658307",
    };
    users_data.data.push(fake_data);
  }
  
