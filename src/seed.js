import { connectDb } from "./db.js";
import { ImputationCode } from "./models/ImputationCode.js";
import { User } from "./models/User.js";

const imputationSeeds = [
  { code3: 301, short: "BP", label: "Buizenpark" },
  { code3: 302, short: "LA", label: "Voorlassen" },
  { code3: 303, short: "BU", label: "Buigen" },
  { code3: 304, short: "MO", label: "Monteur" },
  { code3: 305, short: "OV", label: "Oven" },
  { code3: 306, short: "ST", label: "Stralen" },
  { code3: 307, short: "SC", label: "Schilderen" },
  { code3: 308, short: "HT", label: "Hydrotest" },
  { code3: 309, short: "CO", label: "Corrigeren" },
  { code3: 310, short: "KO", label: "Kotteren" },
  { code3: 311, short: "QC", label: "Quality Control" },
  { code3: 312, short: "VE", label: "Verpakking/Verzending" }
];

const userSeeds = [
  { fullName: "Milan Margetic", sapNumber: "446111", isAdmin: true },
  { fullName: "Sophie Janssen", sapNumber: "446112" },
  { fullName: "Lars Verbeek", sapNumber: "446113" },
  { fullName: "Nora Peeters", sapNumber: "446114" },
  { fullName: "Tom Wouters", sapNumber: "446115" },
  { fullName: "Eva Claes", sapNumber: "446116" },
  { fullName: "Ruben Diels", sapNumber: "446117" },
  { fullName: "Lotte Vandenberg", sapNumber: "446118" },
  { fullName: "Jonas De Smet", sapNumber: "446119" },
  { fullName: "Amelie Broeckx", sapNumber: "446120" }
];

async function seed() {
  await connectDb();

  for (const item of imputationSeeds) {
    await ImputationCode.updateOne(
      { code3: item.code3 },
      { $set: item, $setOnInsert: { active: true } },
      { upsert: true }
    );
  }

  for (const user of userSeeds) {
    await User.updateOne(
      { sapNumber: user.sapNumber },
      { $set: user, $setOnInsert: { isActive: true } },
      { upsert: true }
    );
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
