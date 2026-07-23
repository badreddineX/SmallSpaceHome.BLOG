const host = "smallspacehome.ca";
const key = "73336c6e688841b4bb0d5d674fa0ebda";
const keyLocation = `https://${host}/${key}.txt`;

const urlList = [
  "https://smallspacehome.ca/",
  "https://smallspacehome.ca/about/",
  "https://smallspacehome.ca/blog/",
  "https://smallspacehome.ca/blog/apartment-decor-ideas-on-a-budget/",
  "https://smallspacehome.ca/blog/apartment-decor-ideas/",
  "https://smallspacehome.ca/blog/cozy-winter-apartment-decor/",
  "https://smallspacehome.ca/blog/fall-apartment-decorating-ideas/",
  "https://smallspacehome.ca/blog/how-to-decorate-a-small-living-room/",
  "https://smallspacehome.ca/blog/how-to-make-a-small-room-look-bigger/",
  "https://smallspacehome.ca/blog/ikea-small-space-hacks/",
  "https://smallspacehome.ca/blog/january-reset-organization-ideas/",
  "https://smallspacehome.ca/blog/minimalist-small-apartment-ideas/",
  "https://smallspacehome.ca/blog/renter-friendly-apartment-decor-ideas/",
  "https://smallspacehome.ca/blog/small-apartment-bathroom-storage/",
  "https://smallspacehome.ca/blog/small-apartment-bedroom-storage-ideas/",
  "https://smallspacehome.ca/blog/small-apartment-home-office-ideas/",
  "https://smallspacehome.ca/blog/small-apartment-organization-ideas-on-a-budget/",
  "https://smallspacehome.ca/blog/small-apartment-organization/",
  "https://smallspacehome.ca/blog/small-bedroom-decor-ideas/",
  "https://smallspacehome.ca/blog/small-space-decorating/",
  "https://smallspacehome.ca/blog/small-space-furniture/",
  "https://smallspacehome.ca/blog/small-space-kitchen-organization/",
  "https://smallspacehome.ca/blog/small-space-living-room-ideas/",
  "https://smallspacehome.ca/blog/spring-cleaning-organization-tips/",
  "https://smallspacehome.ca/blog/storage-ideas-for-small-places/",
  "https://smallspacehome.ca/blog/studio-apartment-ideas/",
  "https://smallspacehome.ca/privacy-policy/",
  "https://smallspacehome.ca/terms/",
];

async function main() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  console.log("Status:", res.status);
  console.log(await res.text());
}

main();
