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

  try {
    await mongoose.connect(primaryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000
    });
    console.log("✅ Connected to MongoDB Atlas Cloud Database successfully!");
  } catch (err) {
    console.log("⚡ Cloud DB offline/unreachable. Initializing Local Database Engine...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log("✅ Local Database Engine active with persistent disk backup (data/db_backup.json).");
    } catch (fallbackErr) {
      console.error("Failed to start MongoMemoryServer fallback:", fallbackErr.message);
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
