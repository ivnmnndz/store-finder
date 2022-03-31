import fs from "fs";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const main = async () => {
  let publixStores = [];
  for (let i = 0; i < 2000; i++) {
    try {
      //get html from website
      const response = await fetch(`https://www.publix.com/locations/${i}`);
      const body = await response.text();
      //extract html and parse
      const $ = cheerio.load(body);
      const storeNumber = $(".store-details p")
        .text()
        .replace(/[^0-9]/gm, "");
      const phoneNumber = $(".contact-information a")
        .first()
        .attr("href")
        .replace(/(tel:)/, "");
      let storeAddress = $(".store-address").text().split("\n");
      storeAddress = storeAddress.filter((el) => el.trim() != "");
      const street = storeAddress[0].trim();
      const city = storeAddress[1].replace(",", "").trim();
      const stateAndZip = storeAddress[2]
        .split(/\s+/)
        .filter((el) => el.trim() !== "");
      const state = stateAndZip[0];
      const zip = stateAndZip[1];
      //create store model
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
      //add to stores array
      publixStores.push(publixStore);
    } catch (error) {
      console.log(`no store at ${i}`);
      publixStores.push(null);
    }
  }
  //filter out nulls
  publixStores = publixStores.filter((n) => n);
  console.log(publixStores);
  fs.writeFileSync("publixStores.json", JSON.stringify(publixStores));
};

main();
