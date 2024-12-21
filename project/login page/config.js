import dotenv from 'dotenv';
dotenv.config();
const config = {
    dbUser : process.env.DB_User,
    dbPassword : process.env.DB_Password,
    dbHost : process.env.DB_Host,
    dbName : process.env.DB_Name,
    dbPort : process.env.DB_Port,
    sessionSecret : process.env.Session_Secret
};
export default config;