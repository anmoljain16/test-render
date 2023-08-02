const express = require("express");
const bodyParser = require('body-parser');
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  const chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

const app = express();
const PORT = process.env.PORT || 5000;
let browser;
let page;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

// CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Puppeteer launch options
let options = {};

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  options = {
    args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chrome.defaultViewport,
    executablePath:  chrome.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  };
}

// Login route
app.post("/api/login", async (req, res) => {
  const { id, password } = req.body;
  console.log(id, password);

  try {
    console.log("trying to log in");
    browser = await puppeteer.launch(options);
    page = await browser.newPage();
    await page.goto("https://ums.lpu.in/Placements/");

    await page.type("#txtUserName", id);
    await page.type("#txtPassword", password);

    const searchResultSelector = "#Button1";
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    console.log("Logged in successfully");
    // res.json("Logged in Successfully");
  } catch (error) {
    // res.json("error while login : ", error)
    console.log("error", error);
  }
});

// Drives route
app.get("/api/drives", async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error running Puppeteer:", error);
    res.status(500).json({ error: "Error running Puppeteer" });
  }
});

// Data route
app.get("/api/data", async (req, res) => {
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
  } catch (error) {
    console.error("Error running Puppeteer:", error);
    res.status(500).json({ error: "Error running Puppeteer" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
