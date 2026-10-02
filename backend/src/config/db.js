const dns = require("dns");
const mongoose = require("mongoose");

const connectMongo = () => mongoose.connect(process.env.MONGO_URI);

const connectDB = async () => {
  try {
    let connection;

    try {
      connection = await connectMongo();
    } catch (error) {
      const isSrvDnsFailure =
        process.env.MONGO_URI?.startsWith("mongodb+srv://") &&
        error.message.includes("querySrv") &&
        error.message.includes("ECONNREFUSED");

      if (!isSrvDnsFailure) {
        throw error;
      }

      console.warn(
        "MongoDB SRV DNS lookup was refused. Retrying with public DNS resolvers..."
      );

      dns.setServers(["1.1.1.1", "8.8.8.8"]);
      connection = await connectMongo();
    }

    console.log(
      `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`
    );
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
