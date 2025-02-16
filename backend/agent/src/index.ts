import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  defineDAINService,
  ToolConfig,
} from "@dainprotocol/service-sdk";
import { CardUIBuilder } from "@dainprotocol/utils";

// Define the input/output schema (no input needed)
const watchDutyScrapeInput = z.object({});
const watchDutyScrapeOutput = z.object({
  scrapedData: z.array(z.string()).describe("List of scraped text content from the site"),
});

// Function to scrape the specified class
async function scrapeWatchDuty() {
  const url = "https://app.watchduty.org/i/40335";
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // Scrape all elements with class "MuiCardContent-root css-1xmzr9g"
  const scrapedData = $(".MuiCardContent-root.css-1xmzr9g")
    .map((_, el) => $(el).text().trim()) // Extract text content
    .get(); // Convert to array

  return scrapedData;
}

// Define DAIN tool config
const watchDutyScrapeConfig: ToolConfig = {
  id: "watchduty-scrape",
  name: "WatchDuty Scraper",
  description: "Scrapes all elements with class MuiCardContent-root css-1xmzr9g from WatchDuty",
  
  input: watchDutyScrapeInput,
  output: watchDutyScrapeOutput,

  handler: async (_, agentInfo) => {
    try {
      const scrapedData = await scrapeWatchDuty();

      // Build a UI Card (optional)
      const cardUI = new CardUIBuilder()
        .title("WatchDuty Scrape Results")
        .content(`Scraped ${scrapedData.length} elements.`)
        .build();

      return {
        text: `Scraped ${scrapedData.length} elements from WatchDuty successfully!`,
        data: { scrapedData },
        ui: cardUI,
      };
    } catch (error) {
      console.error("WatchDuty scrape error:", error);
      return {
        text: "An error occurred while scraping WatchDuty",
        data: { scrapedData: [] },
        ui: new CardUIBuilder()
          .title("Error")
          .content("Failed to scrape WatchDuty. Please try again later.")
          .build()
      };
    }
  }
};

// 5. Define your DAIN service with the new tool
const dainService = defineDAINService({
  metadata: {
    title: "WatchDuty Service",
    description: "A DAIN service for scraping watchduty.org/i/40335",
    version: "1.0.0",
    author: "Your Name",
    tags: ["web-scraping", "watchduty"],
  },
  identity: {
    apiKey: process.env.DAIN_API_KEY,
  },
  tools: [watchDutyScrapeConfig],
});

// Start the service
dainService.startNode({ port: 2022 }).then(() => {
  console.log("DAIN Service is running on port 2022");
});
