import fs from "fs";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

//batch fetch requests and use promise.all to make this more efficient

const main = async () => {
  let publixStores = [];
  for (let i = 0; i < 10; i++) {
    try {
      //get html from website
      const response = await fetch(`https://www.publix.com/locations/${i}`);
      if (!response.ok) {
        throw new Error('error')
      }
      const body = await response.text();
      //extract html and parse
      const $ = cheerio.load(body);
      if(!$) {return null}
      const storeNumber = $(".store-details p")
        .text()
        .replace(/[^0-9]/gm, "");
      const phoneNumber = $(".contact-information a")
        .first()
        .attr("href")
        .replace(/(tel:)/, "");

      let storeAddress = $(".store-address").text().split("\n");
      storeAddress = storeAddress.filter((element) => element.trim() != "");

      const street = storeAddress[0].trim();
      const city = storeAddress[1].replace(",", "").trim();
      const stateAndZip = storeAddress[2]
        .split(/\s+/)
        .filter((el) => el.trim() !== "");
      const state = stateAndZip[0];
      const zip = stateAndZip[1];

      const publixStore = {
        store: storeNumber,
        address: {
          street: street,
          city: city,
          state: state,
          zip: zip,
        },
        phone: phoneNumber,
      };
      publixStores.push(publixStore);
    } catch (error) {
      console.log(`no store at ${i}`)
      publixStores.push(null);
    }
  }
  console.log(publixStores.filter(n=>n))
  // fs.writeFileSync("publixStores.json", JSON.stringify(publixStores));
};

main();
