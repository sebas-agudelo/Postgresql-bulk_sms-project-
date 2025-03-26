  import fetch from "node-fetch";
  import dotenv from "dotenv";
  import { URLSearchParams } from "url";
  import { updateSmsData } from "../db_insert/participants_update.js";

  dotenv.config();

  const auth = Buffer.from(
    process.env.ELKS_USERNAME + ":" + process.env.ELKS_PASSWORD
  ).toString("base64");

  export const sendSms = async (from, to, message, participant_id, dryrun = true) => {
    
    try {
      const formData = new URLSearchParams();
      formData.append("from", from);
      formData.append("to", to);
      formData.append("message", message);

      if (dryrun) {
        formData.append("dryrun", "yes");
      }

      const response = await fetch("https://api.46elks.com/a1/sms", {
        method: "POST",
        headers: {
          Authorization: "Basic " + auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        const estimated_cost = data.estimated_cost;
        const sms_parts = data.parts;
        const to = data.to;
        const participantId = participant_id;
        
        
        await updateSmsData(estimated_cost, sms_parts, to, participantId);

        console.log("SMS skickat till:", to, "Svar:", data);
      } else {
        const errorText = await response.text();
        console.error("Fel vid SMS-sändning. API svarade med:", errorText);
      }
    } catch (error) {
      console.error("Något har gått fel med sms utskicket ----> ", error);
    }
  };
