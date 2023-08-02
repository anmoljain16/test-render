const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    console.log("trying to fetch data");
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    // Your Puppeteer script code here
    await page.goto("https://ums.lpu.in/Placements/");

    await page.type("#txtUserName", "12006518");
    await page.type("#txtPassword", "Lords@123!");

    const searchResultSelector = "#Button1";
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    console.log("Logged in successfully");

    await page.goto("https://ums.lpu.in/Placements/frmPlacementDriveRegistration.aspx");

    let text = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("#ctl00_ContentPlaceHolder1_gdvPlacement tr"), (e) => {
        const tds = e.querySelectorAll("td");
        let jobProfileLinks = "none";

        const anchors = e.querySelectorAll("a");
        anchors.forEach((anchor) => {
          if (anchor.innerText === "See Job Profile") {
            jobProfileLinks = anchor.href;
          }
        });

        if (tds.length >= 8) {
          return {
            driveCode: tds[0].innerText,
            driveDate: tds[1].innerText,
            RegisterBy: tds[2].innerText,
            Company: tds[3].innerText,
            StreamEligible: tds[4].innerText,
            Venue: tds[5].innerText,
            JobProfile: jobProfileLinks,
            Status: tds[7].innerText,
          };
        } else {
          // Return a default value or handle the case where there are not enough td elements.
          return {
            driveCode: "",
            driveDate: "",
            RegisterBy: "",
            Company: "",
            StreamEligible: "",
            Venue: "",
            JobProfile: "",
            Status: "",
          };
        }
      });
    });

    await browser.close();

    res.json(text);
    console.log("fetching completed");
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
