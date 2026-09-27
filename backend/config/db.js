import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const dataDir = path.join(process.cwd(), "data");
const backupFilePath = path.join(dataDir, "db_backup.json");

export const saveDiskBackup = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const collections = mongoose.connection.collections;
    const backupData = {};
    for (const name in collections) {
      const docs = await collections[name].find({}).toArray();
      if (docs && docs.length > 0) {
        backupData[name] = docs;
      }
    }
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf8");
  } catch (err) {
    // Silent catch
  }
};

export const restoreDiskBackup = async () => {
  try {
    if (!fs.existsSync(backupFilePath)) return;
    const raw = fs.readFileSync(backupFilePath, "utf8");
    if (!raw.trim()) return;
    const backupData = JSON.parse(raw);

    const db = mongoose.connection.db;
    if (!db) return;

    for (const name in backupData) {
      const docs = backupData[name];
      if (Array.isArray(docs) && docs.length > 0) {
        const cleanDocs = docs.map(doc => {
          const clean = { ...doc };
          if (clean._id) {
            if (typeof clean._id === "string" && clean._id.match(/^[0-9a-fA-F]{24}$/)) {
              clean._id = new mongoose.Types.ObjectId(clean._id);
            } else if (clean._id?.$oid) {
              clean._id = new mongoose.Types.ObjectId(clean._id.$oid);
            }
          }
          ["user", "primaryUser", "performedBy"].forEach(field => {
            if (clean[field]) {
              if (typeof clean[field] === "string" && clean[field].match(/^[0-9a-fA-F]{24}$/)) {
                clean[field] = new mongoose.Types.ObjectId(clean[field]);
              } else if (clean[field]?.$oid) {
                clean[field] = new mongoose.Types.ObjectId(clean[field].$oid);
              }
            }
          });
          return clean;
        });

        const collection = db.collection(name);
        await collection.deleteMany({});
        await collection.insertMany(cleanDocs);
      }
    }
    console.log("✅ Restored persistent database state from local disk backup.");
  } catch (err) {
    console.warn("Disk backup restore notice:", err.message);
  }
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/egram_panchayat";

  mongoose.set("bufferTimeoutMS", 3000);

  try {
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 1000
    });
    console.log("✅ Connected to MongoDB Atlas Cloud Database successfully!");
  } catch (err) {
    try {
      // Try local MongoDB on 127.0.0.1:27017
      await mongoose.connect("mongodb://127.0.0.1:27017/egram_panchayat", {
        serverSelectionTimeoutMS: 1000
      });
      console.log("✅ Connected to Local MongoDB server on port 27017!");
    } catch (localErr) {
      console.log("⚡ Cloud/Local DB offline. Active in Fast Persistence Mode (data/db_backup.json).");
    }
  }

  // Restore saved disk backup if available
  await restoreDiskBackup();

  // Schedule auto-save every 15 seconds
  setInterval(saveDiskBackup, 15000);

  // Auto-save on process termination
  process.on("SIGINT", async () => {
    await saveDiskBackup();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await saveDiskBackup();
    process.exit(0);
  });
};

export default connectDB;
